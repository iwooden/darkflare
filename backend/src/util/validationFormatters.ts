import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodEffects, z } from "zod";

// ZodEffects<any> type necessary due to refine/superRefine
export const query = (o: AnyZodObject | ZodEffects<any>) => {
  return z.object({
    query: o,
  });
};

export const body = (o: AnyZodObject | ZodEffects<any>) => {
  return z.object({
    body: o,
  });
};

export const params = (o: AnyZodObject | ZodEffects<any>) => {
  return z
    .object({
      params: o,
    })
    .strict();
};

// Generic Zod validator middleware
export const zodValidate =
  (schema: any) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema) {
        await schema.parseAsync({
          body: req.body,
          query: req.query,
          params: req.params,
        });
      }
      return next();
    } catch (error) {
      return res.status(400).json(error);
    }
  };

export const mustInclude = (o: any, ctx: z.RefinementCtx, params: string[]) => {
  params.forEach((param) => {
    if (!o[param]) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Must specify ${param} when eventType is ${o.type}`,
        path: [param],
      });
    }
  });
};

export const mustNotInclude = (
  o: any,
  ctx: z.RefinementCtx,
  params: string[],
) => {
  params.forEach((param) => {
    if (o[param]) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Must not specify ${param} when eventType is ${o.type}`,
        path: [param],
      });
    }
  });
};
