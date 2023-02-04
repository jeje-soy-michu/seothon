import { component$ } from '@builder.io/qwik'
import { demoState } from '~/components/analyzer/hooks/demoContent'
import { useAnalyzerContext } from '~/components/analyzer/hooks/useAnalyzerContext'

export default component$(() => {
  const context = useAnalyzerContext()

  return (
    <button class="btn m-3" onClick$={() => {
      context.post = demoState.post
      context.keywords = demoState.keywords
      context.keywordId = demoState.keywordId
      context.status = demoState.status
    }}>Load demo</button>
  )
})
