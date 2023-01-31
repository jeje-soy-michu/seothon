import { component$ } from '@builder.io/qwik'
import type { DocumentHead } from '@builder.io/qwik-city'

export default component$(() => {
  return (
    <div>
      <h1>
        Index
      </h1>
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
