"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, Key, RefreshCw, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function ApiKeyStatus() {
  const [keyStatus, setKeyStatus] = useState<"checking" | "active" | "blocked" | "missing">("checking")
  const [showInstructions, setShowInstructions] = useState(false)

  useEffect(() => {
    checkApiKeyStatus()
  }, [])

  const checkApiKeyStatus = async () => {
    try {
      const response = await fetch("/api/test-grok")
      const data = await response.json()

      if (data.success) {
        setKeyStatus("active")
      } else if (data.reason === "api_key_blocked_security") {
        setKeyStatus("blocked")
      } else {
        setKeyStatus("missing")
      }
    } catch (error) {
      setKeyStatus("blocked")
    }
  }

  if (keyStatus === "checking") {
    return (
      <Alert className="bg-blue-900/20 border-blue-600/30">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <AlertDescription>Checking API key status...</AlertDescription>
      </Alert>
    )
  }

  if (keyStatus === "active") {
    return (
      <Alert className="bg-green-900/20 border-green-600/30">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <AlertDescription className="text-green-200">Grok API is active and working properly</AlertDescription>
      </Alert>
    )
  }

  if (keyStatus === "blocked") {
    return (
      <Alert className="bg-red-900/20 border-red-600/30">
        <AlertTriangle className="h-4 w-4 text-red-500" />
        <AlertDescription className="text-red-200">
          <div className="space-y-2">
            <p>
              <strong>API Key Blocked:</strong> Your Grok API key has been blocked for security reasons.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowInstructions(!showInstructions)}
                className="text-red-200 border-red-600"
              >
                <Key className="w-4 h-4 mr-1" />
                Get New Key
              </Button>
              <Button size="sm" variant="outline" onClick={checkApiKeyStatus} className="text-red-200 border-red-600">
                <RefreshCw className="w-4 h-4 mr-1" />
                Recheck
              </Button>
            </div>

            {showInstructions && (
              <div className="mt-3 p-3 bg-gray-800 rounded text-sm">
                <p className="font-medium mb-2">To get a new API key:</p>
                <ol className="list-decimal list-inside space-y-1 text-gray-300">
                  <li>
                    Visit{" "}
                    <a
                      href="https://console.x.ai/"
                      target="_blank"
                      className="text-blue-400 underline"
                      rel="noreferrer"
                    >
                      console.x.ai
                    </a>
                  </li>
                  <li>Generate a new API key</li>
                  <li>Update your environment variables</li>
                  <li>Restart the application</li>
                </ol>
                <p className="mt-2 text-yellow-300">
                  <strong>Note:</strong> The app continues to work with real sports data and enhanced responses.
                </p>
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return null
}
