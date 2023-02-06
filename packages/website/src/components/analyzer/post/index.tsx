import { component$ } from '@builder.io/qwik'
import { useAnalyzerContext } from '~/components/analyzer/hooks/useAnalyzerContext'

export const InputTextArea = component$(({isDisabled}: {isDisabled: boolean}) => {
  const context = useAnalyzerContext()
  return (
    <>
      <textarea
        class="textarea textarea-bordered textarea-lg w-full h-full"
        placeholder="Introduce your text to analyze"
        id="text"
        onInput$={(event) => {
          if (!event.target) return
          context.post = (event.target as HTMLTextAreaElement).value
        }}
        value={context.post}
        disabled={isDisabled}
      />
    </>
  )
})

export default component$(() => {
  const {status} = useAnalyzerContext()

  return (
    <div class="flex-row w-4/5 p-5">
      <label for="text">Text to analyze</label>
      {status === "WAITING_FOR_INPUT" && <InputTextArea isDisabled={false} />}
      {status === "ANALYZING" && <InputTextArea isDisabled={true} />}
    </div>
  )
})
