import { component$ } from '@builder.io/qwik'
import { useAnalyzerProvider } from '~/components/analyzer/hooks/useAnalyzerContext'
import Keywords from '~/components/analyzer/keywords'
import Post from '~/components/analyzer/post'
import AnalyzerButtons from '~/components/analyzer/analyzer-buttons'

export default component$(() => {
  useAnalyzerProvider()

  return (
    <>
      <div class="flex min-h-[32rem]">
        <Post />
        <Keywords />
      </div>
      <div class="flex justify-center p-3 pt-16">
        <AnalyzerButtons />
      </div>
    </>
  )
})
