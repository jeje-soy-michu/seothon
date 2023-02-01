import { component$ } from '@builder.io/qwik'

export default component$(() => {
  return (
    <div class="flex-row w-4/5 p-5">
      <label for="text">Text to analyze</label>
      <textarea
        class="textarea textarea-bordered textarea-lg w-full h-full"
        placeholder="Introduce your text to analyze"
        id="text"
      ></textarea>
    </div>
  )
})
