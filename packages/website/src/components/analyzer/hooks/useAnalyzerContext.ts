import { createContext, useContext, useContextProvider, useStore } from "@builder.io/qwik"
import { demoState } from "~/components/analyzer/hooks/demoContent"
import type { Keyword } from "~/components/analyzer/keyword"

export type AnalyzerState = {
  post: string
  keywords: Keyword[],
  keywordId: number,
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
