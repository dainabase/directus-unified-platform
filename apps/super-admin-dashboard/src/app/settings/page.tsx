'use client';

import {
  Form,
  Input,
  Textarea,
  Select,
  Switch,
  Button,
  Card,
  Tabs,
  Label,
  Separator,
  Alert,
  Badge,
  Icon,
  RadioGroup,
  Checkbox
} from '../../../../packages/ui/src';
import { useState } from 'react';
import { Save, AlertCircle, Check, Shield, Bell, Globe, Database, Mail } from 'lucide-react';

export default function SettingsPage() {
  const [savedSection, setSavedSection] = useState<string | null>(null);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [publicProfile, setPublicProfile] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);

  const handleSave = (section: string) => {
    setSavedSection(section);
    setTimeout(() => setSavedSection(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Success Alert */}
      {savedSection && (
        <Alert variant="success" className="animate-slide-in">
          <Check className="h-4 w-4" />
          <div className="ml-2">
            <p className="font-medium">Settings saved successfully!</p>
            <p className="text-sm">Your {savedSection} settings have been updated.</p>
          </div>
        </Alert>
      )}

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <Tabs.List className="grid w-full grid-cols-2 lg:grid-cols-5">
          <Tabs.Trigger value="general">
            <Icon name="Settings" className="h-4 w-4 mr-2" />
            General
          </Tabs.Trigger>
          <Tabs.Trigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </Tabs.Trigger>
          <Tabs.Trigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Tabs.Trigger>
          <Tabs.Trigger value="api">
            <Globe className="h-4 w-4 mr-2" />
            API
          </Tabs.Trigger>
          <Tabs.Trigger value="database">
            <Database className="h-4 w-4 mr-2" />
            Database
          </Tabs.Trigger>
        </Tabs.List>

        {/* General Settings */}
        <Tabs.Content value="general">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-6">General Settings</h2>
            <Form onSubmit={(e) => {
              e.preventDefault();
              handleSave('general');
            }}>
              <div className="space-y-6">
                {/* Organization Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Organization Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Field name="orgName">
                      <Form.Label>Organization Name</Form.Label>
                      <Input defaultValue="Dainabase Inc." />
                    </Form.Field>
                    <Form.Field name="orgEmail">
                      <Form.Label>Contact Email</Form.Label>
                      <Input type="email" defaultValue="contact@dainabase.com" />
                    </Form.Field>
                  </div>
                  <Form.Field name="orgDescription">
                    <Form.Label>Description</Form.Label>
                    <Textarea 
                      defaultValue="Leading provider of unified platform solutions"
                      rows={3}
                    />
                  </Form.Field>
                </div>

                <Separator />

                {/* Localization */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Localization</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Field name="timezone">
                      <Form.Label>Timezone</Form.Label>
                      <Select defaultValue="utc">
                        <Select.Trigger>
                          <Select.Value />
                        </Select.Trigger>
                        <Select.Content>
                          <Select.Item value="utc">UTC</Select.Item>
                          <Select.Item value="est">Eastern Time</Select.Item>
                          <Select.Item value="pst">Pacific Time</Select.Item>
                          <Select.Item value="cet">Central European Time</Select.Item>
                        </Select.Content>
                      </Select>
                    </Form.Field>
                    <Form.Field name="language">
                      <Form.Label>Language</Form.Label>
                      <Select defaultValue="en">
                        <Select.Trigger>
                          <Select.Value />
                        </Select.Trigger>
                        <Select.Content>
                          <Select.Item value="en">English</Select.Item>
                          <Select.Item value="fr">Français</Select.Item>
                          <Select.Item value="de">Deutsch</Select.Item>
                          <Select.Item value="es">Español</Select.Item>
                        </Select.Content>
                      </Select>
                    </Form.Field>
                  </div>
                  <Form.Field name="dateFormat">
                    <Form.Label>Date Format</Form.Label>
                    <RadioGroup defaultValue="mdy">
                      <div className="flex items-center space-x-2">
                        <RadioGroup.Item value="mdy" id="mdy" />
                        <Label htmlFor="mdy">MM/DD/YYYY</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroup.Item value="dmy" id="dmy" />
                        <Label htmlFor="dmy">DD/MM/YYYY</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroup.Item value="ymd" id="ymd" />
                        <Label htmlFor="ymd">YYYY-MM-DD</Label>
                      </div>
                    </RadioGroup>
                  </Form.Field>
                </div>

                <Separator />

                {/* Display Preferences */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Display Preferences</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Compact Mode</Label>
                        <p className="text-sm text-muted-foreground">
                          Show more content in less space
                        </p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show Tooltips</Label>
                        <p className="text-sm text-muted-foreground">
                          Display helpful hints on hover
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </Form>
          </Card>
        </Tabs.Content>

        {/* Security Settings */}
        <Tabs.Content value="security">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-6">Security Settings</h2>
            <div className="space-y-6">
              {/* Password */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Password</h3>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Change Password</p>
                    <p className="text-sm text-muted-foreground">
                      Last changed 30 days ago
                    </p>
                  </div>
                  <Button variant="outline">Change</Button>
                </div>
              </div>

              <Separator />

              {/* Two-Factor Authentication */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Enable 2FA</p>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch
                    checked={twoFactorAuth}
                    onCheckedChange={setTwoFactorAuth}
                  />
                </div>
                {twoFactorAuth && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <div className="ml-2">
                      <p className="text-sm">
                        Scan the QR code with your authenticator app to complete setup
                      </p>
                    </div>
                  </Alert>
                )}
              </div>

              <Separator />

              {/* Sessions */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Active Sessions</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon name="Monitor" className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Chrome on MacOS</p>
                        <p className="text-sm text-muted-foreground">
                          Current session · San Francisco, CA
                        </p>
                      </div>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon name="Smartphone" className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Safari on iPhone</p>
                        <p className="text-sm text-muted-foreground">
                          2 hours ago · New York, NY
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Revoke
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave('security')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Security Settings
                </Button>
              </div>
            </div>
          </Card>
        </Tabs.Content>

        {/* Notification Settings */}
        <Tabs.Content value="notifications">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-6">Notification Settings</h2>
            <div className="space-y-6">
              {/* Email Notifications */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Notifications
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>All Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive all email notifications
                      </p>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  {emailNotifications && (
                    <>
                      <div className="ml-6 space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox defaultChecked />
                          <Label>Security alerts</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox defaultChecked />
                          <Label>System updates</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox />
                          <Label>Marketing emails</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox defaultChecked />
                          <Label>Weekly reports</Label>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Separator />

              {/* Push Notifications */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Push Notifications
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Browser Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notifications in your browser
                      </p>
                    </div>
                    <Switch
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave('notifications')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Notification Settings
                </Button>
              </div>
            </div>
          </Card>
        </Tabs.Content>

        {/* API Settings */}
        <Tabs.Content value="api">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-6">API Settings</h2>
            <div className="space-y-6">
              {/* API Keys */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">API Keys</h3>
                  <Button variant="outline" size="sm">
                    <Icon name="Plus" className="h-4 w-4 mr-2" />
                    Generate New Key
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Production API Key</p>
                        <p className="text-sm text-muted-foreground">
                          sk_live_****************************3a2f
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Created on Jan 15, 2024 · Last used 2 hours ago
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Icon name="Copy" className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Icon name="Trash" className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Development API Key</p>
                        <p className="text-sm text-muted-foreground">
                          sk_test_****************************8b5c
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Created on Jan 10, 2024 · Never used
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Icon name="Copy" className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Icon name="Trash" className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Webhooks */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Webhooks</h3>
                  <Button variant="outline" size="sm">
                    <Icon name="Plus" className="h-4 w-4 mr-2" />
                    Add Webhook
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  No webhooks configured yet
                </div>
              </div>
            </div>
          </Card>
        </Tabs.Content>

        {/* Database Settings */}
        <Tabs.Content value="database">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-6">Database Settings</h2>
            <div className="space-y-6">
              {/* Connection Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Connection Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Host</Label>
                    <Input value="db.dainabase.com" readOnly />
                  </div>
                  <div>
                    <Label>Port</Label>
                    <Input value="5432" readOnly />
                  </div>
                  <div>
                    <Label>Database</Label>
                    <Input value="directus_prod" readOnly />
                  </div>
                  <div>
                    <Label>SSL Mode</Label>
                    <Input value="Required" readOnly />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Backup Settings */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Backup Settings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Automatic Backups</Label>
                      <p className="text-sm text-muted-foreground">
                        Daily backups at 2:00 AM UTC
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Backup Retention</Label>
                      <p className="text-sm text-muted-foreground">
                        Keep backups for 30 days
                      </p>
                    </div>
                    <Select defaultValue="30">
                      <Select.Trigger className="w-[100px]">
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="7">7 days</Select.Item>
                        <Select.Item value="14">14 days</Select.Item>
                        <Select.Item value="30">30 days</Select.Item>
                        <Select.Item value="60">60 days</Select.Item>
                        <Select.Item value="90">90 days</Select.Item>
                      </Select.Content>
                    </Select>
                  </div>
                </div>
                <Button variant="outline">
                  <Icon name="Download" className="h-4 w-4 mr-2" />
                  Create Manual Backup
                </Button>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave('database')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Database Settings
                </Button>
              </div>
            </div>
          </Card>
        </Tabs.Content>
      </Tabs>
    </div>
  );
}
