import { component$, Slot, useClientEffect$ } from '@builder.io/qwik'
import Header from '../components/header/header'
import { themeChange } from 'theme-change'

export default component$(() => {
  useClientEffect$(() => themeChange(false), {eagerness: 'load'})
  return (
    <>
      <main>
        <Header />
        <section>
          <Slot />
        </section>
      </main>
      <footer>
        Footer
      </footer>
    </>
  )
})
