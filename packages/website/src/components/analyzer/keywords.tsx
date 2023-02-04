import { component$ } from '@builder.io/qwik'
import { useKeywords } from '~/components/analyzer/hooks/useKeywords'
import Keyword from '~/components/analyzer/keyword'
import NewKeyword from '~/components/analyzer/new-keyword'

export default component$(() => {
  const keywords = useKeywords()
  return (
    <div class="flex-col w-1/5 p-5">
      <NewKeyword />
      {keywords.map(keyword => <Keyword key={keyword.id} {...keyword} />)}
    </div>
  )
})
