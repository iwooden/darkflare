import { z } from "zod"
import { body, query } from "../util/validationFormatters"

const CharQuery = z.object({
    id: z.coerce.number().optional(),
    name: z.string().optional()
}).strict()
export const CharQueryValidator = query(CharQuery)
export type CharQuery = z.infer<typeof CharQuery>

const CharCreate = z.object({
    partyId: z.number(),
    name: z.string(),
    spannerLevel: z.number().optional()
}).strict()
export const CharCreateValidator = body(CharCreate)
export type CharCreate = z.infer<typeof CharCreate>

const CharDelete = z.object({
    id: z.number()
}).strict()
export const CharDeleteValidator = body(CharDelete)
export type CharDelete = z.infer<typeof CharDelete>

const CharUpdate = z.object({
    id: z.number(),
    name: z.string(),
    spannerLevel: z.number().optional()
}).strict()
export const CharUpdateValidator = body(CharUpdate)
export type CharUpdate = z.infer<typeof CharUpdate>
