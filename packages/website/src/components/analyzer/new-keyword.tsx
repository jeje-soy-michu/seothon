import { component$ } from "@builder.io/qwik"


export default component$(() => {
  return (
    <div>
      <div class="form-control w-full max-w-xs">
        <label class="label">
          <span class="label-text">SEO Keyword</span>
        </label>
        <input type="text" placeholder="Type keyword" class="input input-bordered w-full max-w-xs" />
      </div>

      <div class="form-control w-full max-w-xs">
        <label class="label">
          <span class="label-text">Search volume</span>
        </label>
        <input type="text" placeholder="Type volume" class="input input-bordered w-full max-w-xs" />
      </div>

      <button class="btn">Add keyword</button>
    </div>
  )
})
