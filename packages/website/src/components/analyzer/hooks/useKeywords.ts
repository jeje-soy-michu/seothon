import { useAnalyzerContext } from '~/components/analyzer/hooks/useAnalyzerContext'

export const useKeywords = () => {
  const { keywords } = useAnalyzerContext()
  return keywords
}
