import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { Card, CardHeader, CardBody, Button, Badge } from '../components/UI';
import { Settings as SettingsIcon, Key, Server, Shield, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { apiKey, isAuthenticated, login, logout } = useAuth();
  const [keyInput, setKeyInput] = useState('');
  const [serverStatus, setServerStatus] = useState(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => { checkServer(); }, []);

  async function checkServer() {
    setChecking(true);
    try {
      const res = await api.health();
      setServerStatus(res.success ? res.data : null);
    } catch {
      setServerStatus(null);
    } finally {
      setChecking(false);
    }
  }

  function handleLogin(e) {
    e.preventDefault();
    if (!keyInput.trim()) {
      toast.error('Please enter an API key');
      return;
    }
    login(keyInput.trim());
    setKeyInput('');
    toast.success('API key saved');
  }

  function handleLogout() {
    logout();
    toast.success('API key removed');
  }

  async function testApiKey() {
    try {
      await api.getClasses();
      toast.success('API key is valid! Access granted.');
    } catch (e) {
      if (e.status === 401) {
        toast.error('API key is invalid or unauthorized');
      } else {
        toast.error(e.message);
      }
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage API connection and authentication</p>
      </div>

      {/* Server Status */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-gray-400" />
            <h2 className="text-base font-semibold text-gray-900">Server Status</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={checkServer} disabled={checking}>
            {checking ? 'Checking...' : 'Refresh'}
          </Button>
        </CardHeader>
        <CardBody>
          {serverStatus ? (
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium text-gray-900">Server Online</p>
                <p className="text-sm text-gray-500">Version: {serverStatus.version || 'Unknown'}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="font-medium text-gray-900">Server Offline</p>
                <p className="text-sm text-gray-500">Unable to connect to the backend server</p>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* API Key */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-gray-400" />
            <h2 className="text-base font-semibold text-gray-900">Admin API Key</h2>
          </div>
        </CardHeader>
        <CardBody>
          {isAuthenticated ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium text-gray-900">Authenticated</p>
                  <p className="text-sm text-gray-500">
                    Key: {apiKey.slice(0, 6)}{'•'.repeat(Math.max(0, apiKey.length - 6))}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={testApiKey}>Test Key</Button>
                <Button variant="danger" size="sm" onClick={handleLogout}>Remove Key</Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <p className="text-sm text-gray-500">
                Enter your admin API key to access class management, student records, and log management.
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="Enter API key..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <Button type="submit">Save Key</Button>
              </div>
            </form>
          )}
        </CardBody>
      </Card>

      {/* API Base URL */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-gray-400" />
            <h2 className="text-base font-semibold text-gray-900">Configuration</h2>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-gray-500">API Base URL</span>
              <span className="font-mono text-gray-700">{import.meta.env.VITE_API_URL || '(proxy to backend)'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-gray-500">Environment</span>
              <Badge variant={import.meta.env.DEV ? 'warning' : 'success'}>
                {import.meta.env.DEV ? 'Development' : 'Production'}
              </Badge>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Set <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">VITE_API_URL</code> in your <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">.env</code> file to configure the API endpoint.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
