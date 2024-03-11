import { NextFunction, Request, Response } from "express";
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

// Generic Zod validator middleware
export const zodValidate = (schema: any) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (schema) {
                await schema.parseAsync({
                    body: req.body,
                    query: req.query,
                    params: req.params,
                })
            }
            return next();
        } catch (error) {
            return res.status(400).json(error);
        }
    };
