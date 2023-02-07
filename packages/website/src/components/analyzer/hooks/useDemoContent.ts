import type { Signal } from "@builder.io/qwik"
import { useClientEffect$ } from "@builder.io/qwik"
import { DEMO_CACHE } from "~/components/analyzer/hooks/demo-cache"
import { rawCacheToHashMap } from "~/components/analyzer/hooks/useAnalyzer"
import type { RawCacheEntry } from "~/components/analyzer/hooks/useAnalyzerContext"
import { useAnalyzerContext } from "~/components/analyzer/hooks/useAnalyzerContext"


export const maskCache = (cache: RawCacheEntry[], hide: number) => {
  return cache.map(entry => {
    if (Math.random() < hide) {
      return {
        word: entry.word,
        score: NaN,
        queries: []
      }
    }
    return entry
  })
}

export const useDemoContent = (isAnalyzing: Signal<boolean>) => {
  const context = useAnalyzerContext()

  useClientEffect$(({cleanup, track}) => {
    track(() => isAnalyzing.value)

    if (!isAnalyzing.value || !context.isDemo) return

    context.status = "REQUESTED"

    const analyzingTimeout = setTimeout(() => {context.status = "ANALYZING"}, 3000)
    cleanup(() => clearTimeout(analyzingTimeout))

    const fastCacheTimeout = setTimeout(() => {
      context.status = "FAST_CACHE"
      context.cache = rawCacheToHashMap(maskCache(DEMO_CACHE, .9))
    },  10000)
    cleanup(() => clearTimeout(fastCacheTimeout))

    const finalScoreTimeout = setTimeout(() => {
      context.status = "CACHED_SCORE"
      context.cache = rawCacheToHashMap(maskCache(DEMO_CACHE, .5))
    },  15000)
    cleanup(() => clearTimeout(finalScoreTimeout))

    const cachedScoreTimeout = setTimeout(() => {
      context.status = "FINAL_SCORE"
      context.cache = rawCacheToHashMap(DEMO_CACHE)
      isAnalyzing.value = false
    }, 20000)
    cleanup(() => clearTimeout(cachedScoreTimeout))
  })
}
