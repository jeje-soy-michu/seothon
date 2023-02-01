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
            <div class="w-screen">
              <Header />
              <div class="divider"></div>
              <section>
                <Slot />
              </section>
              <div class="divider"></div>
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
