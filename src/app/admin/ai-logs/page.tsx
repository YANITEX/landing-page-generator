'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Trash2,
  Eye,
  X,
  ChevronDown,
  Zap,
} from 'lucide-react';

type AILog = {
  id: string;
  endpoint: string;
  modelUsed: string;
  inputData: string;
  prompt: string | null;
  response: string | null;
  status: string;
  errorMessage: string | null;
  duration: number | null;
  createdAt: string;
};

type Stats = {
  endpoint: string;
  status: string;
  _count: number;
  _avg: { duration: number | null };
};

export default function AILogsPage() {
  const [logs, setLogs] = useState<AILog[]>([]);
  const [stats, setStats] = useState<Stats[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEndpoint, setFilterEndpoint] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedLog, setSelectedLog] = useState<AILog | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [filterEndpoint, filterStatus]);

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (filterEndpoint) params.set('endpoint', filterEndpoint);
      if (filterStatus) params.set('status', filterStatus);
      params.set('limit', '100');

      const response = await fetch(`/api/admin/ai-logs?${params}`);
      const data = await response.json();
      setLogs(data.logs || []);
      setStats(data.stats || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearLogs = async () => {
    if (!confirm('⚠️ Supprimer tous les logs ?')) return;

    try {
      await fetch('/api/admin/ai-logs', { method: 'DELETE' });
      await fetchLogs();
    } catch (error) {
      console.error('Error clearing logs:', error);
    }
  };

  const endpoints = [...new Set(logs.map((l) => l.endpoint))];
  const successCount = logs.filter((l) => l.status === 'success').length;
  const errorCount = logs.filter((l) => l.status === 'error').length;
  const avgDuration =
    logs.filter((l) => l.duration).reduce((sum, l) => sum + (l.duration || 0), 0) /
    logs.filter((l) => l.duration).length || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1520]">
        <Sidebar />
        <TopNav />
        <main className="ml-64 pt-16 p-8 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1520]">
      <Sidebar />
      <TopNav />

      <main className="ml-64 pt-16 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                Logs des Requêtes AI
              </h1>
              <p className="text-gray-400 mt-2">Monitoring et debug des appels AI</p>
            </div>

            <button
              onClick={handleClearLogs}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer tous
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#1a2332] border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Requêtes</p>
                  <p className="text-3xl font-bold text-white mt-1">{logs.length}</p>
                </div>
                <Activity className="w-8 h-8 text-blue-400" />
              </div>
            </div>

            <div className="bg-[#1a2332] border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Succès</p>
                  <p className="text-3xl font-bold text-emerald-400 mt-1">{successCount}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
            </div>

            <div className="bg-[#1a2332] border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Erreurs</p>
                  <p className="text-3xl font-bold text-red-400 mt-1">{errorCount}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
            </div>

            <div className="bg-[#1a2332] border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Durée Moy.</p>
                  <p className="text-3xl font-bold text-yellow-400 mt-1">
                    {avgDuration.toFixed(0)}ms
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-[#1a2332] border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterEndpoint}
                onChange={(e) => setFilterEndpoint(e.target.value)}
                className="bg-[#0a1520] border border-white/10 rounded-lg px-4 py-2 text-white"
              >
                <option value="">Tous les endpoints</option>
                {endpoints.map((ep) => (
                  <option key={ep} value={ep}>
                    {ep}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-[#0a1520] border border-white/10 rounded-lg px-4 py-2 text-white"
              >
                <option value="">Tous les statuts</option>
                <option value="success">Succès</option>
                <option value="error">Erreur</option>
              </select>

              {(filterEndpoint || filterStatus) && (
                <button
                  onClick={() => {
                    setFilterEndpoint('');
                    setFilterStatus('');
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  Réinitialiser
                </button>
              )}
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-[#1a2332] border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0a1520] border-b border-white/10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      Endpoint
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      Modèle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      Durée
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(log.createdAt).toLocaleString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                          {log.endpoint}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">{log.modelUsed}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {log.status === 'success' ? (
                          <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" />
                            Succès
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full flex items-center gap-1 w-fit">
                            <XCircle className="w-3 h-3" />
                            Erreur
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {log.duration ? `${log.duration}ms` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          Détails
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Modal détails */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a2332] border border-white/10 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#1a2332] border-b border-white/10 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-400" />
                Détails de la Requête
              </h2>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Endpoint</p>
                  <p className="text-white font-semibold">{selectedLog.endpoint}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Modèle</p>
                  <p className="text-white font-semibold">{selectedLog.modelUsed}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Date</p>
                  <p className="text-white">
                    {new Date(selectedLog.createdAt).toLocaleString('fr-FR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Durée</p>
                  <p className="text-white">{selectedLog.duration}ms</p>
                </div>
              </div>

              {/* Input Data */}
              <div>
                <p className="text-sm text-gray-400 mb-2">Données d'entrée</p>
                <pre className="bg-[#0a1520] border border-white/10 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto">
                  {JSON.stringify(JSON.parse(selectedLog.inputData), null, 2)}
                </pre>
              </div>

              {/* Prompt */}
              {selectedLog.prompt && (
                <div>
                  <p className="text-sm text-gray-400 mb-2">Prompt</p>
                  <pre className="bg-[#0a1520] border border-white/10 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap">
                    {selectedLog.prompt}
                  </pre>
                </div>
              )}

              {/* Response */}
              {selectedLog.response && selectedLog.status === 'success' && (
                <div>
                  <p className="text-sm text-gray-400 mb-2">Réponse</p>
                  <pre className="bg-[#0a1520] border border-white/10 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap">
                    {typeof selectedLog.response === 'string'
                      ? selectedLog.response.length > 500
                        ? selectedLog.response.substring(0, 500) + '...'
                        : selectedLog.response
                      : JSON.stringify(JSON.parse(selectedLog.response), null, 2)}
                  </pre>
                </div>
              )}

              {/* Error */}
              {selectedLog.errorMessage && (
                <div>
                  <p className="text-sm text-gray-400 mb-2">Erreur</p>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <p className="text-red-400 text-sm">{selectedLog.errorMessage}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
