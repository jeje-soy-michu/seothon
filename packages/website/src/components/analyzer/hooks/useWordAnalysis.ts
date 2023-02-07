import { useClientEffect$, useSignal } from '@builder.io/qwik'
import type { CacheEntry} from '~/components/analyzer/hooks/useAnalyzerContext'
import { useAnalyzerContext } from '~/components/analyzer/hooks/useAnalyzerContext'

export const useWordAnalysis = (word: string) => {
  const context = useAnalyzerContext()
  const wordAnalysis = useSignal<CacheEntry | null>(null)

  useClientEffect$(({ track }) => {
    track(() => context.cache)
    const cache = context.cache

    if (!cache) return

    if (!(word in cache)) wordAnalysis.value = null

    wordAnalysis.value = cache[word]
  })

  return wordAnalysis
}
