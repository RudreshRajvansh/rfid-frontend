import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import { Card, Button, Badge, EmptyState, LoadingScreen } from '../components/UI';
import { ScrollText, Trash2, ChevronLeft, ChevronRight, Search, Download } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const PAGE_SIZE = 50;

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [count, setCount] = useState(0);
  const [dateFilter, setDateFilter] = useState('');
  const [uidFilter, setUidFilter] = useState('');

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: PAGE_SIZE, offset };
      if (dateFilter) params.date = dateFilter;
      if (uidFilter.trim()) params.uid = uidFilter.trim();
      const res = await api.getLogs(params);
      if (res.success) {
        setLogs(res.data.logs || []);
        setCount(res.data.count || 0);
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [offset, dateFilter, uidFilter]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  // Reset offset when filters change
  useEffect(() => { setOffset(0); }, [dateFilter, uidFilter]);

  async function handleDeleteLog(uid, date) {
    if (!window.confirm(`Delete all scans for UID "${uid}" on ${date}?`)) return;
    try {
      await api.deleteLog(uid, date);
      toast.success('Logs deleted');
      loadLogs();
    } catch (e) {
      toast.error(e.message);
    }
  }

  function exportCSV() {
    const headers = ['ID', 'Roll Number', 'Name', 'UID', 'Date', 'Time'];
    const rows = logs.map(l => [l.id, l.roll_number, `${l.first_name} ${l.last_name}`, l.uid, l.scan_date, l.scan_time]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scan_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const hasNext = count === PAGE_SIZE;
  const hasPrev = offset > 0;
  const page = Math.floor(offset / PAGE_SIZE) + 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scan Logs</h1>
          <p className="text-sm text-gray-500 mt-1">Raw RFID tap records</p>
        </div>
        <Button variant="secondary" onClick={exportCSV}>
          <Download className="w-4 h-4" /> Export
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <label className="sm:w-48">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Filter by date"
          />
        </label>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Filter by UID..."
            value={uidFilter}
            onChange={(e) => setUidFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        {(dateFilter || uidFilter) && (
          <Button variant="ghost" size="sm" onClick={() => { setDateFilter(''); setUidFilter(''); }}>
            Clear Filters
          </Button>
        )}
      </div>

      {loading ? (
        <LoadingScreen />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="No logs found"
          description={dateFilter || uidFilter ? 'Try different filters.' : 'Logs show up here when students tap their cards.'}
        />
      ) : (
        <>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No.</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">UID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((l) => (
                    <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">{l.id}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{l.roll_number}</td>
                      <td className="px-4 py-3 text-gray-700">{l.first_name} {l.last_name}</td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs hidden md:table-cell">{l.uid}</td>
                      <td className="px-4 py-3 text-gray-500">{l.scan_date}</td>
                      <td className="px-4 py-3 text-gray-500">{l.scan_time}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteLog(l.uid, l.scan_date)}
                            title="Delete all logs for this UID on this date"
                          >
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

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page {page} &middot; Showing {logs.length} records
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={!hasPrev}
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={!hasNext}
                onClick={() => setOffset(offset + PAGE_SIZE)}
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
