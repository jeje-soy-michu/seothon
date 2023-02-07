import { component$ } from "@builder.io/qwik"
import Word from "~/components/analyzer/post/word"

type Props = {
  line: string
}

export default component$(({line}: Props) => {
  const words = line.split(' ').map((w, i) => ({word: w, key: i}))

  return (
    <div class="flex flex-wrap justify-left whitespace-pre">
      {!line && <br />}
      {words.map(({key, word}) => <Word key={key} word={word} />)}
    </div>
  )
})
