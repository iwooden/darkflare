import { AnyZodObject, z } from "zod";

export const query = (o: AnyZodObject) => {
    return z.object({
       query: o
    })
}

export const body = (o: AnyZodObject) => {
    return z.object({
       body: o
    })
}

export const params = (o: AnyZodObject) => {
    return z.object({
       params: o
    })
}
