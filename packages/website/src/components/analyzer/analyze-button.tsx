import { component$ } from '@builder.io/qwik'
import { useAnalyzerContext } from '~/components/analyzer/hooks/useAnalyzerContext'

export default component$(() => {
  const context = useAnalyzerContext()

  return (
    <button class="btn m-3" onClick$={() => {
      const payload = {
        text: context.post,
        keywords: context.keywords.map(keyword => ({text: keyword.text, volume: keyword.volume})),
      }
      
      console.log(payload)
      context.status = "ANALYZING"
    }}>Analyze</button>
  )
})
