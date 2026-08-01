import { useState, useEffect } from 'react';
import { api } from '../api';
import { Card, CardHeader, Button, Badge, EmptyState, LoadingScreen } from '../components/UI';
import Modal from '../components/Modal';
import { GraduationCap, Plus, Pencil, Trash2, Users, Search, MapPin, Crosshair } from 'lucide-react';
import toast from 'react-hot-toast';

const initialForm = {
  class_name: '', department: '', semester: 1, section: '',
  room_number: '', class_teacher_name: '', class_teacher_email: '',
  total_capacity: 60, latitude: '', longitude: '', geofence_radius: 100,
};

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadClasses(); }, []);

  async function loadClasses() {
    try {
      const res = await api.getClasses();
      if (res.success) setClasses(res.data || []);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm(initialForm);
    setModalOpen(true);
  }

  function openEdit(c) {
    setEditing(c.id);
    setForm({
      class_name: c.class_name,
      department: c.department,
      semester: c.semester,
      section: c.section,
      room_number: c.room_number,
      class_teacher_name: c.class_teacher_name,
      class_teacher_email: c.class_teacher_email,
      total_capacity: c.total_capacity,
      latitude: c.latitude || '',
      longitude: c.longitude || '',
      geofence_radius: c.geofence_radius || 100,
    });
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        semester: parseInt(form.semester) || 1,
        total_capacity: parseInt(form.total_capacity) || 60,
        geofence_radius: parseInt(form.geofence_radius) || 100,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
      };
      if (editing) {
        await api.updateClass(editing, payload);
        toast.success('Class updated');
      } else {
        await api.createClass(payload);
        toast.success('Class created');
      }
      setModalOpen(false);
      loadClasses();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete "${name}"? This will soft-delete the class.`)) return;
    try {
      await api.deleteClass(id);
      toast.success('Class deleted');
      loadClasses();
    } catch (e) {
      toast.error(e.message);
    }
  }

  const filtered = classes.filter(
    (c) =>
      c.class_name.toLowerCase().includes(search.toLowerCase()) ||
      c.department.toLowerCase().includes(search.toLowerCase()) ||
      c.class_teacher_name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingScreen />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
          <p className="text-sm text-gray-500 mt-1">{classes.length} classes</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Class</Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search classes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No classes found"
          description={search ? 'Try different keywords.' : 'Add a class to get started.'}
          action={!search && <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Class</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{c.class_name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{c.department}</p>
                  </div>
                  <Badge variant="info">Sem {c.semester}</Badge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400">Section</span>
                    <p className="font-medium text-gray-700">{c.section || '—'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Room</span>
                    <p className="font-medium text-gray-700">{c.room_number || '—'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Teacher</span>
                    <p className="font-medium text-gray-700 truncate">{c.class_teacher_name || '—'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Students</span>
                    <p className="font-medium text-gray-700">
                      {c.student_count} / {c.total_capacity}
                    </p>
                  </div>
                </div>

                {/* Capacity bar */}
                <div className="mt-3">
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-primary-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${Math.min((c.student_count / (c.total_capacity || 1)) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id, c.class_name)}>
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </Button>
                </div>

                {(c.latitude && c.longitude) && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                    <MapPin className="w-3 h-3" />
                    GPS set ({c.latitude?.toFixed(4)}, {c.longitude?.toFixed(4)}) · {c.geofence_radius || 100}m
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Form modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Class' : 'Add Class'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Class Name" required>
              <input
                type="text"
                required
                value={form.class_name}
                onChange={(e) => setForm({ ...form, class_name: e.target.value })}
                className="input"
                placeholder="e.g. CSE-A 3rd Year"
              />
            </Field>
            <Field label="Department" required>
              <input
                type="text"
                required
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="input"
                placeholder="e.g. Computer Science"
              />
            </Field>
            <Field label="Semester">
              <input
                type="number"
                min={1}
                max={12}
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: parseInt(e.target.value) || 1 })}
                className="input"
              />
            </Field>
            <Field label="Section">
              <input
                type="text"
                value={form.section}
                onChange={(e) => setForm({ ...form, section: e.target.value })}
                className="input"
                placeholder="e.g. A"
              />
            </Field>
            <Field label="Room Number">
              <input
                type="text"
                value={form.room_number}
                onChange={(e) => setForm({ ...form, room_number: e.target.value })}
                className="input"
                placeholder="e.g. 301"
              />
            </Field>
            <Field label="Capacity">
              <input
                type="number"
                min={1}
                value={form.total_capacity}
                onChange={(e) => setForm({ ...form, total_capacity: parseInt(e.target.value) || 1 })}
                className="input"
              />
            </Field>
            <Field label="Teacher Name">
              <input
                type="text"
                value={form.class_teacher_name}
                onChange={(e) => setForm({ ...form, class_teacher_name: e.target.value })}
                className="input"
                placeholder="Full name"
              />
            </Field>
            <Field label="Teacher Email">
              <input
                type="email"
                value={form.class_teacher_email}
                onChange={(e) => setForm({ ...form, class_teacher_email: e.target.value })}
                className="input"
                placeholder="email@example.com"
              />
            </Field>
          </div>

          {/* Geofence Section */}
          <div className="border-t border-gray-100 pt-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> GPS Geofence
              </h3>
              <button
                type="button"
                onClick={() => {
                  if (!navigator.geolocation) { toast.error('Geolocation not available'); return; }
                  navigator.geolocation.getCurrentPosition(
                    (pos) => {
                      setForm(f => ({ ...f, latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) }));
                      toast.success('Current location set!');
                    },
                    () => toast.error('Failed to get location'),
                    { enableHighAccuracy: true, timeout: 10000 }
                  );
                }}
                className="text-xs text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1"
              >
                <Crosshair className="w-3.5 h-3.5" /> Use Current Location
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Latitude">
                <input
                  type="number"
                  step="0.000001"
                  value={form.latitude}
                  onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                  className="input"
                  placeholder="e.g. 28.649944"
                />
              </Field>
              <Field label="Longitude">
                <input
                  type="number"
                  step="0.000001"
                  value={form.longitude}
                  onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                  className="input"
                  placeholder="e.g. 77.228001"
                />
              </Field>
              <Field label="Radius (m)">
                <input
                  type="number"
                  min={10}
                  max={1000}
                  value={form.geofence_radius}
                  onChange={(e) => setForm({ ...form, geofence_radius: parseInt(e.target.value) || 100 })}
                  className="input"
                  placeholder="100"
                />
              </Field>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Set the classroom GPS coordinates. Students within this radius will be marked as "in class".
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
