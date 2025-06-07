'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, Plus, Copy, Eye, EyeOff, AlertTriangle } from 'lucide-react';
// Using simple alert for now - can be replaced with a proper toast library later
const toast = {
  success: (message: string) => alert(`Success: ${message}`),
  error: (message: string) => alert(`Error: ${message}`),
};

interface ApiKey {
  id: string;
  label: string;
  scopes: string[];
  createdAt: string;
  lastUsedAt: string | null;
  revoked: boolean;
  revokedAt: string | null;
}

interface CreateApiKeyResponse {
  api_key: string;
  key_data: ApiKey;
  warning: string;
}

const AVAILABLE_SCOPES = [
  { value: 'skills:read', label: 'Skills Read', description: 'Read access to skills data' },
  { value: 'members:read', label: 'Members Read', description: 'Read access to members data' },
  { value: 'dashboards:read', label: 'Dashboards Read', description: 'Read access to dashboard data' },
  { value: '*', label: 'Full Access', description: 'Complete access to all endpoints' },
];

export default function ApiKeysClient() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKeyData, setNewKeyData] = useState<CreateApiKeyResponse | null>(null);
  const [showNewKey, setShowNewKey] = useState(false);
  
  // Form state
  const [label, setLabel] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/admin/api-keys');
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.data);
      } else {
        toast.error('Failed to fetch API keys');
      }
    } catch (error) {
      toast.error('Error fetching API keys');
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!label.trim() || selectedScopes.length === 0) {
      toast.error('Please provide a label and select at least one scope');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          label: label.trim(),
          scopes: selectedScopes,
        }),
      });

      if (response.ok) {
        const data: CreateApiKeyResponse = await response.json();
        setNewKeyData(data);
        setApiKeys(prev => [data.key_data, ...prev]);
        setLabel('');
        setSelectedScopes([]);
        toast.success('API key created successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create API key');
      }
    } catch (error) {
      toast.error('Error creating API key');
    } finally {
      setCreating(false);
    }
  };

  const revokeApiKey = async (keyId: string) => {
    try {
      const response = await fetch(`/api/admin/api-keys/${keyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setApiKeys(prev => prev.map(key => 
          key.id === keyId 
            ? { ...key, revoked: true, revokedAt: new Date().toISOString() }
            : key
        ));
        toast.success('API key revoked successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to revoke API key');
      }
    } catch (error) {
      toast.error('Error revoking API key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleScopeChange = (scope: string, checked: boolean) => {
    if (checked) {
      setSelectedScopes(prev => [...prev, scope]);
    } else {
      setSelectedScopes(prev => prev.filter(s => s !== scope));
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">API Key Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage API keys for accessing the MCP Server endpoints
        </p>
      </div>
      
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">API Keys</h2>
          <p className="text-muted-foreground">
            Create and manage API keys for MCP Server access
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>
                Create a new API key for accessing MCP Server endpoints.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  placeholder="e.g., Production LLM Integration"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>
              
              <div>
                <Label>Scopes</Label>
                <div className="space-y-2 mt-2">
                  {AVAILABLE_SCOPES.map((scope) => (
                    <div key={scope.value} className="flex items-start space-x-2">
                      <Checkbox
                        id={scope.value}
                        checked={selectedScopes.includes(scope.value)}
                        onCheckedChange={(checked) => 
                          handleScopeChange(scope.value, checked as boolean)
                        }
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label
                          htmlFor={scope.value}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {scope.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {scope.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                onClick={createApiKey}
                disabled={creating || !label.trim() || selectedScopes.length === 0}
              >
                {creating ? 'Creating...' : 'Create API Key'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Show new API key */}
      {newKeyData && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-3">
              <p className="font-medium">{newKeyData.warning}</p>
              <div className="flex items-center space-x-2">
                <Input
                  type={showNewKey ? 'text' : 'password'}
                  value={newKeyData.api_key}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowNewKey(!showNewKey)}
                >
                  {showNewKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(newKeyData.api_key)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setNewKeyData(null)}
              >
                I've saved the key
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* API Keys List */}
      <div className="space-y-4">
        {apiKeys.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                No API keys created yet. Create your first API key to get started.
              </div>
            </CardContent>
          </Card>
        ) : (
          apiKeys.map((apiKey) => (
            <Card key={apiKey.id} className={apiKey.revoked ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{apiKey.label}</CardTitle>
                    <CardDescription>
                      Created {formatDate(apiKey.createdAt)}
                      {apiKey.lastUsedAt && (
                        <> • Last used {formatDate(apiKey.lastUsedAt)}</>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {apiKey.revoked ? (
                      <Badge variant="destructive">Revoked</Badge>
                    ) : (
                      <Badge variant="default">Active</Badge>
                    )}
                    {!apiKey.revoked && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => revokeApiKey(apiKey.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm font-medium">Scopes:</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {apiKey.scopes.map((scope) => (
                        <Badge key={scope} variant="secondary" className="text-xs">
                          {scope}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Key ID: {apiKey.id}
                  </div>
                  {apiKey.revoked && apiKey.revokedAt && (
                    <div className="text-xs text-destructive">
                      Revoked on {formatDate(apiKey.revokedAt)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}