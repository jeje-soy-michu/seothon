import { component$ } from "@builder.io/qwik"
import Word from "~/components/analyzer/post/word"

type Props = {
  line: string
}

export default component$(({line}: Props) => {
  return (
    <div class="flex flex-wrap justify-left whitespace-pre">
      {!line && <br />}
      {line.split(' ').map((word, index) => <Word key={index} word={word} />)}
    </div>
  )
})
