/**
 * CSV Parser Utility
 * Handles parsing and validation of CSV files for bulk uploads
 */

export interface CSVParseOptions {
  skipEmptyLines?: boolean
  trimValues?: boolean
  requiredColumns?: string[]
}

export interface CSVParseResult {
  data: Record<string, string>[]
  headers: string[]
  rowCount: number
  errors: CSVError[]
  warnings: CSVWarning[]
}

export interface CSVError {
  row: number
  column: string
  message: string
  value?: string
}

export interface CSVWarning {
  row: number
  column: string
  message: string
  value?: string
}

/**
 * Parse a CSV file into structured data
 */
export function parseCSV(content: string, options: CSVParseOptions = {}): CSVParseResult {
  const {
    skipEmptyLines = true,
    trimValues = true,
    requiredColumns = [],
  } = options

  const errors: CSVError[] = []
  const warnings: CSVWarning[] = []
  
  // Split into lines, handling different line endings
  const lines = content.split(/\r?\n/)
  
  if (lines.length === 0) {
    return {
      data: [],
      headers: [],
      rowCount: 0,
      errors: [{ row: 0, column: '', message: 'File is empty' }],
      warnings: [],
    }
  }

  // Parse headers (first line)
  const headers = parseLine(lines[0], trimValues)
  
  // Check for required columns
  for (const col of requiredColumns) {
    if (!headers.includes(col)) {
      errors.push({
        row: 0,
        column: col,
        message: `Required column "${col}" not found`,
      })
    }
  }

  // Parse data rows
  const data: Record<string, string>[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    
    // Skip empty lines
    if (skipEmptyLines && !line.trim()) {
      continue
    }
    
    const values = parseLine(line, trimValues)
    
    // Check column count mismatch
    if (values.length !== headers.length) {
      warnings.push({
        row: i + 1,
        column: '',
        message: `Column count mismatch: expected ${headers.length}, got ${values.length}`,
      })
    }
    
    // Build row object
    const row: Record<string, string> = {}
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    
    data.push(row)
  }

  return {
    data,
    headers,
    rowCount: data.length,
    errors,
    warnings,
  }
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseLine(line: string, trim: boolean): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"'
        i++ // Skip next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      values.push(trim ? current.trim() : current)
      current = ''
    } else {
      current += char
    }
  }
  
  // Don't forget the last field
  values.push(trim ? current.trim() : current)
  
  return values
}

/**
 * Read a File object as text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = reject
    reader.readAsText(file)
  })
}

/**
 * Generate a CSV template with given headers
 */
export function generateCSVTemplate(headers: string[], sampleRow?: Record<string, string>): string {
  const headerLine = headers.join(',')
  
  if (sampleRow) {
    const dataLine = headers.map(h => {
      const value = sampleRow[h] || ''
      // Escape values with commas or quotes
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    }).join(',')
    return `${headerLine}\n${dataLine}`
  }
  
  return headerLine
}

/**
 * Validate CSV data against a schema
 */
export interface ValidationRule {
  column: string
  required?: boolean
  type?: 'string' | 'number' | 'email' | 'url' | 'date'
  min?: number
  max?: number
  pattern?: RegExp
  enum?: string[]
}

export function validateCSVData(
  data: Record<string, string>[],
  rules: ValidationRule[],
  startRow: number = 1
): { errors: CSVError[]; warnings: CSVWarning[] } {
  const errors: CSVError[] = []
  const warnings: CSVWarning[] = []

  data.forEach((row, index) => {
    const rowNum = startRow + index

    for (const rule of rules) {
      const value = row[rule.column]
      const isEmpty = !value || value.trim() === ''

      // Check required
      if (rule.required && isEmpty) {
        errors.push({
          row: rowNum,
          column: rule.column,
          message: `Required field is empty`,
          value,
        })
        continue
      }

      if (isEmpty) continue

      // Type validation
      if (rule.type) {
        switch (rule.type) {
          case 'number':
            if (isNaN(Number(value))) {
              errors.push({
                row: rowNum,
                column: rule.column,
                message: `Expected number, got "${value}"`,
                value,
              })
            }
            break
          case 'email':
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              errors.push({
                row: rowNum,
                column: rule.column,
                message: `Invalid email format`,
                value,
              })
            }
            break
          case 'url':
            try {
              new URL(value)
            } catch {
              errors.push({
                row: rowNum,
                column: rule.column,
                message: `Invalid URL format`,
                value,
              })
            }
            break
        }
      }

      // Min/max validation for numbers
      if (rule.type === 'number' && !isNaN(Number(value))) {
        const num = Number(value)
        if (rule.min !== undefined && num < rule.min) {
          errors.push({
            row: rowNum,
            column: rule.column,
            message: `Value must be at least ${rule.min}`,
            value,
          })
        }
        if (rule.max !== undefined && num > rule.max) {
          errors.push({
            row: rowNum,
            column: rule.column,
            message: `Value must be at most ${rule.max}`,
            value,
          })
        }
      }

      // Pattern validation
      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push({
          row: rowNum,
          column: rule.column,
          message: `Value does not match required pattern`,
          value,
        })
      }

      // Enum validation
      if (rule.enum && !rule.enum.includes(value)) {
        errors.push({
          row: rowNum,
          column: rule.column,
          message: `Value must be one of: ${rule.enum.join(', ')}`,
          value,
        })
      }
    }
  })

  return { errors, warnings }
}
