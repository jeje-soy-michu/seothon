import { useClientEffect$, useSignal } from '@builder.io/qwik'
import type { CacheMap, RawCacheEntry } from '~/components/analyzer/hooks/useAnalyzerContext'
import { useAnalyzerContext } from '~/components/analyzer/hooks/useAnalyzerContext'
import { useDemoContent } from '~/components/analyzer/hooks/useDemoContent'

export const rawCacheToHashMap = (cache: RawCacheEntry[]) => {
  return cache.reduce<CacheMap>((acc, entry) => {
    const copy = structuredClone({
      score: entry.score,
      queries: entry.queries
    })
    acc[entry.word] = copy
    return acc
  }, {})
}

export const useAnalyzer = () => {
  const context = useAnalyzerContext()
  const isAnalyzing = useSignal(false)

  // FIXME: This is a temporary workaround to make the demo work
  const websocket_url = "wss://vo9n5gq74b.execute-api.eu-west-1.amazonaws.com/prod"
  
  useClientEffect$(({cleanup, track}) => {
    track(() => isAnalyzing.value)

    if (!isAnalyzing.value || context.isDemo) return

    const payload = {
      action: "analyze",
      text: context.post,
      keywords: context.keywords.map(keyword => ({text: keyword.text, volume: keyword.volume})),
    }

    const ws = new WebSocket(websocket_url)

    ws.onopen = () => {
      ws.send(JSON.stringify(payload))
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data.replace(/\bNaN\b/g, "null"))

      if (data.status === 200) {
        context.status = data.action

        if (data.scores) {
          const cache: RawCacheEntry[] = data.scores.map((item: { word: string, score: number, queries: string }) => ({...item, queries: JSON.parse(item.queries)}))
          context.cache = rawCacheToHashMap(cache)
        }
      } else {
        context.status = "ERROR"
        ws.close()
      }
    }

    ws.onclose = () => {
      isAnalyzing.value = false
    }

    const cleanupWs = setTimeout(() => ws.close(), 5 * 60 * 1000)

    context.status = "REQUESTED"

    cleanup(() => ws.close())
    cleanup(() => clearTimeout(cleanupWs))
  })

  useDemoContent(isAnalyzing)

  return isAnalyzing
}
