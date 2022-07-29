export function toHex(value: any) {
  let str = value.toString(16).toUpperCase()

  if (str.length < 2) {
    str = `0${str}`
  }

  return `(0x${str})`
}

// Escape code mappings
export const CODE_MAPPING = {
  b: ['word boundary', -1, false],
  B: ['non-word boundary', -1, false],
  d: ['digit', -1, false],
  D: ['non-digit', -1, false],
  f: ['form feed', 0x0c, true],
  n: ['line feed', 0x0a, true],
  r: ['carriage return', 0x0d, true],
  s: ['white space', -1, false],
  S: ['non-white space', -1, false],
  t: ['tab', 0x09, true],
  v: ['vertical tab', 0x0b, true],
  w: ['word', -1, false],
  W: ['non-word', -1, false],
  1: ['Back reference (group = 1)', -1, false],
  2: ['Back reference (group = 2)', -1, false],
  3: ['Back reference (group = 3)', -1, false],
  4: ['Back reference (group = 4)', -1, false],
  5: ['Back reference (group = 5)', -1, false],
  6: ['Back reference (group = 6)', -1, false],
  7: ['Back reference (group = 7)', -1, false],
  8: ['Back reference (group = 8)', -1, false],
  9: ['Back reference (group = 9)', -1, false],
  0(arg: string) {
    if (arg) {
      return [`octal: ${arg}`, parseInt(arg, 8), true]
    }
    return ['null', 0, true]
  },
  c(arg: string) {
    return [
      `ctrl-${arg.toUpperCase()}`,
      arg.toUpperCase().charCodeAt(0) - 64,
      true,
    ]
  },
  x(arg: string) {
    return [`0x${arg.toUpperCase()}`, parseInt(arg, 16), false]
  },
  u(arg: string) {
    return [`U+${arg.toUpperCase()}`, parseInt(arg, 16), false]
  },
}

export type Code = keyof typeof CODE_MAPPING

export function getCodeData(
  mapping: typeof CODE_MAPPING,
  code: Code,
  arg: string,
) {
  const raw = mapping[code]
  const ret = typeof raw === 'function' ? raw(arg) : raw
  return ret as [string, number, boolean]
}
