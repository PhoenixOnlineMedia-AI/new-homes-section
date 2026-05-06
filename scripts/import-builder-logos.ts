#!/usr/bin/env tsx

import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { promises as fs } from 'fs'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const DEFAULT_LOGO_DIR = path.resolve(process.cwd(), 'data/media-imports/builder-logos')
const SUPPORTED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.svg'])
const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
}

type BuilderRecord = {
  id: string
  name: string
  slug: string
}

type MatchResult = {
  file: string
  builder: BuilderRecord | null
  score: number
  reason: string
}

function parseArgs() {
  const args = process.argv.slice(2)
  const commit = args.includes('--commit')
  const dirIndex = args.findIndex((arg) => arg === '--dir')
  const dir = dirIndex >= 0 && args[dirIndex + 1]
    ? path.resolve(process.cwd(), args[dirIndex + 1])
    : DEFAULT_LOGO_DIR

  return { commit, dir }
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/\b(builder|builders|homes|homebuilder|homebuilders|logo|official|horizontal|vertical|color|black|white)\b/g, ' ')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function compact(value: string) {
  return normalize(value).replace(/\s+/g, '')
}

function tokens(value: string) {
  return normalize(value).split(/\s+/).filter(Boolean)
}

function scoreFileAgainstBuilder(filename: string, builder: BuilderRecord) {
  const fileCompact = compact(filename)
  const slugCompact = compact(builder.slug)
  const nameCompact = compact(builder.name)
  const fileTokens = new Set(tokens(filename))
  const nameTokens = tokens(builder.name)
  const slugTokens = tokens(builder.slug)

  if (!fileCompact) return { score: 0, reason: 'empty filename after normalization' }
  if (fileCompact === slugCompact || fileCompact === nameCompact) return { score: 100, reason: 'exact normalized match' }
  if (fileCompact.includes(slugCompact) || fileCompact.includes(nameCompact)) return { score: 92, reason: 'filename contains builder name/slug' }
  if (slugCompact.includes(fileCompact) || nameCompact.includes(fileCompact)) return { score: 82, reason: 'builder name/slug contains filename' }

  const builderTokens = Array.from(new Set([...nameTokens, ...slugTokens])).filter((token) => token.length > 1)
  const matchedTokens = builderTokens.filter((token) => fileTokens.has(token))
  const tokenScore = builderTokens.length > 0 ? Math.round((matchedTokens.length / builderTokens.length) * 75) : 0

  if (matchedTokens.length >= 2) return { score: Math.max(tokenScore, 70), reason: `matched tokens: ${matchedTokens.join(', ')}` }
  if (matchedTokens.length === 1 && matchedTokens[0].length >= 5) return { score: 60, reason: `matched token: ${matchedTokens[0]}` }

  return { score: 0, reason: 'no useful filename match' }
}

function findBestMatch(filename: string, builders: BuilderRecord[]): MatchResult {
  const ranked = builders
    .map((builder) => {
      const result = scoreFileAgainstBuilder(filename, builder)
      return { builder, ...result }
    })
    .sort((a, b) => b.score - a.score)

  const best = ranked[0]
  const second = ranked[1]

  if (!best || best.score < 70) {
    return { file: filename, builder: null, score: best?.score || 0, reason: best?.reason || 'no match' }
  }

  if (second && best.score - second.score < 12) {
    return {
      file: filename,
      builder: null,
      score: best.score,
      reason: `ambiguous: ${best.builder.name} and ${second.builder.name}`,
    }
  }

  return { file: filename, builder: best.builder, score: best.score, reason: best.reason }
}

async function getLogoFiles(dir: string) {
  const entries = await fs.readdir(dir, { withFileTypes: true })

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => SUPPORTED_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b))
}

function getStoragePath(builder: BuilderRecord, filename: string) {
  const ext = path.extname(filename).toLowerCase()
  const normalizedExt = ext === '.jpeg' ? '.jpg' : ext
  return `builder/${builder.id}/logo/00-${builder.slug}-logo${normalizedExt}`
}

async function main() {
  const { commit, dir } = parseArgs()

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )

  const { data: builders, error: buildersError } = await supabase
    .from('builders')
    .select('id,name,slug')
    .order('name')

  if (buildersError) throw new Error(buildersError.message)

  const builderRecords = (builders || []) as BuilderRecord[]
  const files = await getLogoFiles(dir)
  const matches = files.map((file) => findBestMatch(file, builderRecords))
  const matched = matches.filter((match) => match.builder)
  const unmatched = matches.filter((match) => !match.builder)

  console.log(`Builder logo intake: ${dir}`)
  console.log(`Mode: ${commit ? 'commit' : 'dry run'}`)
  console.log(`Found ${files.length} image files, ${matched.length} matched, ${unmatched.length} needs review.`)

  for (const match of matched) {
    console.log(`MATCH ${match.file} -> ${match.builder?.name} (${match.score}, ${match.reason})`)
  }

  for (const match of unmatched) {
    console.log(`REVIEW ${match.file} (${match.score}, ${match.reason})`)
  }

  if (!commit) {
    console.log('\nDry run only. Re-run with: npm run import:builder-logos -- --commit')
    return
  }

  for (const match of matched) {
    if (!match.builder) continue

    const filePath = path.join(dir, match.file)
    const ext = path.extname(match.file).toLowerCase()
    const contentType = CONTENT_TYPES[ext] || 'application/octet-stream'
    const buffer = await fs.readFile(filePath)
    const storagePath = getStoragePath(match.builder, match.file)

    const { error: uploadError } = await supabase.storage
      .from('builder-logos')
      .upload(storagePath, buffer, {
        contentType,
        upsert: true,
      })

    if (uploadError) {
      console.error(`UPLOAD FAILED ${match.file}: ${uploadError.message}`)
      continue
    }

    const publicUrl = supabase.storage.from('builder-logos').getPublicUrl(storagePath).data.publicUrl

    const { error: mediaError } = await supabase
      .from('media_assets')
      .upsert({
        entity_type: 'builder',
        entity_id: match.builder.id,
        bucket: 'builder-logos',
        path: storagePath,
        public_url: publicUrl,
        original_filename: match.file,
        title: `${match.builder.name} logo`,
        alt_text: `${match.builder.name} logo`,
        role: 'logo',
        status: 'approved',
        content_type: contentType,
        size_bytes: buffer.byteLength,
      }, { onConflict: 'bucket,path' })

    if (mediaError) {
      console.error(`MEDIA RECORD FAILED ${match.file}: ${mediaError.message}`)
      continue
    }

    const { error: builderError } = await supabase
      .from('builders')
      .update({ logo_url: publicUrl })
      .eq('id', match.builder.id)

    if (builderError) {
      console.error(`BUILDER UPDATE FAILED ${match.file}: ${builderError.message}`)
      continue
    }

    console.log(`IMPORTED ${match.file} -> ${match.builder.name}`)
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
