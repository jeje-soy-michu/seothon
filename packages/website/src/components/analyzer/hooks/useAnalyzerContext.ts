import { createContext, useContext, useContextProvider, useStore } from "@builder.io/qwik"
import { demoState } from "~/components/analyzer/hooks/demo-state"
import type { Keyword } from "~/components/analyzer/keywords/keyword"

type Queries = {
  query: string,
  similarity: number,
}

export type CacheEntry = {
  score: number,
  queries: Queries[],
}

export type CacheMap = {
  [word: string]: CacheEntry
}

export type RawCacheEntry = {
  word: string,
  score: number,
  queries: Queries[],
}

export type AnalyzerState = {
  isDemo: boolean,
  post: string
  keywords: Keyword[],
  keywordId: number,
  status: string,
  cache?: CacheMap,
}

const AnalizerContext = createContext<AnalyzerState>("analyzer")

const defaultState: AnalyzerState = demoState

export const useAnalyzerProvider = () => {
  const state = useStore<AnalyzerState>(defaultState, {
    recursive: true,
  })

  useContextProvider(AnalizerContext, state)
}

export const useAnalyzerContext = () => useContext(AnalizerContext)
