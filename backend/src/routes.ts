import { CharacterController } from "./controller/CharacterController";
import { PartyController } from "./controller/PartyController";
import { EventController } from "./controller/EventController";
import {
  PartyCreateValidator,
  PartyDeleteValidator,
  PartyQueryValidator,
} from "./validator/PartyValidators";
import {
  CharCreateValidator,
  CharDeleteValidator,
  CharQueryValidator,
  CharUpdateValidator,
} from "./validator/CharacterValidators";
import {
  EventCreateValidator,
  EventDeleteValidator,
  EventQueryValidator,
} from "./validator/EventValidators";
import { RangeController } from "./controller/RangeController";
import { RangeQueryValidator } from "./validator/RangeValidators";

export const Routes = [
  // event routes
  {
    method: "get",
    route: "/events",
    controller: EventController,
    action: "query",
    validator: EventQueryValidator,
  },
  {
    method: "post",
    route: "/events",
    controller: EventController,
    action: "create",
    validator: EventCreateValidator,
  },
  {
    method: "post",
    route: "/events/remove",
    controller: EventController,
    action: "remove",
    validator: EventDeleteValidator,
  },

  // char routes
  {
    method: "get",
    route: "/chars",
    controller: CharacterController,
    action: "query",
    validator: CharQueryValidator,
  },
  {
    method: "post",
    route: "/chars",
    controller: CharacterController,
    action: "create",
    validator: CharCreateValidator,
  },
  {
    method: "post",
    route: "/chars/remove",
    controller: CharacterController,
    action: "remove",
    validator: CharDeleteValidator,
  },
  {
    method: "patch",
    route: "/chars",
    controller: CharacterController,
    action: "update",
    validator: CharUpdateValidator,
  },

  // party routes
  {
    method: "get",
    route: "/parties",
    controller: PartyController,
    action: "query",
    validator: PartyQueryValidator,
  },
  {
    method: "post",
    route: "/parties",
    controller: PartyController,
    action: "create",
    validator: PartyCreateValidator,
  },
  {
    method: "post",
    route: "/parties/remove",
    controller: PartyController,
    action: "remove",
    validator: PartyDeleteValidator,
  },

  // range routes
  {
    method: "get",
    route: "/ranges",
    controller: RangeController,
    action: "query",
    validator: RangeQueryValidator,
  },
];
