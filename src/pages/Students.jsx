import { useState, useEffect } from 'react';
import { api } from '../api';
import { Card, Button, Badge, EmptyState, LoadingScreen } from '../components/UI';
import Modal from '../components/Modal';
import { Users, Plus, Pencil, Trash2, Search, Download, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const genderOptions = ['Male', 'Female', 'Other'];
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const initialForm = {
  uid: '', roll_number: '', enrollment_number: '',
  first_name: '', last_name: '', date_of_birth: '',
  gender: 'Male', blood_group: '', student_email: '',
  student_phone: '', parent_name: '', parent_phone: '',
  emergency_contact: '', address: {},
  admission_year: new Date().getFullYear(), class_id: '',
};

export default function Students() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [viewStudent, setViewStudent] = useState(null);

  useEffect(() => { loadData(); }, [classFilter]);

  async function loadData() {
    setLoading(true);
    try {
      const [studentsRes, classesRes] = await Promise.all([
        api.getStudents(classFilter || undefined),
        api.getClasses(),
      ]);
      if (studentsRes.success) setStudents(studentsRes.data || []);
      if (classesRes.success) setClasses(classesRes.data || []);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({ ...initialForm, class_id: classFilter || '' });
    setModalOpen(true);
  }

  function openEdit(s) {
    setEditing(s.id);
    setForm({
      uid: s.uid,
      roll_number: s.roll_number,
      enrollment_number: s.enrollment_number || '',
      first_name: s.first_name,
      last_name: s.last_name,
      date_of_birth: s.date_of_birth || '',
      gender: s.gender,
      blood_group: s.blood_group,
      student_email: s.student_email || '',
      student_phone: s.student_phone,
      parent_name: s.parent_name,
      parent_phone: s.parent_phone,
      emergency_contact: s.emergency_contact,
      address: s.address || {},
      admission_year: s.admission_year,
      class_id: s.class_id || '',
    });
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        enrollment_number: form.enrollment_number || null,
        date_of_birth: form.date_of_birth || null,
        student_email: form.student_email || null,
        class_id: form.class_id || null,
      };
      if (editing) {
        await api.updateStudent(editing, payload);
        toast.success('Student updated');
      } else {
        await api.createStudent(payload);
        toast.success('Student created');
      }
      setModalOpen(false);
      loadData();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete "${name}"? This will deactivate the student.`)) return;
    try {
      await api.deleteStudent(id);
      toast.success('Student deleted');
      loadData();
    } catch (e) {
      toast.error(e.message);
    }
  }

  function exportCSV() {
    const headers = ['Roll Number', 'Name', 'UID', 'Gender', 'Class', 'Phone', 'Parent Phone'];
    const rows = filtered.map(s => [
      s.roll_number, `${s.first_name} ${s.last_name}`, s.uid, s.gender,
      s.class_name || '', s.student_phone, s.parent_phone
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = students.filter(
    (s) =>
      s.first_name.toLowerCase().includes(search.toLowerCase()) ||
      s.last_name.toLowerCase().includes(search.toLowerCase()) ||
      s.roll_number.toLowerCase().includes(search.toLowerCase()) ||
      s.uid.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingScreen />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-sm text-gray-500 mt-1">{students.length} registered</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={exportCSV}><Download className="w-4 h-4" /> Export</Button>
          <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Student</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, roll number, or UID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        >
          <option value="">All Classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.class_name}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No students found"
          description={search || classFilter ? 'Try adjusting filters.' : 'Add a student to get started.'}
          action={!search && !classFilter && <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Student</Button>}
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">UID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Class</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Gender</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden xl:table-cell">Phone</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{s.roll_number}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setViewStudent(s)}
                        className="text-primary-600 hover:text-primary-800 font-medium hover:underline"
                      >
                        {s.first_name} {s.last_name}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs hidden md:table-cell">{s.uid}</td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{s.class_name || '—'}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <Badge variant={s.gender === 'Male' ? 'info' : s.gender === 'Female' ? 'warning' : 'default'}>
                        {s.gender}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden xl:table-cell">{s.student_phone}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(s)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id, `${s.first_name} ${s.last_name}`)}>
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Student Detail Modal */}
      <Modal open={!!viewStudent} onClose={() => setViewStudent(null)} title="Student Details" size="lg">
        {viewStudent && <StudentDetail student={viewStudent} classes={classes} />}
      </Modal>

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Student' : 'Add Student'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="UID (RFID)" required>
              <input type="text" required value={form.uid} onChange={(e) => setForm({ ...form, uid: e.target.value })} className="input" placeholder="Card UID" />
            </Field>
            <Field label="Roll Number" required>
              <input type="text" required value={form.roll_number} onChange={(e) => setForm({ ...form, roll_number: e.target.value })} className="input" />
            </Field>
            <Field label="Enrollment No.">
              <input type="text" value={form.enrollment_number} onChange={(e) => setForm({ ...form, enrollment_number: e.target.value })} className="input" />
            </Field>
            <Field label="First Name" required>
              <input type="text" required value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className="input" />
            </Field>
            <Field label="Last Name" required>
              <input type="text" required value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className="input" />
            </Field>
            <Field label="Date of Birth">
              <input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} className="input" />
            </Field>
            <Field label="Gender">
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="input">
                {genderOptions.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>
            <Field label="Blood Group">
              <select value={form.blood_group} onChange={(e) => setForm({ ...form, blood_group: e.target.value })} className="input">
                <option value="">Select</option>
                {bloodGroups.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </Field>
            <Field label="Class">
              <select value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })} className="input">
                <option value="">Unassigned</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
              </select>
            </Field>
            <Field label="Student Email">
              <input type="email" value={form.student_email} onChange={(e) => setForm({ ...form, student_email: e.target.value })} className="input" />
            </Field>
            <Field label="Student Phone">
              <input type="tel" value={form.student_phone} onChange={(e) => setForm({ ...form, student_phone: e.target.value })} className="input" />
            </Field>
            <Field label="Admission Year">
              <input type="number" min={2000} max={2099} value={form.admission_year} onChange={(e) => setForm({ ...form, admission_year: parseInt(e.target.value) || 2024 })} className="input" />
            </Field>
            <Field label="Parent Name">
              <input type="text" value={form.parent_name} onChange={(e) => setForm({ ...form, parent_name: e.target.value })} className="input" />
            </Field>
            <Field label="Parent Phone">
              <input type="tel" value={form.parent_phone} onChange={(e) => setForm({ ...form, parent_phone: e.target.value })} className="input" />
            </Field>
            <Field label="Emergency Contact">
              <input type="tel" value={form.emergency_contact} onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })} className="input" />
            </Field>
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

function StudentDetail({ student: s, classes }) {
  const className = s.class_name || classes.find(c => c.id === s.class_id)?.class_name || 'Unassigned';
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
      <DetailRow label="UID" value={<span className="font-mono">{s.uid}</span>} />
      <DetailRow label="Roll Number" value={s.roll_number} />
      <DetailRow label="Enrollment No." value={s.enrollment_number || '—'} />
      <DetailRow label="Name" value={`${s.first_name} ${s.last_name}`} />
      <DetailRow label="Date of Birth" value={s.date_of_birth || '—'} />
      <DetailRow label="Gender" value={s.gender} />
      <DetailRow label="Blood Group" value={s.blood_group || '—'} />
      <DetailRow label="Class" value={className} />
      <DetailRow label="Email" value={s.student_email || '—'} />
      <DetailRow label="Phone" value={s.student_phone || '—'} />
      <DetailRow label="Parent Name" value={s.parent_name || '—'} />
      <DetailRow label="Parent Phone" value={s.parent_phone || '—'} />
      <DetailRow label="Emergency Contact" value={s.emergency_contact || '—'} />
      <DetailRow label="Admission Year" value={s.admission_year} />
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="py-2 border-b border-gray-50">
      <span className="text-gray-400 block">{label}</span>
      <span className="text-gray-900 font-medium">{value}</span>
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
