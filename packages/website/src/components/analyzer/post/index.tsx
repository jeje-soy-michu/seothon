import { component$, useClientEffect$, useSignal } from '@builder.io/qwik'
import { ACTION_TO_NUMBER } from '~/components/analyzer/hooks/useAnalyzer'
import { useAnalyzerContext } from '~/components/analyzer/hooks/useAnalyzerContext'
import { InputTextArea } from '~/components/analyzer/post/input-text-area'
import { TextAnalyzer } from '~/components/analyzer/post/text-analyzer'

export default component$(() => {
  const context = useAnalyzerContext()
  const {status} = context
  const step = useSignal(0)

  useClientEffect$(({track}) => {
    track(() => context.status)
    step.value = ACTION_TO_NUMBER[context.status]
  })

  return (
    <div class="flex-row w-4/5 p-5">
      <div>
        <ul class="steps w-full">
          <li class="step step-primary">Typing</li>
          <li class={step.value > 0 ? "step step-primary" : "step"}>Requested</li>
          <li class={step.value > 1 ? "step step-primary" : "step"}>Analyzing</li>
          <li class={step.value > 2 ? "step step-primary" : "step"}>Hot Cache</li>
          <li class={step.value > 3 ? "step step-primary" : "step"}>Full Cache</li>
          <li class={step.value > 4 ? "step step-primary" : "step"}>Done</li>
        </ul>
      </div>
      {status === "WAITING_FOR_INPUT" && <InputTextArea />}
      {(status === "ANALYZING" || status === "REQUESTED") && <InputTextArea disabled />}
      {(status === "FAST_CACHE" || status === "CACHED_SCORE" || status === "FINAL_SCORE") && <TextAnalyzer />}
    </div>
  )
})
