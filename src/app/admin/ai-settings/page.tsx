'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';
import { 
  Zap, 
  Image as ImageIcon, 
  MessageSquare, 
  Sparkles, 
  Palette, 
  Lightbulb,
  RefreshCw,
  Settings,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

type AIConfig = {
  id: string;
  endpoint: string;
  modelName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type ConfigGroup = {
  title: string;
  icon: any;
  color: string;
  configs: AIConfig[];
};

export default function AISettingsPage() {
  const [configs, setConfigs] = useState<AIConfig[]>([]);
  const [allowedModels, setAllowedModels] = useState<{ text: string[]; image: string[] }>({
    text: [],
    image: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Génération de Contenu', 'Génération d\'Images']));
  const [showInfo, setShowInfo] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const response = await fetch('/api/admin/ai-config');
      const data = await response.json();
      setConfigs(data.configs || []);
      setAllowedModels(data.allowedModels || { text: [], image: [] });
    } catch (error) {
      console.error('Error fetching configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (config: AIConfig) => {
    setSaving(config.id);
    try {
      const response = await fetch('/api/admin/ai-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        const updated = await response.json();
        setConfigs((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        );
        showSuccess('Configuration mise à jour avec succès');
      }
    } catch (error) {
      console.error('Error updating config:', error);
    } finally {
      setSaving(null);
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleReset = async () => {
    if (!confirm('⚠️ Réinitialiser toutes les configurations aux valeurs par défaut ?')) {
      return;
    }

    setLoading(true);
    try {
      await fetch('/api/admin/ai-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
      await fetchConfigs();
      showSuccess('Toutes les configurations ont été réinitialisées');
    } catch (error) {
      console.error('Error resetting configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableModels = (endpoint: string) => {
    const imageEndpoints = ['images'];
    return imageEndpoints.includes(endpoint) ? allowedModels.image : allowedModels.text;
  };

  const getEndpointIcon = (endpoint: string) => {
    const icons: Record<string, any> = {
      benefits: MessageSquare,
      headline: Zap,
      adCopies: MessageSquare,
      suggest: Lightbulb,
      generateAll: Sparkles,
      images: ImageIcon,
      palette: Palette,
    };
    return icons[endpoint] || Settings;
  };

  const groupConfigs = (): ConfigGroup[] => {
    const textConfigs = configs.filter(c => !['images'].includes(c.endpoint));
    const imageConfigs = configs.filter(c => ['images'].includes(c.endpoint));

    return [
      {
        title: 'Génération de Contenu',
        icon: Sparkles,
        color: 'from-purple-500 to-pink-600',
        configs: textConfigs,
      },
      {
        title: 'Génération d\'Images',
        icon: ImageIcon,
        color: 'from-blue-500 to-cyan-600',
        configs: imageConfigs,
      },
    ];
  };

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupTitle)) {
        newSet.delete(groupTitle);
      } else {
        newSet.add(groupTitle);
      }
      return newSet;
    });
  };

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

  const groups = groupConfigs();

  return (
    <div className="min-h-screen bg-[#0a1520]">
      <Sidebar />
      <TopNav />
      
      <main className="ml-64 pt-16 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Success Notification */}
            {successMessage && (
              <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top-5 fade-in">
                <div className="bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">{successMessage}</span>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  Configuration des Modèles AI
                </h1>
                <p className="text-gray-400 mt-2">
                  Gérez les modèles Gemini utilisés pour chaque endpoint API
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowInfo(!showInfo)}
                  className="px-4 py-2 bg-[#1a2332] hover:bg-[#1f2937] text-white rounded-lg transition-colors flex items-center gap-2 border border-white/10"
                >
                  <Info className="w-4 h-4" />
                  {showInfo ? 'Masquer l\'aide' : 'Aide'}
                </button>
                
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Réinitialiser
                </button>
              </div>
            </div>

            {/* Info Panel */}
            {showInfo && (
              <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Info className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <h3 className="text-lg font-semibold text-white">Comment ça marche ?</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>Les changements prennent effet <strong>immédiatement</strong> (cache de 5 secondes)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>Seuls les modèles de la <strong>liste blanche</strong> sont autorisés</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>Désactiver un endpoint le fait revenir à la <strong>configuration par défaut</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>La réinitialisation supprime toutes les configurations personnalisées</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#1a2332] border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Endpoints</p>
                    <p className="text-3xl font-bold text-white mt-1">{configs.length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-[#1a2332] border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Actifs</p>
                    <p className="text-3xl font-bold text-emerald-400 mt-1">
                      {configs.filter(c => c.isActive).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>
              </div>

              <div className="bg-[#1a2332] border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Modèles Disponibles</p>
                    <p className="text-3xl font-bold text-blue-400 mt-1">
                      {allowedModels.text.length + allowedModels.image.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Configuration Groups */}
            {groups.map((group) => {
              const Icon = group.icon;
              const isExpanded = expandedGroups.has(group.title);

              return (
                <div key={group.title} className="bg-[#1a2332] border border-white/10 rounded-xl overflow-hidden">
                  {/* Group Header */}
                  <button
                    onClick={() => toggleGroup(group.title)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${group.color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <h2 className="text-xl font-bold text-white">{group.title}</h2>
                        <p className="text-sm text-gray-400">{group.configs.length} endpoints</p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {/* Group Content */}
                  {isExpanded && (
                    <div className="border-t border-white/10">
                      {group.configs.map((config) => {
                        const EndpointIcon = getEndpointIcon(config.endpoint);
                        const isSaving = saving === config.id;

                        return (
                          <div
                            key={config.id}
                            className="px-6 py-6 border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors"
                          >
                            <div className="flex items-start gap-4">
                              {/* Icon */}
                              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                                <EndpointIcon className="w-5 h-5 text-gray-400" />
                              </div>

                              {/* Content */}
                              <div className="flex-1 space-y-4">
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-semibold text-white">
                                      {config.endpoint}
                                    </h3>
                                    {config.isActive ? (
                                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Actif
                                      </span>
                                    ) : (
                                      <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full flex items-center gap-1">
                                        <XCircle className="w-3 h-3" />
                                        Inactif
                                      </span>
                                    )}
                                    {isSaving && (
                                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full flex items-center gap-1">
                                        <RefreshCw className="w-3 h-3 animate-spin" />
                                        Sauvegarde...
                                      </span>
                                    )}
                                  </div>

                                  {/* Active Toggle */}
                                  <label className="relative inline-flex items-center cursor-pointer group">
                                    <input
                                      type="checkbox"
                                      checked={config.isActive}
                                      onChange={(e) =>
                                        handleUpdate({ ...config, isActive: e.target.checked })
                                      }
                                      disabled={isSaving}
                                      className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                                    <span className="ml-3 text-sm text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                      {config.isActive ? 'Actif' : 'Inactif'}
                                    </span>
                                  </label>
                                </div>

                                {/* Model Selection */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                                    <Zap className="w-4 h-4" />
                                    Modèle AI
                                  </label>
                                  <div className="relative">
                                    <select
                                      value={config.modelName}
                                      onChange={(e) =>
                                        handleUpdate({ ...config, modelName: e.target.value })
                                      }
                                      disabled={isSaving || !config.isActive}
                                      className="w-full bg-[#0a1520] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors appearance-none pr-10"
                                    >
                                      {getAvailableModels(config.endpoint).map((model) => (
                                        <option key={model} value={model}>
                                          {model}
                                        </option>
                                      ))}
                                    </select>
                                    <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                  </div>
                                </div>

                                {/* Last Updated */}
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <AlertCircle className="w-3 h-3" />
                                  <span>
                                    Dernière modification : {new Date(config.updatedAt).toLocaleString('fr-FR')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Available Models Section */}
            <div className="bg-[#1a2332] border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Liste Blanche des Modèles
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Text Models */}
                <div className="bg-[#0a1520] border border-white/5 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-purple-400" />
                    Modèles de Texte
                    <span className="ml-auto px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                      {allowedModels.text.length}
                    </span>
                  </h4>
                  <div className="space-y-2">
                    {allowedModels.text.map((model) => (
                      <div
                        key={model}
                        className="px-3 py-2 bg-[#1a2332] border border-white/5 rounded text-sm text-gray-300 hover:border-purple-500/50 transition-colors"
                      >
                        {model}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Image Models */}
                <div className="bg-[#0a1520] border border-white/5 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-blue-400" />
                    Modèles d'Images
                    <span className="ml-auto px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                      {allowedModels.image.length}
                    </span>
                  </h4>
                  <div className="space-y-2">
                    {allowedModels.image.map((model) => (
                      <div
                        key={model}
                        className="px-3 py-2 bg-[#1a2332] border border-white/5 rounded text-sm text-gray-300 hover:border-blue-500/50 transition-colors"
                      >
                        {model}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
    </div>
  );
}
