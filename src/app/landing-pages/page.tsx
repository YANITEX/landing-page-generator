'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';
import { Plus, Layout, Layers, ArrowRight, Loader2, Trash2 } from 'lucide-react';

interface LandingPage {
    id: string;
    headline: string;
    product?: { name: string };
    persona?: { name: string };
    createdAt: string;
    status: string;
    backgroundColor: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    sections?: Array<{
        id: string;
        type: string;
        generationStatus: string;
        images?: string[];
    }>;
}

export default function LandingPagesList() {
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fonction helper pour parser les images depuis JSON string
  const getImages = (imagesData: any): string[] => {
    if (!imagesData) return [];
    if (Array.isArray(imagesData)) return imagesData;
    if (typeof imagesData === 'string') {
      try {
        const parsed = JSON.parse(imagesData);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error('Failed to parse images:', e);
        return [];
      }
    }
    return [];
  };

  const fetchLandingPages = () => {
    fetch('/api/landing-pages')
      .then(async (res) => {
        if (!res.ok) {
                    const contentType = res.headers.get('content-type') || '';
                    let errorMessage = `HTTP error! status: ${res.status}`;

                    if (contentType.includes('application/json')) {
                        const errorData = await res.json();
                        console.error('API Error Response:', errorData);
                        if (errorData?.error) {
                            errorMessage = `HTTP error! status: ${res.status}, message: ${errorData.error}`;
                        }
                        if (errorData?.details) {
                            errorMessage += `, details: ${errorData.details}`;
                        }
                    } else {
                        const errorText = await res.text();
                        console.error('API Error Text Response:', errorText);
                        if (errorText) {
                            errorMessage = `HTTP error! status: ${res.status}, message: ${errorText}`;
                        }
                    }

                    throw new Error(errorMessage);
        }
        const data = await res.json();
        console.log('API Response:', data);
        
        // S'assurer que data est un array
        if (Array.isArray(data)) {
          // Filtrer les landing pages avec des IDs invalides
          const validLandingPages = data.filter(lp => 
            lp && lp.id && typeof lp.id === 'string' && lp.id.trim() !== ''
          );
          console.log(`Filtered ${data.length} -> ${validLandingPages.length} valid landing pages`);
          setLandingPages(validLandingPages);
        } else {
          console.error('API response is not an array:', data);
          // Si c'est un objet avec une propriété error, c'est une erreur de l'API
          if (data.error) {
            console.error('API Error:', data.error);
          }
          setLandingPages([]);
        }
      })
      .catch(err => {
        console.error('Error fetching landing pages:', err);
        setLandingPages([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLandingPages();

    // Interceptor temporaire pour capturer les navigations malformées
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'A') {
        const href = (target as HTMLAnchorElement).href;
        if (href && (href.endsWith('/[') || href.includes('/['))) {
          console.error('❌ Detected malformed URL navigation:', href);
          console.error('❌ Target element:', target);
          event.preventDefault();
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleDelete = async (landingPageId: string, headline: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la landing page "${headline}" ?\n\nCette action est irréversible et supprimera toutes les sections associées.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/landing-pages/${landingPageId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Supprimer de la liste locale
        setLandingPages(prev => prev.filter(lp => lp.id !== landingPageId));
        // Optionnel : afficher un message de succès
      } else {
        const error = await response.json();
        alert(`Erreur lors de la suppression: ${error.error}`);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de la landing page');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1520] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1520]">
      <Sidebar />
      <TopNav />

      <main className="ml-64 pt-16 p-8">
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                <h1 className="text-4xl font-bold text-white mb-2">Mes Landing Pages</h1>
                <p className="text-gray-400">
                    Gérez et prévisualisez vos pages ({landingPages.length})
                </p>
                </div>
                <Link href="/landing-pages/create">
                <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/40 transition-all">
                    <Plus className="w-5 h-5" />
                    Nouvelle Page
                </button>
                </Link>
            </div>

            {landingPages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-96 bg-[#0f1d2a] rounded-2xl border border-gray-800/50">
                    <div className="w-20 h-20 bg-[#1a2c3d] rounded-full flex items-center justify-center mb-6">
                        <Layers className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Aucune Landing Page</h3>
                    <p className="text-gray-400 max-w-md text-center mb-8">
                        Commencez par générer votre première page intelligente en quelques clics.
                    </p>
                    <Link href="/landing-pages/create">
                        <button className="px-6 py-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition-all font-medium flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Créer maintenant
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.isArray(landingPages) && landingPages.map((lp) => {
                        const completedSections = lp.sections?.filter((s: any) => 
                            s.generationStatus === 'completed' && s.images?.length > 0
                        )?.length || 0;
                        const totalSections = lp.sections?.length || 0;
                        const isGenerating = lp.sections?.some((s: any) => 
                            s.generationStatus === 'pending' || s.generationStatus === 'generating'
                        );
                        const hasErrors = lp.sections?.some((s: any) => 
                            s.generationStatus === 'error'
                        );

                        return (
                            <div key={lp.id} className="block group">
                                <div className="bg-[#0f1d2a] border border-gray-800 overflow-hidden rounded-2xl hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
                                    <div 
                                        className="h-48 relative flex items-center justify-center cursor-pointer" 
                                        style={{ backgroundColor: lp.backgroundColor || '#0f1d2a' }}
                                        onClick={() => {
                                            if (lp.id && typeof lp.id === 'string' && lp.id.trim() !== '') {
                                                router.push(`/landing-pages/${lp.id}`);
                                            } else {
                                                console.error('Invalid landing page ID:', lp.id);
                                            }
                                        }}
                                    >
                                        {/* Preview de la première section si disponible */}
                                        {(() => {
                                            // Trouver la première section avec des images
                                            const sectionWithImages = lp.sections?.find((s: any) => {
                                                const images = getImages(s.images);
                                                return images.length > 0;
                                            });

                                            if (sectionWithImages) {
                                                const images = getImages(sectionWithImages.images);
                                                const firstImage = images[0];

                                                return (
                                                    <div className="w-full h-full relative overflow-hidden">
                                                        <div 
                                                            className="w-full h-full bg-cover bg-center"
                                                            style={{ 
                                                                backgroundImage: `url(${firstImage})`,
                                                                backgroundSize: 'cover',
                                                                backgroundPosition: 'center'
                                                            }}
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1d2a] via-transparent to-[#0f1d2a]/30"></div>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <>
                                                    {/* Fallback design avec palette */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f1d2a] to-transparent opacity-50"></div>
                                                    <div className="flex items-center justify-center gap-3 relative z-10 p-4 bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
                                                        <div className="w-8 h-8 rounded-full shadow-lg border-2 border-white/20" style={{ backgroundColor: lp.primaryColor }}></div>
                                                        <div className="w-8 h-8 rounded-full shadow-lg border-2 border-white/20" style={{ backgroundColor: lp.secondaryColor }}></div>
                                                        <div className="w-8 h-8 rounded-full shadow-lg border-2 border-white/20" style={{ backgroundColor: lp.accentColor }}></div>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                        
                                        {/* Status badges */}
                                        <div className="absolute top-4 right-4 flex gap-2">
                                            {isGenerating && (
                                                <div className="bg-blue-500/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white border border-white/10 flex items-center gap-1">
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                    En cours
                                                </div>
                                            )}
                                            {hasErrors && (
                                                <div className="bg-red-500/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white border border-white/10">
                                                    Erreurs
                                                </div>
                                            )}
                                        </div>

                                        {/* Progress indicator */}
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <div className="bg-black/60 backdrop-blur-md rounded-lg px-3 py-2 border border-white/10">
                                                <div className="flex items-center justify-between text-xs text-white mb-2">
                                                    <span>Sections</span>
                                                    <span>{completedSections}/{totalSections}</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                                                        style={{ width: `${totalSections > 0 ? (completedSections / totalSections) * 100 : 0}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div 
                                        className="p-6 cursor-pointer"
                                        onClick={() => {
                                            if (lp.id && typeof lp.id === 'string' && lp.id.trim() !== '') {
                                                router.push(`/landing-pages/${lp.id}`);
                                            } else {
                                                console.error('Invalid landing page ID:', lp.id);
                                            }
                                        }}
                                    >
                                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-emerald-400 transition-colors">
                                            {lp.headline || "Page sans titre"}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                            {lp.product?.name || "Produit inconnu"}
                                            {lp.persona && (
                                                <>
                                                    <span className="mx-2 text-gray-600">•</span>
                                                    <span className="text-purple-400">{lp.persona.name}</span>
                                                </>
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                                            <span className="text-xs text-gray-500">
                                                {new Date(lp.createdAt).toLocaleDateString('fr-FR')}
                                            </span>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (lp.id && typeof lp.id === 'string' && lp.id.trim() !== '') {
                                                            router.push(`/landing-pages/${lp.id}/edit`);
                                                        } else {
                                                            console.error('Invalid landing page ID for edit:', lp.id);
                                                        }
                                                    }}
                                                    className="text-gray-400 hover:text-emerald-400 text-xs font-medium flex items-center gap-1 transition-colors"
                                                >
                                                    <Layout className="w-3 h-3" />
                                                    Gérer
                                                </button>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(lp.id, lp.headline);
                                                    }}
                                                    className="text-gray-400 hover:text-red-400 text-xs font-medium flex items-center gap-1 transition-colors"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                    Supprimer
                                                </button>
                                                <span className="text-emerald-500 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                                    {completedSections === totalSections && totalSections > 0 ? 'Voir' : 'En cours'}
                                                    <ArrowRight className="w-4 h-4" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
      </main>
    </div>
  );
}
