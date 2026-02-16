// AI module exports

export {
  generateTextEmbedding,
  generateTextEmbeddingLarge,
  generateTextEmbeddings,
  generateCommunityEmbedding,
  generateHomeEmbedding,
  testOpenAIConnection,
} from './openai'

export {
  generateImageEmbeddingFromUrl,
  generateImageEmbeddingFromBuffer,
  generateImageEmbeddingFromFile,
  generateImageEmbeddings,
  cosineSimilarity,
  findSimilarImages,
  testClipPipeline,
} from './clip'

export {
  searchCommunitiesSemantic,
  searchCommunitiesHybrid,
  searchCommunitiesByImage,
  parseNaturalLanguageQuery,
  smartSearch,
  logSearchQuery,
} from './search'

export type { SearchFilters } from './search'
