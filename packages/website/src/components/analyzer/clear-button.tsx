import { component$ } from '@builder.io/qwik'
import { useAnalyzerContext } from '~/components/analyzer/hooks/useAnalyzerContext'

export default component$(() => {
  const context = useAnalyzerContext()

  return (
    <button class="btn m-3" onClick$={() => {
      context.post = ""
      context.keywords = []
      context.keywordId = 0
      context.status = "WAITING_FOR_INPUT"
    }}>Clear</button>
  )
})
