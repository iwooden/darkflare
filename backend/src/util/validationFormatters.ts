import { AnyZodObject, ZodEffects, z } from "zod";

// The ZodEffects<any> type is because we might have called refine
export const query = (o: AnyZodObject | ZodEffects<any>) => {
    return z.object({
        query: o
    })
}

export const body = (o: AnyZodObject | ZodEffects<any>) => {
    return z.object({
        body: o
    })
}

export const params = (o: AnyZodObject | ZodEffects<any>) => {
    return z.object({
       params: o
    }).strict()
}
