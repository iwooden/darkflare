import { z } from "zod";
import { body, query } from "../util/validationFormatters";

const PartyQuery = z
  .object({
    id: z.coerce.number().optional(),
    name: z.string().optional(),
  })
  .strict();
export const PartyQueryValidator = query(PartyQuery);
export type PartyQuery = z.infer<typeof PartyQuery>;

const PartyCreate = z
  .object({
    name: z.string(),
  })
  .strict();
export const PartyCreateValidator = body(PartyCreate);
export type PartyCreate = z.infer<typeof PartyCreate>;

const PartyDelete = z
  .object({
    id: z.number(),
  })
  .strict();
export const PartyDeleteValidator = body(PartyDelete);
export type PartyDelete = z.infer<typeof PartyDelete>;
