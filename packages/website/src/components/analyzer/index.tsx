import { component$ } from '@builder.io/qwik'
import Keywords from '~/components/analyzer/keywords'

export default component$(() => {

  return (
    <div>
      <label for="text">Text to analyze</label>
      <textarea
        class="w-full rounded-lg border-gray-200 p-3 text-sm"
        placeholder="Introduce your text to analyze"
        id="text"
      ></textarea>
      <Keywords></Keywords>
    </div>
  )
})
