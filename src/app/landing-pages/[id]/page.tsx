'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Eye, Palette, Maximize2, Trash2, Download } from 'lucide-react';
import Image from 'next/image';
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

export default function LandingPagePreview() {
  const params = useParams();
  const router = useRouter();
  const [landingPage, setLandingPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fullscreenMode, setFullscreenMode] = useState(false);

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

      {/* Mode plein écran conditionnel */}
      {fullscreenMode ? (
        <div className="fixed inset-0 bg-[#0a1520] z-50">
          {/* Header plein écran */}
          <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a1520]/95 backdrop-blur-sm border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setFullscreenMode(false)}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour
                </button>
                <div className="h-6 w-px bg-gray-700"></div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: landingPage.primaryColor }}></div>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: landingPage.secondaryColor }}></div>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: landingPage.accentColor }}></div>
                  </div>
                  <h1 className="text-white font-semibold">{landingPage.headline || 'Landing Page'}</h1>
                </div>
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
              </div>
            </div>
          </div>

          {/* Contenu plein écran */}
          <div className="pt-16">
            {/* Affichage continu de toutes les sections */}
            <div className="w-full bg-[#0f1d2a] overflow-y-auto smooth-scroll" style={{ height: 'calc(100vh - 4rem)' }}>
              {sectionsWithImages.length === 0 ? (
                <div className="w-full h-screen flex items-center justify-center">
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
                        <div className="w-full aspect-[16/9] relative overflow-hidden">
                          <Image
                            src={sectionImages[0]}
                            alt={`${getSectionTypeName(section.type)} - ${landingPage.headline}`}
                            fill
                            className="object-cover"
                            priority={index === 0}
                          />
                          
                          {/* Overlay gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-black/5"></div>
                          
                          {/* Numéro de section en bas à droite */}
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
              
              {/* Indicateur global */}
              {sectionsWithImages.length > 0 && (
                <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20">
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
      ) : (
        // Mode normal avec sidebar
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
                  <h1 className="text-white font-semibold text-xl">{landingPage.headline || 'Landing Page'}</h1>
                </div>
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
                  Télécharger tout
                </button>
                <button
                  onClick={() => setFullscreenMode(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Maximize2 className="w-4 h-4" />
                  Plein écran
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
            <RegularPreview landingPage={landingPage} sectionsWithImages={sectionsWithImages} isGenerating={isGenerating} />
          </div>
        </main>
      )}
    </div>
  );
}

// Composant pour l'aperçu normal avec sidebar
function RegularPreview({ landingPage, sectionsWithImages, isGenerating }: any) {
  if (sectionsWithImages.length === 0 && !isGenerating) {
    return (
      <div className="flex items-center justify-center h-96 bg-[#0f1d2a] rounded-2xl border border-gray-800">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Palette className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">Génération terminée</h3>
          <p className="text-gray-400 mb-6">
            Aucune image n'a été générée pour cette landing page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {landingPage.sections?.map((section: any, index: number) => (
          <div key={section.id} className="bg-[#0f1d2a] rounded-xl border border-gray-800 overflow-hidden">
            <div className="aspect-video bg-gray-800/50 relative">
              {section.generationStatus === 'generating' || section.generationStatus === 'pending' ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Génération...</p>
                  </div>
                </div>
              ) : getImages(section)[0] ? (
                <Image
                  src={getImages(section)[0]}
                  alt={section.type}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <Eye className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Pas d'image</p>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-medium">{getSectionTypeName(section.type)}</h3>
                <span className="text-xs text-gray-400">#{index + 1}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className={`px-2 py-1 rounded ${getStatusColor(section.generationStatus)}`}>
                  {getStatusText(section.generationStatus)}
                </span>
                <span className="text-gray-500">Ordre: {section.order}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Composant pour l'aperçu plein écran
function FullscreenPreview({ landingPage, sectionsWithImages, isGenerating }: any) {
  if (sectionsWithImages.length === 0 && !isGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Palette className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">Génération terminée</h3>
          <p className="text-gray-400 mb-6">
            Aucune image n'a été générée pour cette landing page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {landingPage.sections
        ?.filter((section: any) => getImages(section).length > 0)
        .map((section: any, index: number) => (
        <LandingPageSection 
          key={section.id} 
          section={section} 
          landingPage={landingPage}
          isLast={index === landingPage.sections.length - 1}
        />
      ))}
    </div>
  );
}

// Helper functions
function getSectionTypeName(type: string): string {
  const sectionTypeNames: { [key: string]: string } = {
    hero: 'Hero / En-tête',
    problem: 'Problème',
    solution: 'Solution',
    benefits: 'Bénéfices',
    'social-proof': 'Preuves sociales',
    'how-it-works': 'Comment ça marche',
    faq: 'FAQ',
    cta: 'Appel à l\'action'
  };
  return sectionTypeNames[type] || type;
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'bg-emerald-500/10 text-emerald-400';
    case 'generating':
    case 'pending':
      return 'bg-blue-500/10 text-blue-400';
    case 'error':
      return 'bg-red-500/10 text-red-400';
    default:
      return 'bg-gray-500/10 text-gray-400';
  }
}

function getStatusText(status: string): string {
  switch (status) {
    case 'completed':
      return 'Terminé';
    case 'generating':
      return 'Génération...';
    case 'pending':
      return 'En attente';
    case 'error':
      return 'Erreur';
    default:
      return 'Inconnu';
  }
}

function LandingPageSection({ section, landingPage, isLast }: any) {
  const isGenerating = 
    section.generationStatus === 'pending' || section.generationStatus === 'generating';
  
  const hasError = section.generationStatus === 'error';

  if (isGenerating) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#0f1d2a]/50">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Génération en cours
          </h3>
          <p className="text-gray-400">
            {getSectionTypeName(section.type)}
          </p>
          <div className="mt-4 w-48 h-2 bg-gray-700 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-red-500/5">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">⚠️</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Erreur de génération
          </h3>
          <p className="text-gray-400 mb-4">
            Impossible de générer {getSectionTypeName(section.type)}
          </p>
          <button className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (getImages(section).length === 0) {
    return null;
  }

  return (
    <div className={`w-full relative ${!isLast ? '' : ''}`}>
      {/* Badge de type de section */}
      <div className="absolute top-8 left-8 z-10">
        <div className="px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg text-white font-medium text-sm">
          {getSectionTypeName(section.type)}
        </div>
      </div>

      {/* Image générée pleine largeur */}
      <div className="w-full h-screen relative overflow-hidden">
        <Image
          src={getImages(section)[0]}
          alt={`${getSectionTypeName(section.type)} - ${landingPage.headline}`}
          fill
          className="object-cover"
          priority={section.type === 'hero'}
          onError={(e) => {
            console.error('Error loading image:', e);
          }}
        />
        
        {/* Overlay gradient subtil pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10"></div>
        
        {/* Indicateur de progression en bas */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
            <div className="text-white text-sm font-medium">
              Section {landingPage.sections?.findIndex((s: any) => s.id === section.id) + 1}/{landingPage.sections?.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
