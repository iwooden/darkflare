import { Request } from "express"

export type ReqBody<T> = Request<unknown, unknown, T, unknown>

export type ReqQuery<T> = Request<unknown, unknown, unknown, T>
