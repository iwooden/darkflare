import { z } from "zod";
import { body, query } from "../util/validationFormatters";

const UniverseQuery = z
  .object({
    id: z.coerce.number().optional(),
    name: z.string().optional(),
  })
  .strict();
export const UniverseQueryValidator = query(UniverseQuery);
export type UniverseQuery = z.infer<typeof UniverseQuery>;

const UniverseCreate = z
  .object({
    name: z.string(),
    description: z.string().optional(),
  })
  .strict();
export const UniverseCreateValidator = body(UniverseCreate);
export type UniverseCreate = z.infer<typeof UniverseCreate>;

const UniverseDelete = z
  .object({
    id: z.number(),
  })
  .strict();
export const UniverseDeleteValidator = body(UniverseDelete);
export type UniverseDelete = z.infer<typeof UniverseDelete>;
