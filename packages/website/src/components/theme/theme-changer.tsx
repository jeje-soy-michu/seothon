import { component$ } from '@builder.io/qwik'

export default component$(() => {
  const themes = ["light", "dark", "cupcake", "bumblebee", "emerald", "corporate", "synthwave", "retro", "cyberpunk", "valentine", "halloween", "garden", "forest", "aqua", "lofi", "pastel", "fantasy", "wireframe", "black", "luxury", "dracula", "cmyk", "autumn", "business", "acid", "lemonade", "night", "coffee", "winter"]
  return (
    <select data-choose-theme>
      {themes.map(theme => <option value={theme}>{theme}</option>)}
    </select>
  )
})