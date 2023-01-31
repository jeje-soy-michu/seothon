import { component$ } from '@builder.io/qwik'
import Question from '~/components/faq/question'

export default component$(() => {

  return (
    <div class="space-y-4">
      <Question></Question>
      <Question></Question>
      <Question></Question>
    </div>
  )
})
