import { z } from "zod";
import { query } from "../util/validationFormatters";

const RangeQuery = z
  .object({
    id: z.coerce.number().optional(),
    characterId: z.coerce.number().optional(),
    location: z.string().optional(),
    time: z.string().datetime().optional(),
    timeStart: z.string().datetime().optional(),
    timeEnd: z.string().datetime().optional(),
  })
  .strict();
export const RangeQueryValidator = query(RangeQuery);
export type RangeQuery = z.infer<typeof RangeQuery>;
