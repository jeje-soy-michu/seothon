import { component$, Slot, useClientEffect$ } from '@builder.io/qwik'
import Header from '../components/header/header'
import { themeChange } from 'theme-change'

export default component$(() => {
  useClientEffect$(() => themeChange(false), {eagerness: 'load'})
  return (
    <>
      <main>
        <div class="hero min-h-screen bg-base-200">
          <div class="hero-content text-center">
            <div class="max-w-md">
              <Header />
              <section>
                <Slot />
              </section>
              <footer>
                Footer
              </footer>
            </div>
          </div>
        </div>
      </main>
    </>
  )
})
