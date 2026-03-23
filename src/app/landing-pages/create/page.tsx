'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Trash2, 
  GripVertical, 
  Wand2, 
  Loader2,
  Check,
  Palette,
  Layers,
  Sparkles as SparklesIcon,
  Box,
  User,
  Search
} from 'lucide-react';

// Types
type Product = {
  id: string;
  name: string;
  images: { url: string; isPrimary: boolean }[];
};

type Persona = {
  id: string;
  name: string;
  description: string | null;
};

type SectionType = 'hero' | 'benefits' | 'social-proof' | 'features' | 'before-after' | 'demo' | 'comparison' | 'guarantees' | 'urgency' | 'faq' | 'cta';

type Section = {
  id: string;
  type: SectionType;
  prompt: string; // JSON string
};

const DEFAULT_SECTIONS: Record<SectionType, string> = {
  hero: "Professional e-commerce hero banner showcasing this product, clean minimalist background with soft gradient, product prominently displayed in center with dramatic lighting, modern lifestyle setting, high-end commercial photography style, 8k quality, ultra realistic",
  benefits: "Infographic style image showing this product with 3 icon-based benefit highlights, clean white background, modern flat design icons, professional product photography combined with graphic elements, commercial advertising style, bright and appealing",
  'social-proof': "Lifestyle photo of happy customer using this product in natural environment, genuine smile, candid moment, warm natural lighting, authentic testimonial scene, professional photography, relatable and trustworthy atmosphere",
  features: "Split-screen composition showing this product features, left side: product close-up details, right side: person benefiting from product, modern commercial style, clean background, professional lighting, feature highlight with subtle graphic overlays",
  'before-after': "Before and after comparison image, split down the middle, left side: problem scenario without this product, right side: improved situation with product, dramatic contrast, realistic photography, clear visual transformation, professional commercial quality",
  demo: "Action shot of this product being used, hands interacting with product, dynamic angle, step-by-step usage demonstration, clean studio lighting, professional product photography, detailed and instructional, high clarity",
  comparison: "Side-by-side comparison layout, this product on one side looking superior with checkmarks, competitor/old method on other side with X marks, clean infographic style, professional product photography, modern design elements, clear visual hierarchy",
  guarantees: "Trust badges and security icons surrounding this product, premium shields and certification symbols, professional e-commerce style, clean white/blue background, reassuring and credible atmosphere, modern graphic design",
  urgency: "this product with countdown timer overlay, limited stock visual indicator, urgent but professional design, warm spotlight on product, clean background, modern e-commerce promotional style, sense of exclusivity",
  faq: "Friendly customer service representative with headset next to this product, welcoming expression, professional office/studio setting, clean background, approachable and helpful atmosphere, high quality commercial photography",
  cta: "Eye-catching promotional image of this product with bold call-to-action energy, product elevated on podium or spotlight, celebratory atmosphere, premium presentation, clean background with subtle geometric shapes, irresistible commercial appeal"
};

function CreateLandingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Step 1: Product & Persona
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('');
  
  const [newPersonaName, setNewPersonaName] = useState('');
  const [isCreatingPersona, setIsCreatingPersona] = useState(false);

  // Extraire les paramètres URL une seule fois
  const productIdFromUrl = searchParams.get('productId');
  const personaIdFromUrl = searchParams.get('personaId');

  // Pré-remplir depuis les paramètres URL
  useEffect(() => {
    if (productIdFromUrl) {
      setSelectedProductId(productIdFromUrl);
    }
    // Le personaId sera défini après le chargement des personas
  }, [productIdFromUrl]);

  // Step 2: Langue & Pays
  const [language, setLanguage] = useState('EN');
  const [country, setCountry] = useState('DZ');

  // Step 3: Palette
  const [skipPalette, setSkipPalette] = useState(true); // Par défaut, utiliser "auto"
  const [palette, setPalette] = useState({
    primary: '#000000',
    secondary: '#333333',
    accent: '#3b82f6',
    background: '#ffffff'
  });
  const [isExtractingPalette, setIsExtractingPalette] = useState(false);

  // Step 4: Sections
  const [sections, setSections] = useState<Section[]>([
    { id: 'hero-1', type: 'hero', prompt: DEFAULT_SECTIONS.hero },
    { id: 'benefits-1', type: 'benefits', prompt: DEFAULT_SECTIONS.benefits },
    { id: 'social-proof-1', type: 'social-proof', prompt: DEFAULT_SECTIONS['social-proof'] },
    { id: 'cta-1', type: 'cta', prompt: DEFAULT_SECTIONS.cta },
  ]);

  // Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      setProductsError('');
      try {
        const res = await fetch('/api/products');
        if (!res.ok) {
          throw new Error(`Erreur ${res.status}: Impossible de charger les produits`);
        }
        const data = await res.json();
        setProducts(data || []);
      } catch (err) {
        console.error('Erreur lors du chargement des produits:', err);
        setProductsError(err instanceof Error ? err.message : 'Erreur inconnue');
        setProducts([]);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Filter products based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [products, searchQuery]);

  // Fetch Personas when product selected
  useEffect(() => {
    if (selectedProductId) {
      fetch(`/api/products/${selectedProductId}/personas`)
        .then(res => res.json())
        .then(data => {
            setPersonas(data);
            // Priorité : personaId de l'URL > premier persona de la liste
            if (personaIdFromUrl && data.find((p: Persona) => p.id === personaIdFromUrl)) {
              setSelectedPersonaId(personaIdFromUrl);
            } else if (data.length > 0) {
              setSelectedPersonaId(data[0].id);
            }
        })
        .catch(err => console.error(err));
    } else {
        setPersonas([]);
        setSelectedPersonaId('');
    }
  }, [selectedProductId, personaIdFromUrl]);

  const handleCreatePersona = async () => {
    if (!newPersonaName || !selectedProductId) return;
    setIsCreatingPersona(true);
    try {
        const res = await fetch(`/api/products/${selectedProductId}/personas`, {
            method: 'POST',
            body: JSON.stringify({ name: newPersonaName, description: 'Created during LP setup' }),
            headers: { 'Content-Type': 'application/json' }
        });
        const persona = await res.json();
        setPersonas([...personas, persona]);
        setSelectedPersonaId(persona.id);
        setNewPersonaName('');
    } catch (e) {
        console.error(e);
    } finally {
        setIsCreatingPersona(false);
    }
  };

  const handleExtractPalette = async () => {
    const product = products.find(p => p.id === selectedProductId);
    const mainImage = product?.images.find(img => img.isPrimary)?.url || product?.images[0]?.url;
    
    if (!mainImage) return;

    setIsExtractingPalette(true);
    try {
        const res = await fetch('/api/ai/extract-palette', {
            method: 'POST',
            body: JSON.stringify({ imageUrl: mainImage }),
            headers: { 'Content-Type': 'application/json' }
        });
        const newPalette = await res.json();
        setPalette(newPalette);
    } catch (e) {
        console.error(e);
    } finally {
        setIsExtractingPalette(false);
    }
  };

  const handleAddSection = (type: SectionType) => {
    const newSection: Section = {
        id: `${type}-${Date.now()}`,
        type,
        prompt: DEFAULT_SECTIONS[type]
    };
    setSections([...sections, newSection]);
  };

  const handleRemoveSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const handleUpdateSectionPrompt = (id: string, newPrompt: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, prompt: newPrompt } : s));
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSections(items);
  };

  const handleGenerateAll = async () => {
    setIsLoading(true);
    try {
        // Récupérer les informations du produit
        const product = products.find(p => p.id === selectedProductId);
        if (!product) {
          alert('Produit non trouvé');
          setIsLoading(false);
          return;
        }

        // 1. Create LP Structure
        const res = await fetch('/api/landing-pages', {
            method: 'POST',
            body: JSON.stringify({
                personaId: selectedPersonaId,
                headline: product.name, // Utiliser le nom du produit comme headline par défaut
                price: 0, // À définir
                oldPrice: null,
                currency: 'DA',
                ctaText: 'Commander maintenant',
                palette: skipPalette ? 'auto' : palette,
                language,
                country,
                sections: sections.map(s => ({ type: s.type, prompt: s.prompt }))
            }),
            headers: { 'Content-Type': 'application/json' }
        });
        const landingPage = await res.json();

        if (landingPage.id) {
             // La génération des images est déjà déclenchée automatiquement par l'API backend
             // Rediriger vers la page de prévisualisation
             router.push(`/landing-pages/${landingPage.id}`);
        }

    } catch (e) {
        console.error(e);
        alert('Failed to start generation');
    } finally {
        setIsLoading(false);
    }
  };

  const ProgressStep = ({ num, title, current }: { num: number, title: string, current: number }) => {
      const isActive = current >= num;
      const isCurrent = current === num;
      return (
          <div className="flex items-center gap-3">
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full font-bold transition-all
                ${isActive ? 'bg-emerald-500 text-white' : 'bg-[#1a2c3d] text-gray-500'}
                ${isCurrent ? 'ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/20' : ''}
              `}>
                  {isActive ? <Check size={16} /> : num}
              </div>
              <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-500'}`}>{title}</span>
              {num < 4 && <div className={`h-0.5 w-12 mx-2 ${isActive ? 'bg-emerald-500' : 'bg-[#1a2c3d]'}`}></div>}
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#0a1520]">
      <Sidebar />
      <TopNav />

      <main className="ml-64 pt-16 p-8 pb-24">
        <div className="max-w-5xl mx-auto space-y-8">
            
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Générateur de Landing Page</h1>
                <p className="text-gray-400">Configurez votre structure unique et laissez l'IA générer le contenu.</p>
            </div>

            {/* Steps Indicator */}
            <div className="flex items-center justify-center p-6 bg-[#0f1d2a] border border-gray-800 rounded-2xl">
                <ProgressStep num={1} title="Cible & Produit" current={step} />
                <ProgressStep num={2} title="Langue & Pays" current={step} />
                <ProgressStep num={3} title="Design & Couleurs" current={step} />
                <ProgressStep num={4} title="Structure" current={step} />
            </div>

            {step === 1 && (
                <div className="space-y-6 bg-[#0f1d2a] p-8 rounded-2xl border border-gray-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                            <Box size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-white">Sélection du Produit</h2>
                            <p className="text-sm text-gray-400">Choisissez le produit à mettre en avant.</p>
                        </div>
                    </div>
                    
                    {isLoadingProducts ? (
                        <div className="text-center py-12 bg-gray-800/20 rounded-xl border border-gray-700">
                            <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-gray-400">Chargement des produits...</p>
                        </div>
                    ) : productsError ? (
                        <div className="text-center py-12 bg-red-500/10 rounded-xl border-2 border-dashed border-red-500/30">
                            <div className="w-16 h-16 mx-auto text-red-400 mb-4 flex items-center justify-center bg-red-500/20 rounded-full">
                                <Box className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-semibold text-red-400 mb-2">Erreur de chargement</h3>
                            <p className="text-gray-400 mb-6">{productsError}</p>
                            <div className="flex gap-3 justify-center">
                                <button 
                                    onClick={() => window.location.reload()}
                                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors font-medium border border-red-500/30"
                                >
                                    Réessayer
                                </button>
                                <button 
                                    onClick={() => router.push('/products/create')}
                                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
                                >
                                    Créer un produit
                                </button>
                            </div>
                        </div>
                    ) : !products.length ? (
                        <div className="text-center py-12 bg-gray-800/20 rounded-xl border-2 border-dashed border-gray-700">
                            <Box className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2">Aucun produit disponible</h3>
                            <p className="text-gray-400 mb-6">Vous devez d'abord créer un produit pour générer une landing page.</p>
                            <div className="flex gap-3 justify-center">
                                <button 
                                    onClick={() => window.location.reload()}
                                    className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                                >
                                    Actualiser
                                </button>
                                <button 
                                    onClick={() => router.push('/products/create')}
                                    className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
                                >
                                    Créer un produit
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Barre de recherche */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Rechercher un produit..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-[#1a2c3d] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                />
                            </div>

                            {/* Compteur de produits */}
                            <div className="flex items-center justify-between text-sm text-gray-400">
                                <span>
                                    {filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''} 
                                    {searchQuery && ` trouvé${filteredProducts.length !== 1 ? 's' : ''} pour "${searchQuery}"`}
                                </span>
                                {selectedProductId && (
                                    <span className="text-emerald-400 font-medium">
                                        ✓ {products.find(p => p.id === selectedProductId)?.name} sélectionné
                                    </span>
                                )}
                            </div>

                            {/* Grille de produits filtrés */}
                            {filteredProducts.length === 0 ? (
                                <div className="text-center py-12 bg-gray-800/20 rounded-xl border-2 border-dashed border-gray-700">
                                    <Search className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                                    <h3 className="text-lg font-semibold text-white mb-2">Aucun produit trouvé</h3>
                                    <p className="text-gray-400 mb-4">Aucun produit ne correspond à votre recherche "{searchQuery}"</p>
                                    <button 
                                        onClick={() => setSearchQuery('')}
                                        className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                                    >
                                        Effacer la recherche
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                                    {filteredProducts.map(product => (
                                        <div 
                                            key={product.id}
                                            className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02] ${
                                                selectedProductId === product.id 
                                                ? 'border-emerald-500 bg-emerald-500/10' 
                                                : 'border-gray-700 bg-[#1a2c3d] hover:border-gray-600'
                                            }`}
                                            onClick={() => setSelectedProductId(product.id)}
                                        >
                                            {/* Checkbox de sélection */}
                                            {selectedProductId === product.id && (
                                                <div className="absolute top-3 right-3 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                                                    <Check className="w-4 h-4 text-white" />
                                                </div>
                                            )}
                                            
                                            {/* Image du produit */}
                                            <div className="aspect-square bg-gray-800 rounded-lg mb-3 overflow-hidden">
                                                {product.images && product.images.length > 0 ? (
                                                    <img 
                                                        src={product.images.find(img => img.isPrimary)?.url || product.images[0].url} 
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Box className="w-12 h-12 text-gray-500" />
                                                    </div>
                                                )}
                                            </div>
                                            {/* Nom du produit */}
                                            <h3 className="font-semibold text-white text-sm mb-1 truncate">{product.name}</h3>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {selectedProductId && (
                        <div className="space-y-6 pt-8 border-t border-gray-800">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
                                    <User size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-white">Persona Marketing</h2>
                                    <p className="text-sm text-gray-400">L'IA orientera le texte et les images pour ce public cible.</p>
                                </div>
                            </div>
                            
                            {personas.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {personas.map(p => (
                                        <div 
                                            key={p.id}
                                            onClick={() => setSelectedPersonaId(p.id)}
                                            className={`p-5 border rounded-xl cursor-pointer transition-all ${
                                                selectedPersonaId === p.id 
                                                ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20' 
                                                : 'border-gray-700 bg-[#1a2c3d] hover:border-gray-500'
                                            }`}
                                        >
                                            <div className="font-bold text-white mb-1">{p.name}</div>
                                            <div className="text-sm text-gray-400 line-clamp-2">{p.description}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 bg-[#1a2c3d] rounded-xl text-gray-400 text-sm text-center border border-gray-700 border-dashed">
                                    Aucun persona défini pour ce produit.
                                </div>
                            )}

                            <div className="bg-[#152332] p-4 rounded-xl border border-gray-800 mt-4">
                                <label className="text-xs uppercase font-bold text-gray-500 mb-2 block tracking-wider">Créer un nouveau persona</label>
                                <div className="flex gap-2 items-center">
                                    <input 
                                        type="text" 
                                        className="flex-1 p-3 bg-[#0a1520] border border-gray-700 rounded-lg text-white focus:ring-1 focus:ring-purple-500 outline-none"
                                        placeholder="Ex: Maman active, Étudiant fauché..."
                                        value={newPersonaName}
                                        onChange={e => setNewPersonaName(e.target.value)}
                                    />
                                    <button 
                                        onClick={handleCreatePersona}
                                        disabled={!newPersonaName || isCreatingPersona}
                                        className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-lg disabled:opacity-50 font-medium transition-colors"
                                    >
                                        {isCreatingPersona ? <Loader2 className="animate-spin" /> : <Plus />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between pt-8">
                        <button 
                            onClick={() => router.push('/dashboard')}
                            className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                        >
                            Annuler
                        </button>
                        <div className="flex items-center gap-3">
                            {(!selectedProductId || !selectedPersonaId) && !isLoadingProducts && products.length > 0 && (
                                <span className="text-sm text-gray-400">
                                    {!selectedProductId ? 'Sélectionnez un produit' : 'Sélectionnez une persona'}
                                </span>
                            )}
                            <button 
                                onClick={() => setStep(2)}
                                disabled={!selectedProductId || !selectedPersonaId || isLoadingProducts || products.length === 0}
                                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-3 rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                                title={!selectedProductId ? 'Sélectionnez un produit et une persona pour continuer' : ''}
                            >
                                {isLoadingProducts ? 'Chargement...' : 'Suivant'} <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sticky Footer pour l'étape 1 */}
            {step === 1 && (
                <div className="fixed bottom-0 left-64 right-0 bg-[#0a1520]/95 backdrop-blur-sm border-t border-gray-800 p-4 z-10">
                    <div className="max-w-5xl mx-auto flex justify-between items-center">
                        <button 
                            onClick={() => router.push('/dashboard')}
                            className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                        >
                            Annuler
                        </button>
                        <div className="flex items-center gap-4">
                            {selectedProductId && (
                                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/30">
                                    <Check className="w-4 h-4" />
                                    <span className="text-sm font-medium">
                                        {products.find(p => p.id === selectedProductId)?.name}
                                    </span>
                                </div>
                            )}
                            {(!selectedProductId || !selectedPersonaId) && !isLoadingProducts && products.length > 0 && (
                                <span className="text-sm text-gray-400">
                                    {!selectedProductId ? 'Sélectionnez un produit' : 'Sélectionnez une persona'}
                                </span>
                            )}
                            <button 
                                onClick={() => setStep(2)}
                                disabled={!selectedProductId || !selectedPersonaId || isLoadingProducts || products.length === 0}
                                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-3 rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                                title={!selectedProductId ? 'Sélectionnez un produit et une persona pour continuer' : ''}
                            >
                                {isLoadingProducts ? 'Chargement...' : 'Suivant'} <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Étape 2: Langue & Pays */}
            {step === 2 && (
                <div className="space-y-6 bg-[#0f1d2a] p-8 rounded-2xl border border-gray-800 animate-in fade-in slide-in-from-right-4 duration-500">
                    {/* En-tête */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-lg">
                            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-white">Localisation & Langue</h2>
                            <p className="text-sm text-gray-400">Définissez la langue et le pays cible de votre landing page</p>
                        </div>
                    </div>

                    {/* Langue */}
                    <div className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 p-6 rounded-xl border border-blue-500/20">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <label className="block text-base font-semibold text-white mb-1">Langue du contenu</label>
                                <p className="text-xs text-gray-400">L'IA générera tous les textes et images dans cette langue</p>
                            </div>
                        </div>
                        <select 
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full p-4 bg-[#0a1520] border border-gray-700 rounded-lg text-white font-medium focus:border-blue-500 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        >
                            <option value="EN">🇬🇧 English</option>
                            <option value="FR">🇫🇷 Français</option>
                            <option value="AR">🇩🇿 العربية (Arabe)</option>
                            <option value="ES">🇪🇸 Español</option>
                            <option value="DE">🇩🇪 Deutsch</option>
                            <option value="IT">🇮🇹 Italiano</option>
                        </select>
                    </div>

                    {/* Pays */}
                    <div className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 p-6 rounded-xl border border-green-500/20">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <label className="block text-base font-semibold text-white mb-1">Pays cible</label>
                                <p className="text-xs text-gray-400">Adaptez le contenu aux spécificités locales</p>
                            </div>
                        </div>
                        <select 
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="w-full p-4 bg-[#0a1520] border border-gray-700 rounded-lg text-white font-medium focus:border-green-500 outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
                        >
                            <option value="DZ">🇩🇿 Algérie</option>
                            <option value="FR">🇫🇷 France</option>
                            <option value="MA">🇲🇦 Maroc</option>
                            <option value="TN">🇹🇳 Tunisie</option>
                            <option value="US">🇺🇸 États-Unis</option>
                            <option value="GB">🇬🇧 Royaume-Uni</option>
                            <option value="CA">🇨🇦 Canada</option>
                            <option value="DE">🇩🇪 Allemagne</option>
                            <option value="ES">🇪🇸 Espagne</option>
                            <option value="IT">🇮🇹 Italie</option>
                            <option value="BE">🇧🇪 Belgique</option>
                            <option value="CH">🇨🇭 Suisse</option>
                        </select>
                    </div>

                    {/* Boutons de navigation */}
                    <div className="flex justify-between pt-6">
                        <button 
                            onClick={() => setStep(1)}
                            className="flex items-center gap-2 px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                        >
                            <ChevronLeft size={18} /> Retour
                        </button>
                        <button 
                            onClick={() => setStep(3)}
                            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-3 rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all font-semibold"
                        >
                            Suivant <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* Étape 3: Design & Couleurs */}
            {step === 3 && (
                <div className="space-y-6 bg-[#0f1d2a] p-8 rounded-2xl border border-gray-800 animate-in fade-in-from-right-4 duration-500">
                    {/* En-tête */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-lg text-pink-400">
                            <Palette size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-white">Design & Couleurs</h2>
                            <p className="text-sm text-gray-400">Personnalisez le style visuel de votre landing page</p>
                        </div>
                    </div>

                    {/* Palette de couleurs - Section optionnelle */}
                    <div className="bg-[#1a2c3d] rounded-xl border border-gray-700 overflow-hidden">
                        {/* Header avec toggle */}
                        <div className="p-5 border-b border-gray-700">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg transition-colors ${
                                        skipPalette ? 'bg-gray-700/50' : 'bg-pink-500/20'
                                    }`}>
                                        <Palette size={20} className={skipPalette ? 'text-gray-400' : 'text-pink-400'} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold text-white">Palette de couleurs personnalisée</h3>
                                        <p className="text-xs text-gray-400">Optionnel - L'IA choisira automatiquement si non défini</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={!skipPalette}
                                        onChange={(e) => setSkipPalette(!e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-pink-500/50 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-pink-500 peer-checked:to-rose-600"></div>
                                </label>
                            </div>
                        </div>

                        {/* Contenu de la palette (affiché si skipPalette = false) */}
                        {!skipPalette && (
                            <div className="p-6 space-y-6">
                                {/* Bouton Magic Palette */}
                                <button 
                                    onClick={handleExtractPalette}
                                    disabled={isExtractingPalette}
                                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-pink-500/30 transition-all font-medium disabled:opacity-50"
                                >
                                    {isExtractingPalette ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} />
                                            Extraction en cours...
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 size={18} />
                                            Extraire depuis l'image produit
                                        </>
                                    )}
                                </button>

                                {/* Grille de couleurs */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {(['primary', 'secondary', 'accent', 'background'] as const).map(colorKey => (
                                        <div key={colorKey} className="space-y-2">
                                            <label className="text-xs uppercase font-bold text-gray-400 tracking-wide">
                                                {colorKey === 'primary' && '🎨 Primaire'}
                                                {colorKey === 'secondary' && '🎨 Secondaire'}
                                                {colorKey === 'accent' && '✨ Accent'}
                                                {colorKey === 'background' && '🖼️ Fond'}
                                            </label>
                                            <div className="relative">
                                                {/* Carré de couleur cliquable avec color picker natif */}
                                                <label 
                                                    htmlFor={`color-picker-${colorKey}`}
                                                    className="block w-full h-24 rounded-lg border-2 border-gray-600 shadow-lg cursor-pointer hover:scale-105 transition-transform relative overflow-hidden group"
                                                    style={{ backgroundColor: palette[colorKey] }}
                                                >
                                                    {/* Overlay hover */}
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                        <svg className="w-8 h-8 text-white/0 group-hover:text-white/80 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                                        </svg>
                                                    </div>
                                                    {/* Color picker caché */}
                                                    <input 
                                                        id={`color-picker-${colorKey}`}
                                                        type="color" 
                                                        value={palette[colorKey]}
                                                        onChange={(e) => setPalette({...palette, [colorKey]: e.target.value})}
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                        title="Cliquez pour choisir une couleur"
                                                    />
                                                </label>
                                                {/* Input texte pour code hex */}
                                                <input 
                                                    type="text" 
                                                    value={palette[colorKey]}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        // Valider format hex
                                                        if (/^#[0-9A-Fa-f]{0,6}$/.test(value) || value === '') {
                                                            setPalette({...palette, [colorKey]: value});
                                                        }
                                                    }}
                                                    placeholder="#000000"
                                                    className="mt-2 w-full p-2 bg-[#0a1520] border border-gray-700 rounded text-white font-mono text-xs text-center focus:border-pink-500 outline-none uppercase tracking-wider"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Preview */}
                                <div className="rounded-lg border border-gray-600 p-6 flex flex-col items-center justify-center gap-4 shadow-inner" style={{ backgroundColor: palette.background }}>
                                     <h3 className="text-xl font-bold text-center" style={{ color: palette.primary }}>Aperçu du design</h3>
                                     <div className="flex gap-3">
                                        <div className="px-5 py-2.5 rounded-lg text-white font-semibold shadow-md text-sm" style={{ backgroundColor: palette.primary }}>Bouton Principal</div>
                                        <div className="px-5 py-2.5 rounded-lg text-white font-semibold shadow-md text-sm" style={{ backgroundColor: palette.secondary }}>Secondaire</div>
                                     </div>
                                     <p className="font-medium" style={{ color: palette.accent }}>Texte d'accentuation important</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Boutons de navigation */}
                    <div className="flex justify-between pt-6">
                        <button 
                            onClick={() => setStep(2)}
                            className="flex items-center gap-2 px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                        >
                            <ChevronLeft size={18} /> Retour
                        </button>
                        <button 
                            onClick={() => setStep(4)}
                            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-3 rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all font-semibold"
                        >
                            Suivant <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* Étape 4: Structure & Sections */}
            {step === 4 && (
                 <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                     <div className="bg-[#0f1d2a] p-8 rounded-2xl border border-gray-800">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-orange-500/10 rounded-lg text-orange-400">
                                <Layers size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-white">Structure & Sections</h2>
                                <p className="text-sm text-gray-400">Glissez-déposez pour réorganiser. Modifiez le prompt JSON pour un contrôle total.</p>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 pb-6 mb-6 border-b border-gray-800">
                            {Object.keys(DEFAULT_SECTIONS).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => handleAddSection(type as SectionType)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#1a2c3d] hover:bg-[#253e55] text-gray-300 hover:text-white rounded-full transition-colors border border-gray-700"
                                >
                                    <Plus size={12} /> {type.toUpperCase()}
                                </button>
                            ))}
                        </div>

                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="sections">
                                {(provided) => (
                                    <div 
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="space-y-4"
                                    >
                                        {sections.map((section, index) => (
                                            <Draggable key={section.id} draggableId={section.id} index={index}>
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        className="bg-[#1a2c3d] rounded-xl border border-gray-700 p-5 group hover:border-gray-500 transition-colors"
                                                    >
                                                        <div className="flex items-start gap-4">
                                                            <div 
                                                                {...provided.dragHandleProps}
                                                                className="mt-2 text-gray-500 cursor-move hover:text-white transition-colors"
                                                            >
                                                                <GripVertical size={20} />
                                                            </div>
                                                            
                                                            <div className="flex-1 space-y-3">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="font-bold text-sm uppercase tracking-wider bg-[#0f1d2a] border border-gray-700 text-gray-300 px-3 py-1 rounded-lg">
                                                                            {section.type}
                                                                        </span>
                                                                        <span className="text-xs text-gray-500">Ordre: {index + 1}</span>
                                                                    </div>
                                                                    <button 
                                                                        onClick={() => handleRemoveSection(section.id)}
                                                                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-2 rounded-lg transition-colors"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>
                                                                
                                                                <div>
                                                                    <label className="text-xs text-gray-500 font-mono mb-2 block">Prompt IA (JSON)</label>
                                                                    <textarea 
                                                                        value={section.prompt}
                                                                        onChange={(e) => handleUpdateSectionPrompt(section.id, e.target.value)}
                                                                        className="w-full h-24 font-mono text-xs p-3 border border-gray-700 rounded-lg bg-[#0a1520] text-gray-300 focus:ring-1 focus:ring-emerald-500 focus:border-transparent outline-none resize-none"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                     </div>
                 </div>
            )}

            {/* Sticky Footer pour l'étape 2 - Langue & Pays */}
            {step === 2 && (
                <div className="fixed bottom-0 left-64 right-0 bg-[#0a1520]/95 backdrop-blur-sm border-t border-gray-800 p-4 z-10">
                    <div className="max-w-5xl mx-auto flex justify-between items-center">
                        <button 
                            onClick={() => setStep(1)}
                            className="flex items-center gap-2 px-6 py-3 border border-gray-700 hover:bg-gray-800 text-gray-300 rounded-xl transition-all"
                        >
                            <ChevronLeft size={18} /> Retour
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-blue-400 bg-blue-500/10 px-3 py-2 rounded-lg border border-blue-500/30">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                </svg>
                                <span className="text-sm font-medium">Étape 2/4 - Langue & Pays</span>
                            </div>
                            <button 
                                onClick={() => setStep(3)}
                                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-3 rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all font-semibold"
                            >
                                Suivant <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sticky Footer pour l'étape 3 - Design & Couleurs */}
            {step === 3 && (
                <div className="fixed bottom-0 left-64 right-0 bg-[#0a1520]/95 backdrop-blur-sm border-t border-gray-800 p-4 z-10">
                    <div className="max-w-5xl mx-auto flex justify-between items-center">
                        <button 
                            onClick={() => setStep(2)}
                            className="flex items-center gap-2 px-6 py-3 border border-gray-700 hover:bg-gray-800 text-gray-300 rounded-xl transition-all"
                        >
                            <ChevronLeft size={18} /> Retour
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-pink-400 bg-pink-500/10 px-3 py-2 rounded-lg border border-pink-500/30">
                                <Palette className="w-4 h-4" />
                                <span className="text-sm font-medium">Étape 3/4 - Design & Couleurs</span>
                            </div>
                            <button 
                                onClick={() => setStep(4)}
                                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-3 rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all font-semibold"
                            >
                                Suivant <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sticky Footer pour l'étape 4 */}
            {step === 4 && (
                <div className="fixed bottom-0 left-64 right-0 bg-[#0a1520]/95 backdrop-blur-sm border-t border-gray-800 p-4 z-10">
                    <div className="max-w-5xl mx-auto flex justify-between items-center">
                        <button 
                            onClick={() => setStep(3)}
                            className="flex items-center gap-2 px-6 py-3 border border-gray-700 hover:bg-gray-800 text-gray-300 rounded-xl transition-all"
                        >
                            <ChevronLeft size={18} /> Retour
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-orange-400 bg-orange-500/10 px-3 py-2 rounded-lg border border-orange-500/30">
                                <Layers className="w-4 h-4" />
                                <span className="text-sm font-medium">Étape 4/4 - Structure</span>
                            </div>
                            <button 
                                onClick={handleGenerateAll}
                                disabled={isLoading}
                                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/40 transition-all disabled:opacity-70 transform hover:-translate-y-0.5"
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : <SparklesIcon size={18} />}
                                LANCER LA GÉNÉRATION
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}

export default function CreateLandingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a1520] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    }>
      <CreateLandingPageContent />
    </Suspense>
  );
}

export const dynamic = 'force-dynamic';
