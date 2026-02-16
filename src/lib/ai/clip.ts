// CLIP Image Embeddings using Xenova Transformers
// Runs locally in Node.js for image similarity search

import { pipeline, env } from '@xenova/transformers'
import sharp from 'sharp'

// Configure transformers for Node.js environment
env.allowLocalModels = false
env.useBrowserCache = false
env.useFSCache = true
env.cacheDir = './.cache/transformers'

// Singleton pipeline instance
let clipExtractor: any = null

/**
 * Initialize CLIP pipeline
 * Uses Xenova/clip-vit-base-patch16 (512-dim embeddings)
 * This is faster and more memory-efficient than the large model
 */
async function getClipPipeline() {
  if (!clipExtractor) {
    console.log('[CLIP] Initializing pipeline...')
    clipExtractor = await pipeline(
      'image-feature-extraction',
      'Xenova/clip-vit-base-patch16',
      {
        quantized: true, // Use quantized model for faster inference
        revision: 'main',
      }
    )
    console.log('[CLIP] Pipeline ready')
  }
  return clipExtractor
}

/**
 * Generate CLIP embedding from image URL
 * Returns 512-dimensional vector
 */
export async function generateImageEmbeddingFromUrl(imageUrl: string): Promise<number[]> {
  try {
    const extractor = await getClipPipeline()
    
    const output = await extractor(imageUrl, {
      pooling: 'mean',
      normalize: true,
    })

    // Convert Float32Array to regular array
    return Array.from(output.data)
  } catch (error) {
    console.error('[CLIP] Error generating embedding from URL:', error)
    throw error
  }
}

/**
 * Generate CLIP embedding from image buffer
 */
export async function generateImageEmbeddingFromBuffer(buffer: Buffer): Promise<number[]> {
  try {
    // Convert buffer to base64 data URL
    const base64 = buffer.toString('base64')
    const mimeType = await getImageMimeType(buffer)
    const dataUrl = `data:${mimeType};base64,${base64}`
    
    return generateImageEmbeddingFromUrl(dataUrl)
  } catch (error) {
    console.error('[CLIP] Error generating embedding from buffer:', error)
    throw error
  }
}

/**
 * Generate CLIP embedding from File object (browser-compatible)
 */
export async function generateImageEmbeddingFromFile(file: File): Promise<number[]> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    return generateImageEmbeddingFromBuffer(buffer)
  } catch (error) {
    console.error('[CLIP] Error generating embedding from file:', error)
    throw error
  }
  }

/**
 * Generate embeddings for multiple images
 */
export async function generateImageEmbeddings(imageUrls: string[]): Promise<number[][]> {
  const embeddings: number[][] = []
  
  for (const url of imageUrls) {
    try {
      const embedding = await generateImageEmbeddingFromUrl(url)
      embeddings.push(embedding)
    } catch (error) {
      console.error(`[CLIP] Error processing ${url}:`, error)
      // Push zero vector as placeholder
      embeddings.push(new Array(512).fill(0))
    }
  }
  
  return embeddings
}

/**
 * Calculate cosine similarity between two embeddings
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Embeddings must have same dimensions')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

/**
 * Find most similar images from a list
 */
export function findSimilarImages(
  queryEmbedding: number[],
  imageEmbeddings: Array<{ id: string; embedding: number[] }>,
  topK: number = 5
): Array<{ id: string; similarity: number }> {
  const similarities = imageEmbeddings.map(img => ({
    id: img.id,
    similarity: cosineSimilarity(queryEmbedding, img.embedding),
  }))

  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK)
}

/**
 * Preprocess image with sharp (resize, normalize)
 */
async function preprocessImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(224, 224, { fit: 'cover' }) // CLIP's expected input size
    .normalize()
    .toBuffer()
}

/**
 * Detect image MIME type from buffer
 */
async function getImageMimeType(buffer: Buffer): Promise<string> {
  // Check magic numbers
  if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
    return 'image/jpeg'
  }
  if (buffer[0] === 0x89 && buffer[1] === 0x50) {
    return 'image/png'
  }
  if (buffer[0] === 0x52 && buffer[1] === 0x49) {
    return 'image/webp'
  }
  return 'image/jpeg' // Default
}

/**
 * Test CLIP pipeline
 */
export async function testClipPipeline(): Promise<boolean> {
  try {
    const extractor = await getClipPipeline()
    // Test with a simple image
    const testUrl = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    await extractor(testUrl, { pooling: 'mean', normalize: true })
    return true
  } catch (error) {
    console.error('[CLIP] Pipeline test failed:', error)
    return false
  }
}
