import { AppDataSource } from "../data-source";
import { ReqQuery } from "../util/reqTypes";
import { Range } from "../entity/Range";
import { RangeQuery } from "../validator/RangeValidators";
import { DateTime, Interval } from "luxon";
import {
  InfiniteRangeType,
  infiniteIntervalToPg,
  intervalToPg,
} from "../util/pgUtils";

export class RangeController {
  private rangeRepository = AppDataSource.getRepository(Range);

  async query(req: ReqQuery<RangeQuery>) {
    const q = req.query;

    // Let's get crazy with querybuilder
    const qb = this.rangeRepository.createQueryBuilder("range");

    // Easy ones first
    if (q.id) {
      qb.andWhere("range.id = :id", { id: q.id });
    }
    if (q.characterId) {
      qb.andWhere("range.characterId = :characterId", {
        characterId: q.characterId,
      });
    }
    if (q.location) {
      qb.andWhere("range.location = :location", { location: q.location });
    }

    // Does range contain point in time
    if (q.time) {
      const time = DateTime.fromISO(q.time).toUTC().toSQL();
      qb.andWhere("range.timerange @> :time::timestamp", {
        time,
      });
    }

    // The fun one - get ranges within range specified in query
    if (q.timeStart && q.timeEnd) {
      const start = DateTime.fromISO(q.timeStart);
      const end = DateTime.fromISO(q.timeEnd);
      const timeRange = intervalToPg(Interval.fromDateTimes(start, end));
      qb.andWhere("range.timerange && :timeRange::tsrange", {
        timeRange,
      });
    } else {
      if (q.timeStart) {
        const start = DateTime.fromISO(q.timeStart);
        const timeRange = infiniteIntervalToPg(
          start,
          InfiniteRangeType.StartDefined,
        );
        qb.andWhere("range.timerange && :timeRange::tsrange", {
          timeRange,
        });
      }
      if (q.timeEnd) {
        const end = DateTime.fromISO(q.timeEnd);
        const timeRange = infiniteIntervalToPg(
          end,
          InfiniteRangeType.EndDefined,
        );
        qb.andWhere("range.timerange && :timeRange::tsrange", {
          timeRange,
        });
      }
    }

    const range = await qb.getMany();

    return range;
  }
}
