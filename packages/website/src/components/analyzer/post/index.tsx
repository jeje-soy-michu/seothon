import { component$ } from '@builder.io/qwik'
import { useAnalyzerContext } from '~/components/analyzer/hooks/useAnalyzerContext'
import { InputTextArea } from '~/components/analyzer/post/input-text-area'
import { TextAnalyzer } from '~/components/analyzer/post/text-analyzer'

export default component$(() => {
  const {status} = useAnalyzerContext()

  return (
    <div class="flex-row w-4/5 p-5">
      <label for="text">Text to analyze</label>
      {status === "WAITING_FOR_INPUT" && <InputTextArea />}
      {status === "ANALYZING" && <InputTextArea disabled />}
      {status === "FAST_CACHE" && <TextAnalyzer />}
    </div>
  )
})
