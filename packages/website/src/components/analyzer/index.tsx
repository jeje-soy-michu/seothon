import { component$ } from '@builder.io/qwik'
import { useAnalyzerProvider } from '~/components/analyzer/hooks/useAnalyzerContext'
import Keywords from '~/components/analyzer/keywords'
import LoadDemo from '~/components/analyzer/load-demo'
import Post from '~/components/analyzer/post'

export default component$(() => {
  useAnalyzerProvider()

  return (
    <div>
      <div class="flex min-h-[32rem]">
        <Post />
        <Keywords />
      </div>
      <div class="flex justify-center p-3">
        <LoadDemo></LoadDemo>
        <button class="btn m-3">Analyze</button>
        <button class="btn m-3">Clear</button>
      </div>
    </div>
  )
})