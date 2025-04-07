/**
 * Checks whether the value is part of the provided enum.
 */
export function inEnum<TEnum extends object>(
  val: string | number | symbol,
  e: TEnum
): val is keyof TEnum {
  return val in e;
}
