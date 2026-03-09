import { useState, useEffect } from 'react';
import { api } from '../api';
import { Card, CardHeader, CardBody, Button, Badge, EmptyState, LoadingScreen } from '../components/UI';
import { ClipboardList, Download, UserCheck, UserX, Clock } from 'lucide-react';
import { format } from 'date-fns';
import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
} from 'recharts';
import toast from 'react-hot-toast';

const PIE_COLORS = ['#22c55e', '#ef4444'];

export default function Attendance() {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [classLoading, setClassLoading] = useState(true);

  useEffect(() => {
    api.getClasses().then(res => {
      if (res.success) setClasses(res.data || []);
    }).catch(() => {}).finally(() => setClassLoading(false));
  }, []);

  useEffect(() => {
    if (classId && date) loadReport();
  }, [classId, date]);

  async function loadReport() {
    setLoading(true);
    try {
      const res = await api.getDailyReport(date, classId);
      if (res.success) setReport(res.data || []);
    } catch (e) {
      toast.error(e.message);
      setReport(null);
    } finally {
      setLoading(false);
    }
  }

  function exportCSV() {
    if (!report) return;
    const headers = ['Roll Number', 'First Name', 'Last Name', 'Status', 'First In', 'Last Out', 'Total Scans'];
    const rows = report.map(s => [
      s.roll_number, s.first_name, s.last_name, s.status,
      s.first_in_time || '', s.last_out_time || '', s.total_scans,
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${date}_${classId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const present = report ? report.filter(s => s.status === 'Present').length : 0;
  const absent = report ? report.filter(s => s.status === 'Absent').length : 0;
  const total = report ? report.length : 0;

  const pieData = report && total > 0
    ? [
        { name: 'Present', value: present },
        { name: 'Absent', value: absent },
      ].filter(d => d.value > 0)
    : [];

  if (classLoading) return <LoadingScreen />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Report</h1>
          <p className="text-sm text-gray-500 mt-1">Daily class attendance breakdown</p>
        </div>
        {report && (
          <Button variant="secondary" onClick={exportCSV}>
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-4">
            <label className="flex-1">
              <span className="text-sm font-medium text-gray-700">Class</span>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="">Select a class</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
              </select>
            </label>
            <label className="sm:w-48">
              <span className="text-sm font-medium text-gray-700">Date</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </label>
          </div>
        </CardBody>
      </Card>

      {!classId ? (
        <EmptyState
          icon={ClipboardList}
          title="Select a class"
          description="Choose a class and date to view the attendance report."
        />
      ) : loading ? (
        <LoadingScreen />
      ) : report && report.length > 0 ? (
        <>
          {/* Summary row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard icon={ClipboardList} label="Total Students" value={total} color="bg-primary-50 text-primary-600" />
            <SummaryCard icon={UserCheck} label="Present" value={present} color="bg-green-50 text-green-600" />
            <SummaryCard icon={UserX} label="Absent" value={absent} color="bg-red-50 text-red-600" />
            <SummaryCard
              icon={Clock}
              label="Attendance Rate"
              value={`${total > 0 ? ((present / total) * 100).toFixed(1) : 0}%`}
              color="bg-amber-50 text-amber-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Table */}
            <Card className="lg:col-span-2">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No.</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">First In</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Last Out</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Scans</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {report.map((s, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">{s.roll_number}</td>
                        <td className="px-4 py-3 text-gray-700">{s.first_name} {s.last_name}</td>
                        <td className="px-4 py-3">
                          <Badge variant={s.status === 'Present' ? 'success' : 'danger'}>
                            {s.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{s.first_in_time || '—'}</td>
                        <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{s.last_out_time || '—'}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-700">{s.total_scans}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <h2 className="text-base font-semibold text-gray-900">Distribution</h2>
              </CardHeader>
              <CardBody>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-400 text-center py-8">No data</p>
                )}
              </CardBody>
            </Card>
          </div>
        </>
      ) : (
        <EmptyState
          icon={ClipboardList}
          title="No attendance data"
          description="No records found for the selected date and class."
        />
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color }) {
  return (
    <Card>
      <div className="p-4 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </Card>
  );
}
