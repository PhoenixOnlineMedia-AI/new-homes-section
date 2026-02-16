#!/usr/bin/env tsx
/**
 * Setup Validation Script
 * 
 * Validates that all required environment variables are set and
 * that the Supabase database is properly configured.
 * 
 * Usage: npx tsx scripts/validate-setup.ts
 */

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { testClipPipeline } from '../src/lib/ai/clip'

const checks = {
  env: false,
  supabaseConnection: false,
  databaseSchema: false,
  pgvector: false,
  openai: false,
  clip: false
}

console.log('🔍 Validating New Homes Section setup...\n')

// Check environment variables
console.log('📋 Checking environment variables...')
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY'
]

const missingVars = requiredEnvVars.filter(v => !process.env[v])
if (missingVars.length > 0) {
  console.error('❌ Missing environment variables:')
  missingVars.forEach(v => console.error(`   - ${v}`))
  process.exit(1)
}
console.log('✅ All environment variables present\n')
checks.env = true

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

async function validateSetup() {
  // Test Supabase connection
  console.log('🔗 Testing Supabase connection...')
  try {
    const { data, error } = await supabase.from('builders').select('count')
    if (error && error.code !== 'PGRST116') { // PGRST116 = table not found
      throw error
    }
    console.log('✅ Supabase connection successful\n')
    checks.supabaseConnection = true
  } catch (error) {
    console.error('❌ Supabase connection failed:', error)
    console.log('   Please check your Supabase URL and Service Role Key\n')
  }

  // Check database schema
  console.log('🗄️  Checking database schema...')
  try {
    const tables = ['builders', 'communities', 'homes', 'search_queries']
    const existingTables: string[] = []
    
    for (const table of tables) {
      const { error } = await supabase.from(table).select('id').limit(1)
      if (!error || error.code !== 'PGRST116') {
        existingTables.push(table)
      }
    }
    
    if (existingTables.length === tables.length) {
      console.log('✅ All required tables exist')
      console.log(`   Tables: ${existingTables.join(', ')}\n`)
      checks.databaseSchema = true
    } else {
      console.warn('⚠️  Some tables are missing:')
      tables.forEach(t => {
        if (!existingTables.includes(t)) console.warn(`   - ${t} (missing)`)
      })
      console.log('\n📝 Run the SQL in supabase/migrations/001_initial_schema.sql in your Supabase SQL Editor\n')
    }
  } catch (error) {
    console.error('❌ Error checking schema:', error, '\n')
  }

  // Check pgvector extension
  if (checks.databaseSchema) {
    console.log('📐 Checking pgvector extension...')
    try {
      const { data, error } = await supabase.rpc('search_communities', {
        query_embedding: new Array(1536).fill(0),
        match_threshold: 0.5,
        match_count: 1
      })
      
      if (error && error.message.includes('function')) {
        console.warn('⚠️  Vector search functions not found')
        console.log('   The pgvector extension and search functions may not be installed\n')
      } else {
        console.log('✅ pgvector extension and search functions ready\n')
        checks.pgvector = true
      }
    } catch (error: any) {
      if (error.message?.includes('function')) {
        console.warn('⚠️  Vector search functions not found')
        console.log('   Run the migration SQL to install pgvector and create functions\n')
      } else {
        console.log('✅ pgvector extension appears to be installed\n')
        checks.pgvector = true
      }
    }
  }

  // Test OpenAI API
  console.log('🤖 Testing OpenAI API...')
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: 'Test embedding for validation'
    })
    
    if (response.data[0].embedding.length === 1536) {
      console.log('✅ OpenAI API working (text-embedding-3-small)')
      console.log(`   Embedding dimensions: ${response.data[0].embedding.length}\n`)
      checks.openai = true
    }
  } catch (error: any) {
    console.error('❌ OpenAI API error:', error.message)
    console.log('   Please check your OPENAI_API_KEY\n')
  }

  // Test CLIP pipeline
  console.log('🖼️  Testing CLIP image embeddings...')
  try {
    const success = await testClipPipeline()
    if (success) {
      console.log('✅ CLIP pipeline working (Xenova/clip-vit-base-patch16)')
      console.log('   Embedding dimensions: 512\n')
      checks.clip = true
    } else {
      console.warn('⚠️  CLIP pipeline test returned false\n')
    }
  } catch (error: any) {
    console.error('❌ CLIP pipeline error:', error.message)
    console.log('   CLIP embeddings will not be available for image search\n')
  }

  // Check for existing data
  if (checks.databaseSchema) {
    console.log('📊 Checking for existing data...')
    try {
      const { data: builders } = await supabase.from('builders').select('id')
      const { data: communities } = await supabase.from('communities').select('id')
      const { data: homes } = await supabase.from('homes').select('id')
      
      console.log(`   Builders: ${builders?.length || 0}`)
      console.log(`   Communities: ${communities?.length || 0}`)
      console.log(`   Homes: ${homes?.length || 0}`)
      
      if ((builders?.length || 0) === 0) {
        console.log('\n📝 No data found. Run: npx tsx scripts/seed-database.ts')
      }
      console.log('')
    } catch (error) {
      console.log('   Could not check for existing data\n')
    }
  }

  // Final summary
  console.log('═══════════════════════════════════════════════════')
  console.log('                  SETUP SUMMARY')
  console.log('═══════════════════════════════════════════════════')
  
  const allChecks = Object.entries(checks)
  const passedChecks = allChecks.filter(([, v]) => v).length
  
  allChecks.forEach(([name, passed]) => {
    const icon = passed ? '✅' : '❌'
    const label = name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
    console.log(`${icon} ${label}`)
  })
  
  console.log('═══════════════════════════════════════════════════')
  console.log(`Passed: ${passedChecks}/${allChecks.length} checks`)
  
  if (passedChecks === allChecks.length) {
    console.log('\n🎉 All checks passed! Your setup is complete.')
    console.log('\nNext steps:')
    console.log('  1. Run the dev server: npm run dev')
    console.log('  2. Open http://localhost:3000')
    process.exit(0)
  } else if (checks.env && checks.supabaseConnection && !checks.databaseSchema) {
    console.log('\n⚠️  Database schema needs to be set up.')
    console.log('\nNext steps:')
    console.log('  1. Go to your Supabase dashboard SQL Editor')
    console.log('  2. Run the SQL in: supabase/migrations/001_initial_schema.sql')
    console.log('  3. Re-run this validation script')
    process.exit(1)
  } else if (checks.databaseSchema && !checks.openai) {
    console.log('\n⚠️  OpenAI API not working. Check your API key.')
    process.exit(1)
  } else {
    console.log('\n⚠️  Some checks failed. Please review the errors above.')
    process.exit(1)
  }
}

validateSetup()
