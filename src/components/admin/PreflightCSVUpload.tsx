'use client'

import { useCallback, useMemo, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { AlertCircle, Check, Download, Loader2, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  parseCSV,
  readFileAsText,
  validateCSVData,
  CSVParseResult,
  generateCSVTemplate,
} from '@/lib/csv/parser'
import { CSVTemplate } from '@/lib/csv/templates'
import { cn } from '@/lib/utils'

export type PreflightField = {
  key: string
  label: string
  incoming: string | null
  existing?: string | null
  changed?: boolean
  replaceByDefault?: boolean
}

export type PreflightRow = {
  rowKey: string
  title: string
  description?: string
  status: 'new' | 'existing' | 'error'
  fields: PreflightField[]
  errors?: string[]
}

export type PreflightAnalysis = {
  rows: PreflightRow[]
  errors?: string[]
}

export type PreflightSelection = {
  rowKey: string
  replaceFields: string[]
}

type UploadResult = {
  success: boolean
  message: string
  errors?: string[]
}

interface PreflightCSVUploadProps {
  template: CSVTemplate
  analyzeUpload: (data: Record<string, string>[]) => Promise<PreflightAnalysis>
  applyUpload: (data: Record<string, string>[], selections: PreflightSelection[]) => Promise<UploadResult>
  applyLabel?: string
}

function fieldHasIncoming(field: PreflightField) {
  return Boolean(field.incoming && field.incoming.trim())
}

function initialSelections(rows: PreflightRow[]) {
  const next: Record<string, string[]> = {}

  for (const row of rows) {
    if (row.status === 'error') {
      next[row.rowKey] = []
      continue
    }

    next[row.rowKey] = row.fields
      .filter((field) => fieldHasIncoming(field) && (row.status === 'new' || field.replaceByDefault))
      .map((field) => field.key)
  }

  return next
}

export function PreflightCSVUpload({
  template,
  analyzeUpload,
  applyUpload,
  applyLabel = 'Apply Selected Changes',
}: PreflightCSVUploadProps) {
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null)
  const [analysis, setAnalysis] = useState<PreflightAnalysis | null>(null)
  const [selectedFields, setSelectedFields] = useState<Record<string, string[]>>({})
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    try {
      const content = await readFileAsText(file)
      const result = parseCSV(content, {
        requiredColumns: template.requiredColumns,
      })

      const { errors, warnings } = validateCSVData(result.data, template.validationRules)
      result.errors.push(...errors)
      result.warnings.push(...warnings)

      setParseResult(result)
      setAnalysis(null)
      setSelectedFields({})
      setUploadResult(null)
    } catch {
      setParseResult({
        data: [],
        headers: [],
        rowCount: 0,
        errors: [{ row: 0, column: '', message: 'Failed to parse file' }],
        warnings: [],
      })
      setAnalysis(null)
      setSelectedFields({})
      setUploadResult(null)
    }
  }, [template])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
  })

  const canAnalyze = Boolean(parseResult && parseResult.data.length > 0 && parseResult.errors.length === 0)
  const applyCount = useMemo(
    () => Object.values(selectedFields).reduce((sum, fields) => sum + fields.length, 0),
    [selectedFields]
  )

  const handleDownloadTemplate = () => {
    const csv = generateCSVTemplate(template.headers, template.sampleData)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${template.name.toLowerCase().replace(/\s+/g, '-')}-template.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleAnalyze = async () => {
    if (!parseResult) return

    setIsAnalyzing(true)
    setUploadResult(null)

    try {
      const result = await analyzeUpload(parseResult.data)
      setAnalysis(result)
      setSelectedFields(initialSelections(result.rows))
    } catch (error) {
      setAnalysis({
        rows: [],
        errors: [error instanceof Error ? error.message : 'Analysis failed'],
      })
      setSelectedFields({})
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleApply = async () => {
    if (!parseResult || !analysis) return

    setIsApplying(true)
    setUploadResult(null)

    try {
      const selections = analysis.rows
        .filter((row) => row.status !== 'error')
        .map((row) => ({
          rowKey: row.rowKey,
          replaceFields: selectedFields[row.rowKey] || [],
        }))

      const result = await applyUpload(parseResult.data, selections)
      setUploadResult(result)
    } catch (error) {
      setUploadResult({
        success: false,
        message: error instanceof Error ? error.message : 'Upload failed',
      })
    } finally {
      setIsApplying(false)
    }
  }

  const handleClear = () => {
    setParseResult(null)
    setAnalysis(null)
    setSelectedFields({})
    setUploadResult(null)
  }

  const toggleField = (rowKey: string, fieldKey: string, checked: boolean) => {
    setSelectedFields((current) => {
      const existing = new Set(current[rowKey] || [])
      if (checked) {
        existing.add(fieldKey)
      } else {
        existing.delete(fieldKey)
      }
      return { ...current, [rowKey]: Array.from(existing) }
    })
  }

  const replaceAllForRow = (row: PreflightRow) => {
    setSelectedFields((current) => ({
      ...current,
      [row.rowKey]: row.fields.filter(fieldHasIncoming).map((field) => field.key),
    }))
  }

  const keepAllForRow = (row: PreflightRow) => {
    setSelectedFields((current) => ({
      ...current,
      [row.rowKey]: [],
    }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">CSV Template</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-gray-600">{template.description}</p>
          <Button variant="outline" onClick={handleDownloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Download {template.name} Template
          </Button>
          <div className="mt-4 flex flex-wrap gap-2">
            {template.requiredColumns.map((col) => (
              <span key={col} className="rounded-full border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700">
                {col}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload CSV File</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={cn(
              'cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors',
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            )}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className={cn('mb-2 font-medium', isDragActive ? 'text-blue-600' : 'text-gray-600')}>
              {isDragActive ? 'Drop the CSV file here' : 'Drag and drop a CSV file here, or click to select'}
            </p>
            <p className="text-sm text-gray-400">Supports .csv files only</p>
          </div>
        </CardContent>
      </Card>

      {parseResult && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">File Analysis</CardTitle>
            <Button variant="ghost" size="sm" onClick={handleClear}>
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </CardHeader>
          <CardContent>
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <SummaryBox label="Rows" value={parseResult.rowCount} />
              <SummaryBox label="Errors" value={parseResult.errors.length} tone={parseResult.errors.length > 0 ? 'red' : 'green'} />
              <SummaryBox label="Warnings" value={parseResult.warnings.length} tone={parseResult.warnings.length > 0 ? 'yellow' : 'green'} />
            </div>

            <ParseMessages title="Errors" messages={parseResult.errors.map((error) => `Row ${error.row}: ${error.column ? `${error.column} ` : ''}${error.message}`)} tone="red" />
            <ParseMessages title="Warnings" messages={parseResult.warnings.map((warning) => `Row ${warning.row}: ${warning.column ? `${warning.column} ` : ''}${warning.message}`)} tone="yellow" />

            {parseResult.data.length > 0 && (
              <div className="mb-6 overflow-hidden rounded-lg border">
                <div className="border-b bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700">Preview</div>
                <div className="divide-y">
                  {parseResult.data.slice(0, 5).map((row, index) => (
                    <div key={index} className="grid gap-2 p-4 text-sm md:grid-cols-3">
                      {parseResult.headers.slice(0, 6).map((header) => (
                        <div key={header} className="min-w-0">
                          <p className="text-xs font-medium text-gray-500">{header}</p>
                          <p className="truncate text-gray-900">{row[header] || '-'}</p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {canAnalyze && (
              <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full">
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing existing data...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Analyze Existing Data
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Review Changes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ParseMessages title="Analysis Errors" messages={analysis.errors || []} tone="red" />

            {analysis.rows.map((row) => {
              const selected = new Set(selectedFields[row.rowKey] || [])
              const isExisting = row.status === 'existing'
              const isError = row.status === 'error'

              return (
                <div key={row.rowKey} className={cn('rounded-lg border bg-white p-4', isError && 'border-red-200 bg-red-50')}>
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{row.title}</h3>
                        <Badge variant={row.status === 'new' ? 'secondary' : row.status === 'existing' ? 'outline' : 'destructive'}>
                          {row.status === 'new' ? 'New' : row.status === 'existing' ? 'Existing' : 'Error'}
                        </Badge>
                      </div>
                      {row.description && <p className="mt-1 text-sm text-gray-600">{row.description}</p>}
                    </div>
                    {isExisting && !isError && (
                      <div className="flex gap-2">
                        <Button type="button" size="sm" variant="outline" onClick={() => replaceAllForRow(row)}>
                          Replace All
                        </Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => keepAllForRow(row)}>
                          Keep All
                        </Button>
                      </div>
                    )}
                  </div>

                  <ParseMessages title="Row Errors" messages={row.errors || []} tone="red" />

                  {!isError && (
                    <div className="space-y-3">
                      {row.fields.filter(fieldHasIncoming).map((field) => (
                        <label key={field.key} className="grid gap-3 rounded-md border border-gray-200 p-3 md:grid-cols-[auto_1fr_1fr]">
                          <Checkbox
                            checked={selected.has(field.key)}
                            onCheckedChange={(checked) => toggleField(row.rowKey, field.key, checked === true)}
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900">{field.label}</p>
                            <p className="mt-1 line-clamp-3 text-sm text-gray-700">{field.incoming}</p>
                          </div>
                          <div className="min-w-0 rounded-md bg-gray-50 p-3">
                            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">Current</p>
                            <p className="line-clamp-3 text-sm text-gray-600">{field.existing || 'Empty'}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            <Button onClick={handleApply} disabled={isApplying || applyCount === 0} className="w-full">
              {isApplying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Applying changes...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  {applyLabel} ({applyCount})
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {uploadResult && (
        <Card className={uploadResult.success ? 'border-green-500' : 'border-red-500'}>
          <CardContent className="pt-6">
            <div className={cn('flex items-center gap-3', uploadResult.success ? 'text-green-700' : 'text-red-700')}>
              {uploadResult.success ? <Check className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
              <div>
                <h4 className="font-medium">{uploadResult.success ? 'Upload Successful' : 'Upload Failed'}</h4>
                <p className="text-sm">{uploadResult.message}</p>
              </div>
            </div>
            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <ul className="mt-4 space-y-1 text-sm text-red-600">
                {uploadResult.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function SummaryBox({ label, value, tone = 'gray' }: { label: string; value: number; tone?: 'gray' | 'red' | 'green' | 'yellow' }) {
  const classes = {
    gray: 'bg-gray-50 text-gray-900',
    red: 'bg-red-50 text-red-700',
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
  }

  return (
    <div className={cn('rounded-lg p-4 text-center', classes[tone])}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  )
}

function ParseMessages({ title, messages, tone }: { title: string; messages: string[]; tone: 'red' | 'yellow' }) {
  if (messages.length === 0) return null

  return (
    <div className={cn('mb-6 rounded-lg border p-4', tone === 'red' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50')}>
      <h4 className={cn('mb-2 flex items-center gap-2 font-medium', tone === 'red' ? 'text-red-800' : 'text-yellow-800')}>
        <AlertCircle className="h-4 w-4" />
        {title}
      </h4>
      <ul className={cn('space-y-1 text-sm', tone === 'red' ? 'text-red-700' : 'text-yellow-700')}>
        {messages.slice(0, 10).map((message, index) => (
          <li key={index}>{message}</li>
        ))}
        {messages.length > 10 && <li>...and {messages.length - 10} more</li>}
      </ul>
    </div>
  )
}
