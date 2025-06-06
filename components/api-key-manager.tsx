"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, Key, ExternalLink, RefreshCw } from "lucide-react"

export function ApiKeyManager() {
  const [newKey, setNewKey] = useState("")
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testApiKey = async () => {
    if (!newKey.trim()) {
      setResult({ success: false, message: "Please enter an API key" })
      return
    }

    setTesting(true)
    setResult(null)

    try {
      const response = await fetch("/api/secure-key-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test", apiKey: newKey.trim() }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ success: false, message: "Failed to test API key" })
    } finally {
      setTesting(false)
    }
  }

  const checkCurrentStatus = async () => {
    setTesting(true)
    try {
      const response = await fetch("/api/secure-key-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "status" }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ success: false, message: "Failed to check status" })
    } finally {
      setTesting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5" />
          Grok API Key Manager
        </CardTitle>
        <CardDescription>
          Securely test and configure your Grok API key. Your key is never stored or logged.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="api-key" className="text-sm font-medium">
            New API Key
          </label>
          <div className="flex gap-2">
            <Input
              id="api-key"
              type="password"
              placeholder="xai-..."
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="flex-1"
            />
            <Button onClick={testApiKey} disabled={testing}>
              {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Test"}
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={checkCurrentStatus} disabled={testing}>
            Check Current Status
          </Button>
          <Button variant="outline" asChild>
            <a href="https://console.x.ai/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-1" />
              Get New Key
            </a>
          </Button>
        </div>

        {result && (
          <Alert className={result.success ? "border-green-600 bg-green-900/20" : "border-red-600 bg-red-900/20"}>
            {result.success ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
            <AlertDescription>
              <div className="space-y-2">
                <p className={result.success ? "text-green-200" : "text-red-200"}>{result.message}</p>

                {result.success && result.instructions && (
                  <div className="mt-2 p-2 bg-gray-800 rounded text-sm">
                    <p className="font-medium mb-1">Next steps:</p>
                    <ol className="list-decimal list-inside space-y-1 text-gray-300">
                      {result.instructions.map((instruction: string, index: number) => (
                        <li key={index}>{instruction}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {result.status === "blocked" && (
                  <div className="mt-2 p-2 bg-red-900/30 rounded text-sm">
                    <p className="text-red-200">
                      This API key is blocked. Visit{" "}
                      <a href="https://console.x.ai/" className="underline" target="_blank" rel="noopener noreferrer">
                        console.x.ai
                      </a>{" "}
                      to generate a fresh key.
                    </p>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
