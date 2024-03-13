/* eslint-disable  @typescript-eslint/no-explicit-any */
export const timeZoneSet = new Set(
  (Intl as any).supportedValuesOf("timeZone"),
) as Set<string>;
