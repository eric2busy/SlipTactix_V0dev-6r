"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, ExternalLink, RefreshCw, Activity, Database, Bot, Zap } from "lucide-react"

export function SystemStatusDashboard() {
  const [diagnosis, setDiagnosis] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runFullDiagnosis = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/full-system-diagnosis")
      const data = await response.json()
      setDiagnosis(data)
    } catch (error) {
      setDiagnosis({
        success: false,
        message: "Failed to run system diagnosis",
        error: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runFullDiagnosis()
  }, [])

  if (!diagnosis) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Running full system diagnosis...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusIcon = (working: boolean) => {
    return working ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <AlertTriangle className="w-4 h-4 text-red-500" />
    )
  }

  const getStatusColor = (working: boolean) => {
    return working ? "border-green-600 bg-green-900/20" : "border-red-600 bg-red-900/20"
  }

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            System Status
            <Badge variant={diagnosis.success ? "default" : "destructive"}>
              {diagnosis.success ? "All Systems Operational" : "Issues Detected"}
            </Badge>
          </CardTitle>
          <CardDescription>Last checked: {new Date(diagnosis.diagnosis?.timestamp).toLocaleString()}</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className={getStatusColor(diagnosis.success)}>
            {getStatusIcon(diagnosis.success)}
            <AlertDescription>
              <div className="space-y-2">
                <p className={diagnosis.success ? "text-green-200" : "text-red-200"}>{diagnosis.message}</p>
                {diagnosis.diagnosis?.summary && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm font-medium">APIs Working</p>
                      <p className="text-lg">{diagnosis.diagnosis.summary.workingApis}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Endpoints Working</p>
                      <p className="text-lg">{diagnosis.diagnosis.summary.workingEndpoints}</p>
                    </div>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* API Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sports Games Odds API */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Sports Games Odds API
              {getStatusIcon(diagnosis.diagnosis?.apiTests?.sportsGamesOdds?.workingEndpoints?.length > 0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                Key: {diagnosis.diagnosis?.environment?.apiKeys?.sportsApiKey?.present ? "✅ Present" : "❌ Missing"}
              </p>
              <p className="text-sm">
                Working Endpoints: {diagnosis.diagnosis?.apiTests?.sportsGamesOdds?.workingEndpoints?.length || 0}
              </p>
              <p className="text-sm">Errors: {diagnosis.diagnosis?.apiTests?.sportsGamesOdds?.errors?.length || 0}</p>
            </div>
          </CardContent>
        </Card>

        {/* Grok API */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Grok AI API
              {getStatusIcon(diagnosis.diagnosis?.apiTests?.grok?.working)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                Key: {diagnosis.diagnosis?.environment?.apiKeys?.grokApiKey?.present ? "✅ Present" : "❌ Missing"}
              </p>
              <p className="text-sm">Status: {diagnosis.diagnosis?.apiTests?.grok?.status || "Not tested"}</p>
            </div>
          </CardContent>
        </Card>

        {/* ESPN API (Fallback) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              ESPN API (Fallback)
              {getStatusIcon(diagnosis.diagnosis?.apiTests?.espn?.working)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">Status: {diagnosis.diagnosis?.apiTests?.espn?.status || "Not tested"}</p>
              <p className="text-sm">Games Found: {diagnosis.diagnosis?.apiTests?.espn?.gamesFound || 0}</p>
            </div>
          </CardContent>
        </Card>

        {/* Supabase */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Supabase Database
              {getStatusIcon(diagnosis.diagnosis?.apiTests?.supabase?.working)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                URL: {diagnosis.diagnosis?.environment?.apiKeys?.supabaseUrl?.present ? "✅ Present" : "❌ Missing"}
              </p>
              <p className="text-sm">
                Key: {diagnosis.diagnosis?.environment?.apiKeys?.supabaseKey?.present ? "✅ Present" : "❌ Missing"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      {diagnosis.diagnosis?.recommendations && diagnosis.diagnosis.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {diagnosis.diagnosis.recommendations.map((rec: string, index: number) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-sm">{rec}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={runFullDiagnosis} disabled={loading} variant="outline">
          {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-1" /> : "Run Diagnosis"}
        </Button>
        <Button variant="outline" asChild>
          <a href="https://sportsgameodds.com/" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-1" />
            Get Sports API Key
          </a>
        </Button>
      </div>
    </div>
  )
}
