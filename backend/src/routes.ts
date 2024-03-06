import { CharacterController } from "./controller/CharacterController"
import { SpanController } from "./controller/SpanController"

export const Routes = [
    // span routes
    {
        method: "get",
        route: "/spans",
        controller: SpanController,
        action: "query"
    }, {
        method: "post",
        route: "/spans",
        controller: SpanController,
        action: "create"
    }, {
        method: "post",
        route: "/spans/remove",
        controller: SpanController,
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
    },
]
