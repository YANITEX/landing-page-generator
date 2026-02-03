'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Eye, Settings, Plus, Trash2, Download } from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';
import SectionManager from '@/components/SectionManager';

export default function LandingPageEdit() {
  const params = useParams();
  const router = useRouter();
  const [landingPage, setLandingPage] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sections' | 'preview'>('sections');

  useEffect(() => {
    fetchLandingPage();
  }, [params.id]);

  const fetchLandingPage = async () => {
    try {
      const response = await fetch(`/api/landing-pages/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setLandingPage(data);
        setSections(data.sections || []);
      }
    } catch (error) {
      console.error('Error fetching landing page:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionsUpdate = (updatedSections: any[]) => {
    setSections(updatedSections);
    // Rafraîchir aussi les données de la landing page
    setLandingPage((prev: any) => ({
      ...prev,
      sections: updatedSections
    }));
  };

  const handleDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la landing page "${landingPage?.headline}" ?\n\nCette action est irréversible et supprimera toutes les sections associées.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/landing-pages/${params.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        router.push('/landing-pages');
      } else {
        const error = await response.json();
        alert(`Erreur lors de la suppression: ${error.error}`);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de la landing page');
    }
  };

  const handleDownloadAll = async () => {
    try {
      const response = await fetch(`/api/landing-pages/${params.id}/download`);
      
      if (response.ok) {
        const blob = await response.blob();
        const contentDisposition = response.headers.get('Content-Disposition');
        const fileName = contentDisposition 
          ? contentDisposition.split('filename="')[1].split('"')[0]
          : `${landingPage?.headline || 'landing-page'}.zip`;
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      alert('Erreur lors du téléchargement');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1520]">
        <Sidebar />
        <TopNav />
        <main className="ml-64 pt-16">
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Chargement...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!landingPage) {
    return (
      <div className="min-h-screen bg-[#0a1520]">
        <Sidebar />
        <TopNav />
        <main className="ml-64 pt-16">
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Landing page introuvable</h2>
              <p className="text-gray-400 mb-6">Cette page n'existe pas ou a été supprimée.</p>
              <Link href="/landing-pages" className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                Retour à la liste
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1520]">
      <Sidebar />
      <TopNav />

      <main className="ml-64 pt-16">
        <div className="max-w-7xl mx-auto p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/landing-pages" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Retour à la liste
              </Link>
              <div className="h-6 w-px bg-gray-700"></div>
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: landingPage.primaryColor }}></div>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: landingPage.secondaryColor }}></div>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: landingPage.accentColor }}></div>
                </div>
                <h1 className="text-white font-semibold text-xl">{landingPage.headline}</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadAll}
                disabled={!sections.some(s => s.images && s.images.length > 0 && s.generationStatus === 'completed')}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Télécharger tout
              </button>
              <Link 
                href={`/landing-pages/${params.id}`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Aperçu
              </Link>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-6 mb-8 border-b border-gray-800">
            <button
              onClick={() => setActiveTab('sections')}
              className={`pb-3 px-1 border-b-2 transition-colors ${
                activeTab === 'sections' 
                  ? 'text-emerald-400 border-emerald-400' 
                  : 'text-gray-400 border-transparent hover:text-gray-300'
              }`}
            >
              Gestion des sections
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`pb-3 px-1 border-b-2 transition-colors ${
                activeTab === 'preview' 
                  ? 'text-emerald-400 border-emerald-400' 
                  : 'text-gray-400 border-transparent hover:text-gray-300'
              }`}
            >
              Aperçu rapide
            </button>
          </div>

          {/* Content */}
          {activeTab === 'sections' ? (
            <SectionManager 
              landingPageId={params.id as string}
              sections={sections}
              onSectionsUpdate={handleSectionsUpdate}
            />
          ) : (
            <PreviewSection landingPage={landingPage} />
          )}
        </div>
      </main>
    </div>
  );
}

function PreviewSection({ landingPage }: { landingPage: any }) {
  const sectionsWithImages = landingPage.sections?.filter(
    (s: any) => s.images && s.images.length > 0
  ) || [];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-white mb-2">Aperçu rapide</h2>
        <p className="text-gray-400">
          {sectionsWithImages.length}/{landingPage.sections?.length || 0} sections avec images générées
        </p>
      </div>

      {sectionsWithImages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectionsWithImages.map((section: any, index: number) => (
            <div key={section.id} className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700">
              <div className="aspect-video bg-gray-700 relative">
                {section.images?.[0] && (
                  <img 
                    src={section.images[0]} 
                    alt={section.type}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-medium">{section.type}</h3>
                  <span className="text-xs text-gray-400">#{index + 1}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className={`px-2 py-1 rounded ${
                    section.generationStatus === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                    section.generationStatus === 'generating' ? 'bg-blue-500/10 text-blue-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>
                    {section.generationStatus}
                  </span>
                  <span>Ordre: {section.order}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8" />
          </div>
          <p className="mb-2">Aucune section avec image générée</p>
          <p className="text-sm">Les sections apparaîtront ici une fois les images générées</p>
        </div>
      )}
    </div>
  );
}