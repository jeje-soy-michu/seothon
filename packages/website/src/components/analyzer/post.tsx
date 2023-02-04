import { component$ } from '@builder.io/qwik'
import { useAnalyzerContext } from '~/components/analyzer/hooks/useAnalyzerContext'

export const InputTextArea = component$(() => {
  const context = useAnalyzerContext()
  return (
    <div class="flex-row w-4/5 p-5">
      <label for="text">Text to analyze</label>
      <textarea
        class="textarea textarea-bordered textarea-lg w-full h-full"
        placeholder="Introduce your text to analyze"
        id="text"
        onInput$={(event) => {
          if (!event.target) return
          context.post = (event.target as HTMLTextAreaElement).value
        }}
        value={context.post}
      />
    </div>
  )
})

export default component$(() => {
  return <InputTextArea />
})
