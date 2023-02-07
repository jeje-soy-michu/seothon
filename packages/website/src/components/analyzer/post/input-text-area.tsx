import { component$ } from "@builder.io/qwik"
import { useAnalyzerContext } from "~/components/analyzer/hooks/useAnalyzerContext"

export const InputTextArea = component$(({disabled = false}: {disabled?: boolean}) => {
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
          context.isDemo = false
        }}
        value={context.post}
        disabled={disabled}
      />
    </>
  )
})
