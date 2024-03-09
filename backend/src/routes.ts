import { CharacterController } from "./controller/CharacterController"
import { PartyController } from "./controller/PartyController"
import { EventController } from "./controller/EventController"

export const Routes = [
    // span routes
    {
        method: "get",
        route: "/spans",
        controller: EventController,
        action: "query"
    }, {
        method: "post",
        route: "/spans",
        controller: EventController,
        action: "create"
    }, {
        method: "post",
        route: "/spans/remove",
        controller: EventController,
        action: "remove"
    },

    // char routes
    {
        method: "get",
        route: "/chars",
        controller: CharacterController,
        action: "query"
    }, {
        method: "post",
        route: "/chars",
        controller: CharacterController,
        action: "create"
    }, {
        method: "post",
        route: "/chars/remove",
        controller: CharacterController,
        action: "remove"
    }, {
        method: "patch",
        route: "/chars",
        controller: CharacterController,
        action: "update"
    },

    // party routes
    {
        method: "get",
        route: "/parties",
        controller: PartyController,
        action: "query"
    }, {
        method: "post",
        route: "/parties",
        controller: PartyController,
        action: "create"
    }, {
        method: "post",
        route: "/parties/remove",
        controller: PartyController,
        action: "remove"
    },
]
