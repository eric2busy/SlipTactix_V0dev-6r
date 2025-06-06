"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, ExternalLink, RefreshCw, Key, Loader2 } from "lucide-react"

export function SportsApiStatus() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkApiStatus = async () => {
    setLoading(true)
    setStatus(null) // Clear previous status
    try {
      const response = await fetch("/api/diagnose-sports-api")
      const data = await response.json()
      setStatus(data)
    } catch (error: any) {
      setStatus({
        success: false,
        message: "Failed to connect to the diagnosis endpoint.",
        error: error.message,
        diagnosis: { recommendations: ["Check network connection or server logs for /api/diagnose-sports-api."] },
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkApiStatus()
  }, [])

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5" />
          Sports Games Odds API Status
          {status && (
            <Badge
              variant={status.success && status.diagnosis?.workingEndpoints?.length > 0 ? "default" : "destructive"}
            >
              {status.success && status.diagnosis?.workingEndpoints?.length > 0 ? "Working" : "Issues Detected"}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Diagnosis for real-time NBA odds, props, and betting data from sportsgameodds.com.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && !status && (
          <div className="flex items-center justify-center p-6">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <span className="ml-2">Checking API Status...</span>
          </div>
        )}

        {status && (
          <Alert
            className={
              status.success && status.diagnosis?.workingEndpoints?.length > 0
                ? "border-green-600 bg-green-900/20 text-green-200"
                : "border-red-600 bg-red-900/20 text-red-200"
            }
          >
            {status.success && status.diagnosis?.workingEndpoints?.length > 0 ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
            <AlertDescription className="space-y-2">
              <p className="font-semibold">{status.message}</p>

              {status.diagnosis?.environment && (
                <div className="mt-2 p-3 bg-background/30 rounded text-sm">
                  <p className="font-medium mb-1 text-foreground">Environment:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>
                      API Key Present in Env:{" "}
                      {status.diagnosis.environment.apiKeyPresent ? (
                        <span className="text-green-400">✅ Yes</span>
                      ) : (
                        <span className="text-red-400">❌ No</span>
                      )}
                    </li>
                    {status.diagnosis.environment.apiKeyPresent && (
                      <li>API Key Prefix: {status.diagnosis.environment.apiKeyPrefix}</li>
                    )}
                  </ul>
                </div>
              )}

              {status.diagnosis?.endpointsTested && (
                <div className="mt-2 p-3 bg-background/30 rounded text-sm">
                  <p className="font-medium mb-1 text-foreground">Endpoint Tests:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    {status.diagnosis.endpointsTested.map((ep: any, index: number) => (
                      <li key={index} className="flex justify-between items-center">
                        <span>
                          {ep.description} ({ep.path}):
                        </span>
                        {ep.success && ep.dataCount > 0 ? (
                          <Badge variant="default" className="text-xs">
                            ✅ OK ({ep.dataCount} items)
                          </Badge>
                        ) : ep.success && ep.dataCount === 0 ? (
                          <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-300">
                            ⚠️ OK (No Data)
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">
                            ❌ Error
                          </Badge>
                        )}
                      </li>
                    ))}
                    {status.diagnosis.errors && status.diagnosis.errors.length > 0 && (
                      <li className="text-red-400 text-xs pt-1">Errors: {status.diagnosis.errors.join("; ")}</li>
                    )}
                  </ul>
                </div>
              )}

              {status.diagnosis?.recommendations && status.diagnosis.recommendations.length > 0 && (
                <div className="mt-2 p-3 bg-background/30 rounded text-sm">
                  <p className="font-medium mb-1 text-foreground">Recommendations:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {status.diagnosis.recommendations.map((rec: string, index: number) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
              {status.error && !status.diagnosis && <p className="text-xs text-red-400">Details: {status.error}</p>}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button onClick={checkApiStatus} disabled={loading} variant="outline">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <RefreshCw className="w-4 h-4 mr-1" />}
            Refresh Status
          </Button>
          <Button variant="outline" asChild>
            <a href="https://sportsgameodds.com/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-1" />
              Get API Key
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
