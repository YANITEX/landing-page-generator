'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Eye, Palette, Trash2, Download } from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';

// Fonction helper pour gérer les images (JSON string ou array)
const getImages = (section: any): string[] => {
  if (typeof section.images === 'string') {
    try {
      return JSON.parse(section.images);
    } catch {
      return [];
    }
  }
  return Array.isArray(section.images) ? section.images : [];
};

function getSectionTypeName(type: string): string {
  const sectionTypeNames: { [key: string]: string } = {
    hero: 'Hero',
    benefits: 'Proposition de valeur',
    'social-proof': 'Témoignages',
    features: 'Caractéristiques',
    'before-after': 'Avant/Après',
    demo: 'Démonstration',
    comparison: 'Comparaison',
    guarantees: 'Garanties',
    urgency: 'Urgence',
    faq: 'FAQ',
    cta: 'CTA Final'
  };
  return sectionTypeNames[type] || type;
}

export default function LandingPagePreview() {
  const params = useParams();
  const router = useRouter();
  const [landingPage, setLandingPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const handleDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer cette landing page ?\n\nCette action est irréversible et supprimera toutes les sections associées.`)) {
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
          : `landing-page-${landingPage?.id}.zip`;
        
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

  useEffect(() => {
    fetchLandingPage();
  }, [params.id]);

  // Polling séparé pour les générations en cours
  useEffect(() => {
    if (!landingPage?.sections) return;

    const hasGenerating = landingPage.sections.some((s: any) => 
      s.generationStatus === 'pending' || s.generationStatus === 'generating'
    );

    if (hasGenerating) {
      const interval = setInterval(() => {
        fetchLandingPage();
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [landingPage?.sections?.map((s: any) => s.generationStatus).join(',')]);

  const fetchLandingPage = async () => {
    try {
      const response = await fetch(`/api/landing-pages/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setLandingPage(data);
      }
    } catch (error) {
      console.error('Error fetching landing page:', error);
    } finally {
      setLoading(false);
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
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-4" />
              <p className="text-gray-400">Chargement de votre landing page...</p>
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
                <Eye className="w-8 h-8 text-red-500" />
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

  const isGenerating = landingPage.sections?.some(
    (s: any) => s.generationStatus === 'pending' || s.generationStatus === 'generating'
  );
  
  const sectionsWithImages = landingPage.sections?.filter(
    (s: any) => getImages(s).length > 0
  ) || [];

  return (
    <div className="min-h-screen bg-[#0a1520]">
      <Sidebar />
      <TopNav />

      <main className="ml-64 pt-16">
        <div className="max-w-7xl mx-auto p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link 
                href="/landing-pages"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Link>
              <div className="h-6 w-px bg-gray-700"></div>
              <h1 className="text-white font-semibold text-xl">Landing Page</h1>
            </div>
            
            <div className="flex items-center gap-3">
              {isGenerating && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Génération en cours
                </div>
              )}
              <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm">
                {sectionsWithImages.length}/{landingPage.sections?.length || 0} sections
              </div>
              <button
                onClick={handleDownloadAll}
                disabled={sectionsWithImages.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Télécharger
              </button>
              <Link
                href={`/landing-pages/${params.id}/edit`}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <Palette className="w-4 h-4" />
                Gérer
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

          {/* Aperçu des sections */}
          <div className="flex justify-center">
            <div className="w-full max-w-[600px] bg-white rounded-lg overflow-hidden shadow-2xl">
            {sectionsWithImages.length === 0 ? (
              <div className="w-full h-screen flex items-center justify-center bg-[#0f1d2a]">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Palette className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Génération terminée</h3>
                  <p className="text-gray-400 mb-6">
                    Aucune image n'a été générée pour cette landing page.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                {sectionsWithImages.map((section: any, index: number) => {
                  const sectionImages = getImages(section);
                  if (sectionImages.length === 0) return null;

                  return (
                    <div key={section.id} className="w-full relative">
                      {/* Badge de type de section */}
                      <div className="absolute top-8 left-8 z-10">
                        <div className="px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg text-white font-medium text-sm">
                          {getSectionTypeName(section.type)}
                        </div>
                      </div>

                      {/* Image de section */}
                      <div className="w-full relative">
                        <img
                          src={sectionImages[0]}
                          alt={`${getSectionTypeName(section.type)} - Landing Page`}
                          className="w-full h-auto"
                          loading={index === 0 ? "eager" : "lazy"}
                        />
                        
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-black/5"></div>
                        
                        {/* Numéro de section */}
                        <div className="absolute bottom-4 right-4">
                          <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-white text-sm">
                            {index + 1}/{sectionsWithImages.length}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Indicateur global - position relative au conteneur */}
            {sectionsWithImages.length > 0 && (
              <div className="sticky bottom-8 mt-4 mb-8 flex justify-center">
                <div className="flex items-center gap-3 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
                  <div className="text-white text-sm font-medium">
                    Landing Page Complète
                  </div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <div className="text-emerald-400 text-sm">
                    {sectionsWithImages.length} sections
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}