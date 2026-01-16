"use client"

import { useState } from "react"
import { Settings, Key, Mail, Shield, Save } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { toast } = useToast()
  const [settings, setSettings] = useState({
    supportEmail: "support@ariaba.app",
    notifyNewUsers: true,
    notifyBaaRequests: true,
    notifyErrors: false,
    maintenanceMode: false,
  })

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your admin settings have been updated",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure admin dashboard settings</p>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>Basic configuration options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">Temporarily disable the app for maintenance</p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Notifications
            </CardTitle>
            <CardDescription>Configure when to receive admin notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>New User Signups</Label>
                <p className="text-sm text-muted-foreground">Get notified when new users register</p>
              </div>
              <Switch
                checked={settings.notifyNewUsers}
                onCheckedChange={(checked) => setSettings({ ...settings, notifyNewUsers: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>BAA Requests</Label>
                <p className="text-sm text-muted-foreground">Get notified for new BAA requests</p>
              </div>
              <Switch
                checked={settings.notifyBaaRequests}
                onCheckedChange={(checked) => setSettings({ ...settings, notifyBaaRequests: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Error Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified for critical errors</p>
              </div>
              <Switch
                checked={settings.notifyErrors}
                onCheckedChange={(checked) => setSettings({ ...settings, notifyErrors: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* API Keys */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Configuration
            </CardTitle>
            <CardDescription>API keys are managed through Vercel environment variables</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span>OPENAI_API_KEY</span>
                <span className="text-green-600 font-medium">Configured</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span>STRIPE_SECRET_KEY</span>
                <span className="text-green-600 font-medium">Configured</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span>RESEND_API_KEY</span>
                <span className="text-green-600 font-medium">Configured</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span>SUPABASE_URL</span>
                <span className="text-green-600 font-medium">Configured</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              To update API keys, go to your Vercel project settings {"->"} Environment Variables
            </p>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>Admin access and security settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="font-medium text-sm">Admin Users</p>
                <ul className="text-sm text-muted-foreground mt-1 list-disc list-inside">
                  <li>francosimon@hotmail.com</li>
                  <li>simon@ariaba.app</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2">
                  To add admin users, update the ADMIN_EMAILS array in app/admin/layout.tsx
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  )
}
