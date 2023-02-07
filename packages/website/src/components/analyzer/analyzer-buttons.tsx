import { component$ } from "@builder.io/qwik"
import { demoState } from '~/components/analyzer/hooks/demo-state'
import { useAnalyzer } from "~/components/analyzer/hooks/useAnalyzer"
import { useAnalyzerContext } from "~/components/analyzer/hooks/useAnalyzerContext"


export default component$(() => {
  const context = useAnalyzerContext()
  const isAnalyzing = useAnalyzer()
  return (
    <>
      <button class="btn m-3" disabled={context.isDemo || isAnalyzing.value} onClick$={() => {
        context.cache = demoState.cache
        context.isDemo = demoState.isDemo
        context.post = demoState.post
        context.keywords = demoState.keywords
        context.keywordId = demoState.keywordId
        context.status = demoState.status
      }}>Load demo</button>
      <button class="btn m-3" disabled={context.status !== "WAITING_FOR_INPUT" || !context.post || !context.keywords.length} 
      onClick$={() => {isAnalyzing.value = true}}>
      {
        isAnalyzing.value ? `Processing (${context.status})` : 
        context.isDemo    ? "Fake Analyze"
                          : "Analyze"
      }
      </button>
      <button class="btn m-3" disabled={isAnalyzing.value} onClick$={() => {
        context.cache = undefined
        context.isDemo = false
        context.post = ""
        context.keywords = []
        context.keywordId = 0
        context.status = "WAITING_FOR_INPUT"
      }}>Clear</button>
    </>
  )
})
