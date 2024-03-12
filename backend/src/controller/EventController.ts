import { AppDataSource } from "../data-source";
import { Response } from "express";
import { Character } from "../entity/Character";
import { Event, EventType } from "../entity/Event";
import { Range } from "../entity/Range";
import { Between, LessThan, MoreThan } from "typeorm";
import { DateTime, Duration, Interval } from "luxon";
import { SpannerLevelTable } from "../util/spannerLevelTable";
import {
  EventCreate,
  EventDelete,
  EventQuery,
} from "../validator/EventValidators";
import { ReqBody, ReqQuery } from "../util/reqTypes";

export class EventController {
  private eventRepository = AppDataSource.getRepository(Event);
  private charRepository = AppDataSource.getRepository(Character);
  private rangeRepository = AppDataSource.getRepository(Range);

  async query(req: ReqQuery<EventQuery>) {
    const q = req.query;
    const findArgs: any = {
      id: q.id,
      order: q.order,
      characterId: q.characterId,
    };

    if (q.timeStart && q.timeEnd) {
      findArgs.toTime = Between(q.timeStart, q.timeEnd);
    } else {
      if (q.timeStart) {
        findArgs.toTime = MoreThan(q.timeStart);
      }
      if (q.timeEnd) {
        findArgs.toTime = LessThan(q.timeEnd);
      }
    }

    if (q.orderStart && q.orderEnd) {
      findArgs.order = Between(q.orderStart, q.orderEnd);
    } else {
      if (q.orderStart) {
        findArgs.order = MoreThan(q.orderStart);
      }
      if (q.orderEnd) {
        findArgs.order = LessThan(q.orderEnd);
      }
    }

    return this.eventRepository.findBy(findArgs);
  }

  async create(req: ReqBody<EventCreate>, res: Response) {
    const q = req.body;

    const parsedTime = DateTime.fromISO(q.time, { zone: "UTC" });
    const char = await this.charRepository.findOneBy({ id: q.characterId });

    if (!char) {
      res.statusCode = 400;
      return `no char found for id ${q.characterId}`;
    }

    // May all be modified depending on event type
    let eventOrder = char.nextSpanOrder;
    let rangeOrder = char.nextRangeOrder;
    let age = char.age;
    let remainingSpan = char.remainingSpan;
    let secondEvent = new Event();

    const lastEvent = await this.eventRepository.findOne({
      where: {
        characterId: q.characterId,
      },
      order: {
        order: "DESC",
      },
    });

    if (lastEvent) {
      // Calculate age increment for char
      const start = DateTime.fromJSDate(lastEvent.time, { zone: "UTC" });
      const end = parsedTime;

      const addedAge = Interval.fromDateTimes(start, end).toDuration();

      age = age.plus(addedAge);
    } else {
      // First event should be 'birth' type to establish age
      if (q.type !== EventType.Birth) {
        res.statusCode = 400;
        return `first event for char ${q.characterId} should be type 'birth'`;
      }
    }

    let lastRange = await this.rangeRepository.findOne({
      where: {
        characterId: q.characterId,
      },
      order: {
        order: "DESC",
      },
    });

    if (lastRange) {
      // Extend current range for new event
      await this.rangeRepository.update(
        {
          id: lastRange.id,
        },
        {
          timerange: lastRange.timerange.set({ end: parsedTime }),
        },
      );
    } else {
      // Create initial range if one doesn't exist
      lastRange = this.rangeRepository.merge(new Range(), q, {
        timerange: Interval.fromDateTimes(parsedTime, parsedTime),
        order: rangeOrder,
      });
      await this.rangeRepository.save(lastRange);
      rangeOrder += 1;
    }

    // Event type handlers
    switch (q.type) {
      case EventType.RestEnd: {
        // If char finished resting, reset remaining span
        remainingSpan = SpannerLevelTable[char.spannerLevel];

        break;
      }
      case EventType.LocationChange: {
        secondEvent = this.eventRepository.create({
          fromLocation: q.location,
        });

        // Create new range
        lastRange = this.rangeRepository.merge(new Range(), q, {
          timerange: Interval.fromDateTimes(parsedTime, parsedTime),
          location: q.toLocation,
          timezone: q.toTimezone,
          order: rangeOrder,
        });
        await this.rangeRepository.save(lastRange);
        rangeOrder += 1;

        break;
      }
      case EventType.SpanTime: {
        // Create time travel "from" event
        const fromEvent = this.eventRepository.merge(new Event(), q, {
          charAge: age,
          charRemainingSpan: remainingSpan,
          charSpannerLevel: char.spannerLevel,
          order: eventOrder,
          rangeId: lastRange.id,
        });
        await this.eventRepository.save(fromEvent);
        eventOrder += 1;

        // Calculate reminaing span
        const parsedToTime = DateTime.fromISO(q.toTime!, { zone: "UTC" });

        let spanUsed: Duration;
        if (parsedTime < parsedToTime) {
          // Span Up...
          spanUsed = Interval.fromDateTimes(
            parsedTime,
            parsedToTime,
          ).toDuration();
        } else {
          // Span Down
          spanUsed = Interval.fromDateTimes(
            parsedToTime,
            parsedTime,
          ).toDuration();
        }

        remainingSpan = remainingSpan.minus(spanUsed);

        // Args for time travel "to" event
        secondEvent = this.eventRepository.create({
          time: q.toTime,
          fromTime: q.time,
          timezone: q.toTimezone,
          fromTimezone: q.timezone,
          location: q.toLocation,
          fromLocation: q.location,
        });

        // Create new range
        lastRange = this.rangeRepository.merge(new Range(), q, {
          timerange: Interval.fromDateTimes(parsedToTime, parsedToTime),
          location: q.toLocation,
          timezone: q.toTimezone,
          order: rangeOrder,
        });
        await this.rangeRepository.save(lastRange);
        rangeOrder += 1;

        break;
      }
    }

    // Create event
    const event = this.eventRepository.merge(
      new Event(),
      q,
      {
        charAge: age,
        charRemainingSpan: remainingSpan,
        charSpannerLevel: char.spannerLevel,
        order: eventOrder,
        rangeId: lastRange.id,
      },
      secondEvent,
    );
    await this.eventRepository.save(event);
    eventOrder += 1;

    // Apply character updates
    await this.charRepository.update(
      {
        id: q.characterId,
      },
      {
        nextSpanOrder: eventOrder,
        nextRangeOrder: rangeOrder,
        age: age,
        remainingSpan: remainingSpan,
      },
    );

    return event;
  }

  async remove(req: ReqBody<EventDelete>) {
    const q = req.body;
    const char = await this.charRepository.findOneBy({ id: q.characterId });

    if (!char) {
      return `no char found for id ${q.characterId}`;
    }

    const spansToRemove = await this.eventRepository.find({
      order: {
        order: "DESC",
      },
      take: q.count,
    });

    await this.eventRepository.remove(spansToRemove);

    return `removed ${spansToRemove.length} spans for ${q.characterId}`;
  }
}
