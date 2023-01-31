import { component$ } from '@builder.io/qwik'
import ThemeChanger from '~/components/theme/theme-changer'

export default component$(() => {

  return (
    <header>
      Header
      <ThemeChanger></ThemeChanger>
    </header>
  )
})
