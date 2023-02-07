import { component$, useClientEffect$, useSignal } from "@builder.io/qwik"
import { useAnalyzerContext } from "~/components/analyzer/hooks/useAnalyzerContext"
import Line from "~/components/analyzer/post/line"

export const TextAnalyzer = component$(() => {
  const context = useAnalyzerContext()
  const lines = useSignal(context.post.split("\n").map((l, i) => ({line: l, key: i})))

  useClientEffect$(({track}) => {
    track(() => context.post)

    lines.value = context.post.split("\n").map((l, i) => ({line: l, key: i}))
  })
  
  return (
    <div class="textarea bg-base-200 textarea-lg w-full h-full">
      {lines.value.map(({line, key}) => <Line key={key} line={line} />)}
    </div>
  )
})
