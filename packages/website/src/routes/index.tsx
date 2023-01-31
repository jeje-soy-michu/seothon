import { component$ } from '@builder.io/qwik'
import type { DocumentHead } from '@builder.io/qwik-city'
import Analyzer from '~/components/analyzer'
import Faq from '~/components/faq/faq'

export default component$(() => {
  return (
    <div>
      <h1>
        Seothon
      </h1>
      <Analyzer></Analyzer>
      <div class="divider"></div>
      <h2>FAQ</h2>
      <Faq />
    </div>
  )
})

export const head: DocumentHead = {
  title: 'Welcome to Seothon',
  meta: [
    {
      name: 'description',
      content: 'Seothon is a website build for midudev-cohere-2023',
    },
  ],
};
