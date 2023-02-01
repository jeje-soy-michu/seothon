import { component$ } from '@builder.io/qwik'
import Keywords from '~/components/analyzer/keywords'
import Post from '~/components/analyzer/post'

export default component$(() => {

  return (
    <div class="flex">
      <Post></Post>
      <Keywords></Keywords>
    </div>
  )
})
