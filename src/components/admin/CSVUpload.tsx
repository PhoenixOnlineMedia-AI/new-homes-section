'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, AlertCircle, Check, X, Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { parseCSV, readFileAsText, validateCSVData, CSVParseResult, generateCSVTemplate } from '@/lib/csv/parser'
import { CSVTemplate } from '@/lib/csv/templates'
import { cn } from '@/lib/utils'

interface CSVUploadProps {
  template: CSVTemplate
  onUpload: (data: Record<string, string>[]) => Promise<{ success: boolean; message: string; errors?: string[] }>
  batchSize?: number
}

export function CSVUpload({ template, onUpload, batchSize = 100 }: CSVUploadProps) {
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string; errors?: string[] } | null>(null)
  const [uploadProgress, setUploadProgress] = useState<{
    processed: number
    total: number
    currentBatch: number
    totalBatches: number
  } | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    try {
      const content = await readFileAsText(file)
      const result = parseCSV(content, {
        requiredColumns: template.requiredColumns,
      })

      // Additional validation
      const { errors, warnings } = validateCSVData(result.data, template.validationRules)
      result.errors.push(...errors)
      result.warnings.push(...warnings)

      setParseResult(result)
      setUploadResult(null)
      setUploadProgress(null)
    } catch {
      setParseResult({
        data: [],
        headers: [],
        rowCount: 0,
        errors: [{ row: 0, column: '', message: 'Failed to parse file' }],
        warnings: [],
      })
    }
  }, [template])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
  })

  const handleDownloadTemplate = () => {
    const csv = generateCSVTemplate(template.headers, template.sampleData)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${template.name.toLowerCase()}-template.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleUpload = async () => {
    if (!parseResult || parseResult.data.length === 0) return

    setIsUploading(true)
    setUploadResult(null)

    const total = parseResult.data.length
    const totalBatches = Math.ceil(total / batchSize)
    const errors: string[] = []
    let successCount = 0

    try {
      for (let index = 0; index < totalBatches; index++) {
        const start = index * batchSize
        const batch = parseResult.data.slice(start, start + batchSize)

        setUploadProgress({
          processed: start,
          total,
          currentBatch: index + 1,
          totalBatches,
        })

        const result = await onUpload(batch)
        const processedMatch = result.message.match(/processed (\d+) of/i)
        const processedCount = processedMatch ? Number(processedMatch[1]) : result.success ? batch.length : 0

        successCount += Number.isFinite(processedCount) ? processedCount : 0

        if (result.errors?.length) {
          errors.push(...result.errors)
        }

        if (!result.success && !result.errors?.length) {
          errors.push(result.message)
        }

        setUploadProgress({
          processed: Math.min(start + batch.length, total),
          total,
          currentBatch: index + 1,
          totalBatches,
        })
      }

      setUploadResult({
        success: errors.length === 0,
        message: `Successfully processed ${successCount} of ${total} records`,
        errors: errors.length > 0 ? errors : undefined,
      })
    } catch (error) {
      setUploadResult({
        success: false,
        message: error instanceof Error ? error.message : 'Upload failed',
        errors: errors.length > 0 ? errors : undefined,
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleClear = () => {
    setParseResult(null)
    setUploadResult(null)
    setUploadProgress(null)
  }

  const hasErrors = parseResult && parseResult.errors.length > 0
  const hasData = parseResult && parseResult.data.length > 0

  return (
    <div className="space-y-6">
      {/* Template Download */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">CSV Template</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Download the template file with the correct column headers and sample data.
          </p>
          <Button variant="outline" onClick={handleDownloadTemplate}>
            <Download className="w-4 h-4 mr-2" />
            Download {template.name} Template
          </Button>
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Required Columns:</h4>
            <div className="flex flex-wrap gap-2">
              {template.requiredColumns.map((col) => (
                <span
                  key={col}
                  className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full border border-red-200"
                >
                  {col}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Optional Columns:</h4>
            <div className="flex flex-wrap gap-2">
              {template.headers
                .filter((col) => !template.requiredColumns.includes(col))
                .map((col) => (
                  <span
                    key={col}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {col}
                  </span>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload CSV File</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            )}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-blue-600 font-medium">Drop the CSV file here</p>
            ) : (
              <>
                <p className="text-gray-600 mb-2">
                  Drag and drop a CSV file here, or click to select
                </p>
                <p className="text-sm text-gray-400">
                  Supports .csv files only
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Parse Results */}
      {parseResult && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">File Analysis</CardTitle>
            <Button variant="ghost" size="sm" onClick={handleClear}>
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {parseResult.rowCount}
                </div>
                <div className="text-sm text-gray-600">Rows</div>
              </div>
              <div className={cn(
                'p-4 rounded-lg text-center',
                parseResult.errors.length > 0 ? 'bg-red-50' : 'bg-green-50'
              )}>
                <div className={cn(
                  'text-2xl font-bold',
                  parseResult.errors.length > 0 ? 'text-red-700' : 'text-green-700'
                )}>
                  {parseResult.errors.length}
                </div>
                <div className="text-sm text-gray-600">Errors</div>
              </div>
              <div className={cn(
                'p-4 rounded-lg text-center',
                parseResult.warnings.length > 0 ? 'bg-yellow-50' : 'bg-green-50'
              )}>
                <div className={cn(
                  'text-2xl font-bold',
                  parseResult.warnings.length > 0 ? 'text-yellow-700' : 'text-green-700'
                )}>
                  {parseResult.warnings.length}
                </div>
                <div className="text-sm text-gray-600">Warnings</div>
              </div>
            </div>

            {/* Errors */}
            {parseResult.errors.length > 0 && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="flex items-center gap-2 font-medium text-red-800 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  Errors
                </h4>
                <ul className="space-y-1 text-sm text-red-700">
                  {parseResult.errors.slice(0, 10).map((error, idx) => (
                    <li key={idx}>
                      Row {error.row}: {error.column && <span className="font-medium">{error.column}</span>} {error.message}
                      {error.value && <span className="text-red-600"> (&quot;{error.value}&quot;)</span>}
                    </li>
                  ))}
                  {parseResult.errors.length > 10 && (
                    <li>...and {parseResult.errors.length - 10} more errors</li>
                  )}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {parseResult.warnings.length > 0 && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="flex items-center gap-2 font-medium text-yellow-800 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  Warnings
                </h4>
                <ul className="space-y-1 text-sm text-yellow-700">
                  {parseResult.warnings.slice(0, 10).map((warning, idx) => (
                    <li key={idx}>
                      Row {warning.row}: {warning.column && <span className="font-medium">{warning.column}</span>} {warning.message}
                    </li>
                  ))}
                  {parseResult.warnings.length > 10 && (
                    <li>...and {parseResult.warnings.length - 10} more warnings</li>
                  )}
                </ul>
              </div>
            )}

            {/* Data Preview */}
            {hasData && parseResult.data.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Data Preview (first 5 rows)</h4>
                <div className="overflow-x-auto border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {parseResult.headers.slice(0, 6).map((header) => (
                          <TableHead key={header} className="whitespace-nowrap">
                            {header}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parseResult.data.slice(0, 5).map((row, idx) => (
                        <TableRow key={idx}>
                          {parseResult.headers.slice(0, 6).map((header) => (
                            <TableCell key={header} className="max-w-[150px] truncate">
                              {row[header] || '-'}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {parseResult.data.length > 5 && (
                  <p className="text-sm text-gray-500 mt-2">
                    ...and {parseResult.data.length - 5} more rows
                  </p>
                )}
              </div>
            )}

            {/* Upload Button */}
            {hasData && !hasErrors && (
              <div className="space-y-4">
                {uploadProgress && (
                  <div className="rounded-lg border bg-gray-50 p-4">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">
                        Processing batch {uploadProgress.currentBatch} of {uploadProgress.totalBatches}
                      </span>
                      <span className="text-gray-500">
                        {uploadProgress.processed} / {uploadProgress.total} rows
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all duration-300"
                        style={{
                          width: `${Math.max(2, Math.round((uploadProgress.processed / uploadProgress.total) * 100))}%`,
                        }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Large files are uploaded in batches of {batchSize} so the page can report progress and avoid request timeouts.
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading {uploadProgress ? `${uploadProgress.processed} of ${uploadProgress.total}` : parseResult.rowCount} records...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Upload {parseResult.rowCount} Records
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload Result */}
      {uploadResult && (
        <Card className={uploadResult.success ? 'border-green-500' : 'border-red-500'}>
          <CardContent className="pt-6">
            <div className={cn(
              'flex items-center gap-3',
              uploadResult.success ? 'text-green-700' : 'text-red-700'
            )}>
              {uploadResult.success ? (
                <Check className="w-6 h-6" />
              ) : (
                <AlertCircle className="w-6 h-6" />
              )}
              <div>
                <h4 className="font-medium">
                  {uploadResult.success ? 'Upload Successful' : 'Upload Failed'}
                </h4>
                <p className="text-sm">{uploadResult.message}</p>
              </div>
            </div>
            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <ul className="mt-4 space-y-1 text-sm text-red-600">
                {uploadResult.errors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
