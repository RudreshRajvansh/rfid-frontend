import { useState, useEffect } from 'react';
import { api } from '../api';
import { Card, CardHeader, CardBody, StatCard, Badge, LoadingScreen } from '../components/UI';
import { Users, GraduationCap, ScanLine, UserCheck, UserX, TrendingUp, MapPin } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';

const PIE_COLORS = ['#22c55e', '#ef4444'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [live, setLive] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadAll() {
    try {
      const [statsRes, weeklyRes, liveRes] = await Promise.allSettled([
        api.getStats(),
        api.getWeeklyStats(),
        api.getLiveAttendance(),
      ]);
      if (statsRes.status === 'fulfilled' && statsRes.value.success) setStats(statsRes.value.data);
      if (weeklyRes.status === 'fulfilled' && weeklyRes.value.success) setWeekly(weeklyRes.value.data || []);
      if (liveRes.status === 'fulfilled' && liveRes.value.success) setLive(liveRes.value.data?.records || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingScreen />;
  if (!stats) return <p className="text-gray-500 text-center mt-12">Couldn't load dashboard data.</p>;

  const pieData = [
    { name: 'Present', value: stats.present_today },
    { name: 'Absent', value: stats.absent_today },
  ].filter((d) => d.value > 0);

  const barData = (stats.class_breakdown || []).map((c) => ({
    name: c.class_name.length > 12 ? c.class_name.slice(0, 12) + '…' : c.class_name,
    Present: c.present_count,
    Absent: c.total_count - c.present_count,
  }));

  const weeklyData = weekly.map((d) => ({
    name: d.day_name,
    date: d.date,
    Present: d.present_count,
    Rate: Math.round(d.attendance_rate),
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={Users} label="Total Students" value={stats.total_students} color="primary" />
        <StatCard icon={GraduationCap} label="Total Classes" value={stats.total_classes} color="violet" />
        <StatCard icon={ScanLine} label="Today's Scans" value={stats.today_scans} color="sky" />
        <StatCard icon={UserCheck} label="Present Today" value={stats.present_today} color="green" />
        <StatCard icon={MapPin} label="Currently In" value={stats.currently_in || 0} color="amber" />
        <StatCard
          icon={TrendingUp}
          label="Attendance Rate"
          value={`${stats.attendance_rate.toFixed(1)}%`}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-base font-semibold text-gray-900">Attendance by Class</h2>
          </CardHeader>
          <CardBody>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="Present" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-center py-12">No class data yet</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-gray-900">Today's Overview</h2>
          </CardHeader>
          <CardBody>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
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
              <p className="text-gray-400 text-center py-12">Nothing to show yet</p>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Weekly Trend */}
      {weeklyData.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-gray-900">7-Day Attendance Trend</h2>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="Present" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      )}

      {/* Live Attendance + Recent Scans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Currently In Class */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Currently In Class</h2>
              <Badge variant="success">{live.length} students</Badge>
            </div>
          </CardHeader>
          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            {live.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Since</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {live.map((l, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2 font-medium text-gray-900">{l.student_name}</td>
                      <td className="px-4 py-2 text-gray-500">{l.class_name || '—'}</td>
                      <td className="px-4 py-2 text-gray-500">{l.checkin_time?.slice(0, 8) || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-400 text-center py-8">No one currently in class</p>
            )}
          </div>
        </Card>

        {/* Recent scans */}
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-gray-900">Recent Scans</h2>
          </CardHeader>
          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            {stats.recent_scans.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.recent_scans.map((s, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2 font-medium text-gray-900">{s.student_name}</td>
                      <td className="px-4 py-2 text-gray-500">{s.scan_time?.slice(0, 8)}</td>
                      <td className="px-4 py-2">
                        <Badge variant={s.scan_type === 'checkout' ? 'danger' : s.scan_type === 'checkin' ? 'success' : 'default'}>
                          {s.scan_type || 'scan'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-400 text-center py-8">No scans yet today</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
