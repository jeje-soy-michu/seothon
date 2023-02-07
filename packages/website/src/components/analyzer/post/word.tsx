import { component$, useClientEffect$, useSignal, useStylesScoped$ } from "@builder.io/qwik"
import { useWordAnalysis } from "~/components/analyzer/hooks/useWordAnalysis"
import styles from '~/components/analyzer/post/word.css?inline'

type Props = {
  word: string
}

export default component$(({word}: Props) => {
  useStylesScoped$(styles)
  const wordAnalysis = useWordAnalysis(word)
  const score = useSignal<number>(0)
  const tip = useSignal<string>('')

  useClientEffect$(({track}) => {
    track(() => wordAnalysis.value)

    if (!wordAnalysis.value || isNaN(wordAnalysis.value.score)) return

    const newScore = Math.round(wordAnalysis.value.score * 10)

    if (newScore !== score.value) score.value = newScore
  })

  useClientEffect$(({track}) => {
    track(() => wordAnalysis.value)

    if (!wordAnalysis.value || !wordAnalysis.value.queries) return

    tip.value = wordAnalysis.value.queries.map(query => `${query.query} (Similarity: ${query.similarity})`).join('\n')
  })

  return (
    <div class="tooltip tooltip-accent" data-tip={`Score ${score.value}\n${tip.value}`}>
      {word && <span class={`score-${score.value}`}>{word} </span>}
    </div>
  )
})
