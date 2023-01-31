import { component$ } from '@builder.io/qwik'
import type { DocumentHead } from '@builder.io/qwik-city'
import Faq from '~/components/faq/faq'

export default component$(() => {
  return (
    <div>
      <h1>
        Seothon
      </h1>
      <div>
        <label for="text">Text to analyze</label>
        <textarea
          class="w-full rounded-lg border-gray-200 p-3 text-sm"
          placeholder="Introduce your text to analyze"
          id="text"
        ></textarea>
      </div>
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
