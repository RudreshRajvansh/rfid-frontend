import { useState, useEffect } from 'react';
import { api } from '../api';
import { Card, CardHeader, Button, Badge, EmptyState, LoadingScreen } from '../components/UI';
import Modal from '../components/Modal';
import { Wifi, Plus, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ mac_address: '', label: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadDevices(); }, []);

  async function loadDevices() {
    try {
      const res = await api.getDevices();
      if (res.success) setDevices(res.data || []);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createDevice(form);
      toast.success('Device saved');
      setModalOpen(false);
      setForm({ mac_address: '', label: '' });
      loadDevices();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  function isOnline(lastSeen) {
    if (!lastSeen) return false;
    const diff = Date.now() - new Date(lastSeen).getTime();
    return diff < 10 * 60 * 1000;
  }

  if (loading) return <LoadingScreen />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Devices</h1>
          <p className="text-sm text-gray-500 mt-1">{devices.length} registered ESP8266 readers</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" /> Add Device
        </Button>
      </div>

      {devices.length === 0 ? (
        <EmptyState
          icon={Wifi}
          title="No devices registered"
          description="Devices are auto-registered when they first scan a card. You can also add them manually."
          action={<Button onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" /> Add Device</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((d) => (
            <Card key={d.id} className="hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isOnline(d.last_seen) ? 'bg-green-50' : 'bg-gray-100'}`}>
                      <Wifi className={`w-5 h-5 ${isOnline(d.last_seen) ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{d.label || 'Unnamed Device'}</h3>
                      <p className="text-xs font-mono text-gray-500">{d.mac_address}</p>
                    </div>
                  </div>
                  <Badge variant={isOnline(d.last_seen) ? 'success' : 'default'}>
                    {isOnline(d.last_seen) ? 'Online' : 'Offline'}
                  </Badge>
                </div>
                <div className="mt-3 text-sm text-gray-500">
                  Last seen: {d.last_seen ? new Date(d.last_seen).toLocaleString() : 'Never'}
                </div>
                <div className="mt-3">
                  <Button variant="ghost" size="sm" onClick={() => {
                    setForm({ mac_address: d.mac_address, label: d.label || '' });
                    setModalOpen(true);
                  }}>
                    <Pencil className="w-3.5 h-3.5" /> Edit Label
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add / Edit Device">
        <form onSubmit={handleSave} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">MAC Address <span className="text-red-500">*</span></span>
            <input
              type="text"
              required
              value={form.mac_address}
              onChange={(e) => setForm({ ...form, mac_address: e.target.value })}
              className="input mt-1"
              placeholder="AA:BB:CC:DD:EE:FF"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Label</span>
            <input
              type="text"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              className="input mt-1"
              placeholder="e.g. Room 301 Reader"
            />
          </label>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
