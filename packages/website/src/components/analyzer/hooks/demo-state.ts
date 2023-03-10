import type { AnalyzerState } from "~/components/analyzer/hooks/useAnalyzerContext"

const POST = `Search engine optimization

Search engine optimization (SEO) is the process of improving the quality and quantity of website traffic to a website or a web page from search engines. SEO targets unpaid traffic (known as "natural" or "organic" results) rather than direct traffic or paid traffic. Unpaid traffic may originate from different kinds of searches, including image search, video search, academic search, news search, and industry-specific vertical search engines.

As an Internet marketing strategy, SEO considers how search engines work, the computer-programmed algorithms that dictate search engine behavior, what people search for, the actual search terms or keywords typed into search engines, and which search engines are preferred by their targeted audience. SEO is performed because a website will receive more visitors from a search engine when websites rank higher on the search engine results page (SERP). These visitors can then potentially be converted into customers.`

export const demoState: AnalyzerState = {
  isDemo: true,
  post: POST,
  keywords: [
    {id: 0, text: 'SEO', volume: 8900},
    {id: 1, text: 'Search engine optimization', volume: 6200},
    {id: 2, text: 'Website traffic', volume: 7300},
    {id: 3, text: 'Search engines', volume: 5100},
    {id: 4, text: 'Unpaid traffic', volume: 6000},
    {id: 5, text: 'Organic results', volume: 4800},
    {id: 6, text: 'Keywords', volume: 7200},
    {id: 8, text: 'Customers', volume: 7500},
  ],
  keywordId: 9,
  status: "WAITING_FOR_INPUT",
}
