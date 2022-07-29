import { RepeatAny } from './repeat-any'
import { RepeatOptional } from './repeat-optional'
import { RepeatRequired } from './repeat-required'
import { RepeatSpec } from './repeat-spec'

type Extension = { [key: string]: any }
export type Extensions = {
  Root?: Extension
  Regexp?: Extension
  Match?: Extension
  MatchFragment?: Extension
  Repeat?: Extension
  RepeatAny?: Extension
  RepeatRequired?: Extension
  RepeatOptional?: Extension
  RepeatSpec?: Extension
  Anchor?: Extension
  Subexp?: Extension
  Charset?: Extension
  CharsetRange?: Extension
  CharsetEscape?: Extension
  Escape?: Extension
  Literal?: Extension
  AnyCharacter?: Extension
}

export function getExtensions(): Extensions {
  return {
    Root: { type: 'root' },
    Regexp: { type: 'regexp' },
    Match: { type: 'match' },
    MatchFragment: { type: 'match-fragment' },
    Repeat: { type: 'repeat' },
    RepeatSpec,
    RepeatAny,
    RepeatOptional,
    RepeatRequired,
    Anchor: { type: 'anchor' },
    Subexp: { type: 'subexp' },
    Charset: { type: 'charset' },
    CharsetRange: { type: 'charset-range' },
    CharsetEscape: { type: 'charset-escape' },
    Escape: { type: 'escape' },
    Literal: { type: 'literal' },
    AnyCharacter: { type: 'any-character' },
  }
}
