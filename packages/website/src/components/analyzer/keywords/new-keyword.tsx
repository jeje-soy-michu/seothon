import { component$, useSignal } from "@builder.io/qwik"
import { useAnalyzerContext } from "~/components/analyzer/hooks/useAnalyzerContext"


export default component$(() => {
  const context = useAnalyzerContext()
  const keyword = useSignal('')
  const volume = useSignal(0)
  return (
    <div>
      <div class="form-control w-full max-w-xs">
        <label class="label">
          <span class="label-text">{"SEO Keyword (not empty)"}</span>
        </label>
        <input type="text" placeholder="Type keyword" class="input input-bordered w-full max-w-xs" value={keyword.value} onInput$={e => {keyword.value = (e.target as HTMLInputElement).value}} />
      </div>

      <div class="form-control w-full max-w-xs">
        <label class="label">
          <span class="label-text">{"Search volume (volume > 0)"}</span>
        </label>
        <input type="number" placeholder="Type volume" class="input input-bordered w-full max-w-xs" value={volume.value} onInput$={e => {volume.value = Number((e.target as HTMLInputElement).value)}} />
      </div>

      <button class="btn" onClick$={() => {
        if (!keyword.value) return
        if (volume.value <= 0) return

        context.keywords.push({id: context.keywordId++, text: keyword.value, volume: volume.value})
        context.isDemo = false
        keyword.value = ''
        volume.value = 0
      }}>Add keyword</button>
    </div>
  )
})
