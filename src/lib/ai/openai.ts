import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Generate text embedding using OpenAI text-embedding-3-small
 * 1536 dimensions, cost-effective for semantic search
 */
export async function generateTextEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error('Text cannot be empty')
  }

  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text.slice(0, 8000), // Truncate to max token limit
      dimensions: 1536,
    })

    return response.data[0].embedding
  } catch (error) {
    console.error('Error generating text embedding:', error)
    throw error
  }
}

/**
 * Generate text embedding using text-embedding-3-large
 * Higher quality, use for important queries
 */
export async function generateTextEmbeddingLarge(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error('Text cannot be empty')
  }

  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-large',
      input: text.slice(0, 8000),
      dimensions: 1536, // Truncate to match our schema
    })

    return response.data[0].embedding
  } catch (error) {
    console.error('Error generating large text embedding:', error)
    throw error
  }
}

/**
 * Generate embeddings for multiple texts (batch processing)
 */
export async function generateTextEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return []

  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts.map(t => t.slice(0, 8000)),
      dimensions: 1536,
    })

    return response.data.map(d => d.embedding)
  } catch (error) {
    console.error('Error generating batch embeddings:', error)
    throw error
  }
}

/**
 * Generate community description embedding
 * Combines multiple fields for richer semantic representation
 */
export async function generateCommunityEmbedding(community: {
  name: string
  description?: string | null
  city: string
  state_code: string
  amenities?: string[] | null
}): Promise<number[]> {
  const text = `
    Community: ${community.name}
    Location: ${community.city}, ${community.state_code}
    Description: ${community.description || ''}
    Amenities: ${community.amenities?.join(', ') || ''}
  `.trim()

  return generateTextEmbedding(text)
}

/**
 * Generate home description embedding
 */
export async function generateHomeEmbedding(home: {
  name?: string | null
  description?: string | null
  bedrooms?: number | null
  bathrooms?: number | null
  sqft?: number | null
  features?: string[] | null
}): Promise<number[]> {
  const text = `
    ${home.name || 'Home'}
    ${home.description || ''}
    ${home.bedrooms || 0} bedrooms, ${home.bathrooms || 0} bathrooms
    ${home.sqft || 0} square feet
    Features: ${home.features?.join(', ') || ''}
  `.trim()

  return generateTextEmbedding(text)
}

/**
 * Test if OpenAI API is configured correctly
 */
export async function testOpenAIConnection(): Promise<boolean> {
  try {
    await generateTextEmbedding('test')
    return true
  } catch (error) {
    console.error('OpenAI connection test failed:', error)
    return false
  }
}
