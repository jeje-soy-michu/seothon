import { component$ } from '@builder.io/qwik'

export default component$(() => {

  return (
    <div class="overflow-x-auto">
      <table class="table w-full">
        <thead>
          <tr>
            <th>Index</th>
            <th>Keyword</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>1</th>
            <td>Cy Ganderton</td>
          </tr>
          <tr>
            <th>2</th>
            <td>Hart Hagerty</td>
          </tr>
          <tr>
            <th>3</th>
            <td>Brice Swyre</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
})
