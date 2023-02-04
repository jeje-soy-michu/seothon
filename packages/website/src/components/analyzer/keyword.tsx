import { component$ } from '@builder.io/qwik'
import { useAnalyzerContext } from '~/components/analyzer/hooks/useAnalyzerContext'

export type Keyword = {
  id: number
  text: string
  volume: number
}

export default component$(({id, text, volume}: Keyword) => {
  const context = useAnalyzerContext()
  return (
    <div class="stats shadow m-1 h-25 w-96">
      <div class="stat">
        <div class="stat-title"><strong>{text}</strong></div>
        <div class="stat-desc m-1">Search volume: <strong>{volume}</strong></div>
      </div>

      <button class="btn btn-circle m-1" onClick$={() => {
        context.keywords = context.keywords.filter(keyword => keyword.id !== id)
      }}>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  )
})
