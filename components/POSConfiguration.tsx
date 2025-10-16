'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  CreditCard, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Info,
  Key,
  Link,
  TestTube,
  Save
} from 'lucide-react'

interface POSConfig {
  id?: string
  name: string
  type: 'revel' | 'square' | 'toast' | 'custom'
  apiKey: string
  apiSecret?: string
  webhookUrl: string
  locationId: string
  syncInterval: number
  autoSync: boolean
}

interface POSConfigurationProps {
  onSave: (config: POSConfig) => void
  onTest: (config: POSConfig) => Promise<boolean>
  initialConfig?: POSConfig
  className?: string
}

export function POSConfiguration({
  onSave,
  onTest,
  initialConfig,
  className
}: POSConfigurationProps) {
  const [config, setConfig] = useState<POSConfig>(
    initialConfig || {
      name: '',
      type: 'revel',
      apiKey: '',
      webhookUrl: '',
      locationId: '',
      syncInterval: 300,
      autoSync: true
    }
  )
  
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)
  const [testMessage, setTestMessage] = useState('')

  const handleInputChange = (field: keyof POSConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }))
    setTestResult(null) // Clear test result when config changes
  }

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    setTestMessage('')
    
    try {
      const success = await onTest(config)
      setTestResult(success ? 'success' : 'error')
      setTestMessage(success 
        ? 'Connection test successful!' 
        : 'Connection test failed. Please check your credentials.'
      )
    } catch (error) {
      setTestResult('error')
      setTestMessage('Connection test failed due to an error.')
      console.error('Test error:', error)
    } finally {
      setTesting(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(config)
      setTestResult('success')
      setTestMessage('Configuration saved successfully!')
    } catch (error) {
      setTestResult('error')
      setTestMessage('Failed to save configuration.')
      console.error('Save error:', error)
    } finally {
      setSaving(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'revel': return '🔴'
      case 'square': return '⬜'
      case 'toast': return '🍞'
      default: return '💳'
    }
  }

  const getTypeDescription = (type: string) => {
    switch (type) {
      case 'revel':
        return 'Revel Systems - Full-service POS platform for restaurants and retail'
      case 'square':
        return 'Square - Mobile payment and point-of-sale solutions'
      case 'toast':
        return 'Toast - Restaurant-focused POS and management platform'
      default:
        return 'Custom POS system integration'
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-blue-600" />
          <span>POS System Configuration</span>
        </CardTitle>
        <CardDescription>
          Configure your point-of-sale system integration
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* System Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            POS System Type
          </label>
          <div className="grid grid-cols-2 gap-4">
            {(['revel', 'square', 'toast'] as const).map((type) => (
              <div
                key={type}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  config.type === type 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleInputChange('type', type)}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getTypeIcon(type)}</span>
                  <div>
                    <h3 className="font-semibold capitalize">{type}</h3>
                    <p className="text-xs text-gray-600">{getTypeDescription(type)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Basic Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              System Name
            </label>
            <input
              type="text"
              value={config.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Downtown Pub POS"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location ID
            </label>
            <input
              type="text"
              value={config.locationId}
              onChange={(e) => handleInputChange('locationId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., loc_1234567890"
            />
          </div>
        </div>

        {/* API Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Key className="h-5 w-5 text-blue-600" />
            <span>API Configuration</span>
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <input
              type="password"
              value={config.apiKey}
              onChange={(e) => handleInputChange('apiKey', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your API key"
            />
          </div>

          {config.type === 'square' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Secret
              </label>
              <input
                type="password"
                value={config.apiSecret || ''}
                onChange={(e) => handleInputChange('apiSecret', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your API secret"
              />
            </div>
          )}
        </div>

        {/* Webhook Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Link className="h-5 w-5 text-green-600" />
            <span>Webhook Configuration</span>
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Webhook URL
            </label>
            <input
              type="url"
              value={config.webhookUrl}
              onChange={(e) => handleInputChange('webhookUrl', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://api.kegtracker.com/webhooks/pos"
            />
            <p className="text-xs text-gray-500 mt-1">
              This URL will receive real-time sales data from your POS system
            </p>
          </div>
        </div>

        {/* Sync Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Settings className="h-5 w-5 text-purple-600" />
            <span>Sync Configuration</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sync Interval (seconds)
              </label>
              <select
                value={config.syncInterval}
                onChange={(e) => handleInputChange('syncInterval', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={60}>Every minute</option>
                <option value={300}>Every 5 minutes</option>
                <option value={900}>Every 15 minutes</option>
                <option value={1800}>Every 30 minutes</option>
                <option value={3600}>Every hour</option>
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="autoSync"
                checked={config.autoSync}
                onChange={(e) => handleInputChange('autoSync', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="autoSync" className="text-sm font-medium text-gray-700">
                Enable automatic syncing
              </label>
            </div>
          </div>
        </div>

        {/* Test Result */}
        {testResult && (
          <div className={`p-4 rounded-lg flex items-center space-x-3 ${
            testResult === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {testResult === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <span className={`text-sm font-medium ${
              testResult === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {testMessage}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            onClick={handleTest}
            disabled={testing || !config.apiKey || !config.locationId}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <TestTube className="h-4 w-4" />
            <span>{testing ? 'Testing...' : 'Test Connection'}</span>
          </Button>

          <Button
            onClick={handleSave}
            disabled={saving || !config.name || !config.apiKey}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </Button>
        </div>

        {/* Help Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-800">Configuration Help</h4>
              <p className="text-sm text-blue-700 mt-1">
                Need help configuring your POS system? Check our integration guides for 
                {config.type === 'revel' && ' Revel Systems'}
                {config.type === 'square' && ' Square'}
                {config.type === 'toast' && ' Toast'}
                {' '}setup instructions.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
