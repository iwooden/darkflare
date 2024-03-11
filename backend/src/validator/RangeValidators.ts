import { z } from "zod"
import { body, query } from "../util/validationFormatters"

const RangeQuery = z.object({
    id: z.coerce.number().optional(),
    characterId: z.number().optional()
}).strict()
export const RangeQueryValidator = query(RangeQuery)
export type RangeQuery = z.infer<typeof RangeQuery>
