import { component$ } from '@builder.io/qwik'
import Question from '~/components/faq/question'

export default component$(() => {

  return (
    <div class="space-y-4">
      <Question
        question="How does Seothon work?"
        answer="Seothon is like a helper who checks if a story you wrote has the right words that people are searching for. Think of it like a treasure hunt game where Seothon helps you find the right keywords that are hidden in your story. First, Seothon uses something called cosine similarity to compare the embeddings and check if the words in your story match the words people are searching for. It's like holding up two toy sets and comparing if they are the same. The closer they are, the higher the score. Then, Seothon multiplies that score with the volume, which is how many times people search for that keyword. It's like counting how many kids are playing with that toy. The more kids playing, the more valuable the toy is. So, the higher the score, the better your story will do when people search for those keywords. In short, Seothon helps make sure your story is using the right words that people are searching for and helps make your story more easily found by others!"
      />
      <Question
        question="What is a word embedding?"
        answer="Word embedding is like giving each word a special code or number that helps computers understand what the word means and how it relates to other words. It's like giving a toy a special tag so that you know which toy it is and how it fits with other toys. This makes it easier for computers to understand and use words in different ways, just like you use toys to play different games."
      />
      <Question
        question="How cosine similarity works?"
        answer="Cosine similarity is like comparing two toys to see how similar they are to each other. Think of it like holding two toys up next to each other and checking to see if they are the same size, shape, color, or have the same parts. The closer the toys are to being the same, the higher the cosine similarity score. In the same way, cosine similarity helps computers compare two words and see how similar they are in meaning. The higher the score, the more similar the words are in meaning. It's like finding a matching pair of toys!"
      />
      <Question 
        question="Why so slow?"
        answer="The Seothon system is designed to run offline and process information in batches. This means that instead of processing information as soon as it is requested, the system processes information in groups, or batches, at regular intervals. This method is more efficient in terms of computing resources, but it can result in slower performance if you use the system on demand."
      />
      <Question 
        question="Why so ugly?"
        answer="Man no he usado en mi vida ni Qwik ni Tailwind, da gracias que funcione."
      />
    </div>
  )
})
