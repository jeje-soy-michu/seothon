import { component$ } from "@builder.io/qwik"

type Props = {
  word: string
}

export default component$(({word}: Props) => {
  return (
    <>
      <span>{word} </span>
    </>
  )
})
