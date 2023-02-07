import { component$ } from '@builder.io/qwik'

export default component$(() => {
  const themes = ["wireframe", "retro", "forest", "light", "dark", "cupcake", "bumblebee", "emerald", "corporate", "synthwave", "cyberpunk", "valentine", "halloween", "garden", "aqua", "lofi", "pastel", "fantasy", "black", "luxury", "dracula", "cmyk", "autumn", "business", "acid", "lemonade", "night", "coffee", "winter"]
  return (
    <select data-choose-theme>
      {themes.map(theme => <option value={theme}>{theme}</option>)}
    </select>
  )
})
