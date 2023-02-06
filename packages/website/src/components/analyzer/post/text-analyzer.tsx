import { component$ } from "@builder.io/qwik"
import { useAnalyzerContext } from "~/components/analyzer/hooks/useAnalyzerContext"
import Line from "~/components/analyzer/post/line"

export const TextAnalyzer = component$(() => {
  const context = useAnalyzerContext()
  return (
    <div class="textarea bg-base-200 textarea-lg w-full h-full">
      {context.post.split("\n").map((line, index) => <Line key={index} line={line} />)}
    </div>
  )
})
