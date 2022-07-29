import React, { useEffect } from 'react'
import { render } from '@regexper/render'

export default function HomePage() {
  useEffect(() => {
    const container = document.getElementById('svg')!
    render(
      // 'A literal example', // Literals
      // /\w\x7f\u00bb\1\0/, // Escape sequences
      '.', // Any character
      // /[#a-z\n][^$0-9\b]/, // Character Sets
      // /(example\s)(?=content)/, // Subexpressions
      // /one\s|two\W|three\t|four\n/, // Alternation
      // /(?:greedy)*/, // Greedy quantifier
      // /(?:non-greedy)*?/, // Non-greedy quantifier
      // /(?:greedy)+/,
      // /(?:non-greedy)+?/,
      // /(?:greedy)?/,
      // /(?:greedy)??/,
      // /(?:greedy){5,10}/,
      // /(?:non-greedy){5,10}?/,
      // "/^[a-zA-Z0-9.! #$%&'*+/=? ^_`{|}~-]+@[a-zA-Z0-9-]+(?:. [a-zA-Z0-9-]+)*$/gi",
      // '/^b(a)??(kr)+$/ig',
      // '/^foo[0-3][^18]|b(a)??(kr)+$/ig',
      // '/^foo[0-9][^18]|ba(r(k)+){1,3}$/igiggg',
      container,
    )
  })
  return <svg id="svg"></svg>
}
