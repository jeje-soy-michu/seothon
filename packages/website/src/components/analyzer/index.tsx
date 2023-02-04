import { component$ } from '@builder.io/qwik'
import ClearButton from '~/components/analyzer/clear-button'
import { useAnalyzerProvider } from '~/components/analyzer/hooks/useAnalyzerContext'
import Keywords from '~/components/analyzer/keywords'
import LoadDemoButton from '~/components/analyzer/load-demo-button'
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
        <LoadDemoButton />
        <button class="btn m-3">Analyze</button>
        <ClearButton />
      </div>
    </div>
  )
})
