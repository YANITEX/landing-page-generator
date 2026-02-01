'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ChevronLeft, ChevronRight, Edit2, Trash2, AlertCircle, Copy, Target, 
  MessageSquare, Sparkles, Check, CheckCircle2, Plus, Loader, RotateCw, 
  Save, X, Upload, Image as ImageIcon, ChevronDown 
} from 'lucide-react';

// Interfaces
interface AdCopy { id: string; text: string; cta: string | null; platform: string | null; }
interface MarketingAngle { id: string; name: string; description: string | null; adCopies: AdCopy[]; }
interface Persona { id: string; name: string; description: string | null; marketingAngles: MarketingAngle[]; }
interface Product {
  id: string; name: string; description: string; headline: string | null;
  currency: string; priceOld: number | null; priceNew: number | null;
  ctaText: string; phone: string | null; whatsapp: string | null;
  deliveryInfo: string | null; benefits: Array<{ title: string; description: string }> | null;
  createdAt: string; updatedAt: string;
  images: Array<{ id: string; url: string; isPrimary: boolean; order: number; }>;
  landingPages: Array<{ id: string }>; personas?: Persona[];
}

// Suggestion Button
function SuggestionButton({ type, context, onSuggest, className = "" }: { type: string, context: any, onSuggest: (text: string) => void, className?: string }) {
  const [loading, setLoading] = useState(false);
  const handleSuggest = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, context }),
      });
      const data = await res.json();
      if (data.suggestion) onSuggest(data.suggestion);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  return (
    <button onClick={handleSuggest} disabled={loading} className={`p-1.5 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded transition-colors ${className}`} title="Suggérer avec l'IA">
      {loading ? <Loader size={14} className="animate-spin" /> : <Sparkles size={14} />}
    </button>
  );
}

// Inline Editable Field Component
function EditableField({ 
  value, 
  onSave, 
  type = 'text', 
  className = '', 
  placeholder = '',
  label = '',
  multiline = false,
  suggestionType = null,
  productContext = null
}: { 
  value: string | number | null, 
  onSave: (val: any) => Promise<void>, 
  type?: string, 
  className?: string,
  placeholder?: string,
  label?: string
  multiline?: boolean,
  suggestionType?: string | null,
  productContext?: any
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setTempValue(value); }, [value]);

  const handleSave = async () => {
    if (tempValue === value) { setIsEditing(false); return; }
    setSaving(true);
    await onSave(tempValue);
    setSaving(false);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !multiline) handleSave();
    if (e.key === 'Escape') { setTempValue(value); setIsEditing(false); }
  };

  if (isEditing) {
    return (
      <div className="relative group w-full">
        {label && <label className="block text-xs text-gray-500 uppercase font-semibold mb-1">{label}</label>}
        <div className="relative">
             {multiline ? (
                <textarea 
                  autoFocus
                  className={`w-full bg-gray-800 border-2 border-emerald-500/50 rounded p-2 text-white outline-none ${className}`}
                  value={tempValue || ''}
                  onChange={(e) => setTempValue(e.target.value)}
                  onBlur={handleSave}
                  onKeyDown={handleKeyDown}
                  rows={4}
                />
             ) : (
                <input 
                  autoFocus
                  type={type}
                  className={`w-full bg-gray-800 border-2 border-emerald-500/50 rounded p-2 text-white outline-none ${className}`}
                  value={tempValue || ''}
                  onChange={(e) => setTempValue(type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                  onBlur={handleSave}
                  onKeyDown={handleKeyDown}
                />
             )}
             {suggestionType && (
                 <SuggestionButton 
                    type={suggestionType} 
                    context={productContext} 
                    onSuggest={(s) => setTempValue(s)} 
                    className="absolute right-2 top-2 z-10 bg-gray-900 shadow-lg" 
                 />
             )}
        </div>
        <div className="text-xs text-gray-500 mt-1 flex justify-between">
           <span>Entrée pour valider, Echap pour annuler</span>
           {saving && <span className="text-emerald-500 flex items-center gap-1"><Loader size={10} className="animate-spin"/> Sauvegarde...</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="group relative w-full cursor-pointer" onClick={() => setIsEditing(true)}>
      {label && <label className="block text-xs text-gray-500 uppercase font-semibold mb-1">{label}</label>}
      <div className={`flex items-start gap-2 rounded p-2 -ml-2 hover:bg-white/5 transition-colors ${!value ? 'text-gray-500 italic' : ''}`}>
        <div className={`flex-1 ${className}`}>
           {value || placeholder || 'Cliquez pour modifier'}
        </div>
        <Edit2 size={14} className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => { loadProduct(); }, [productId]);

  const loadProduct = async () => {
    try {
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) throw new Error('Produit non trouvé');
      const data = await response.json();
      setProduct(data);
      setLoading(false);
    } catch (err) { console.error(err); setLoading(false); }
  };

  const updateProductField = async (field: keyof Product, value: any) => {
      if(!product) return;
      const oldProduct = { ...product };
      setProduct({ ...product, [field]: value });
      try {
         const res = await fetch(`/api/products/${productId}`, {
             method: 'PUT',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ [field]: value })
         });
         if(!res.ok) throw new Error('Failed to update');
      } catch (e) {
         console.error(e);
         setProduct(oldProduct);
         alert("Erreur de sauvegarde");
      }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      router.push('/products');
    } catch (err) { setDeleting(false); alert('Erreur suppression'); }
  };

  const handleImageUpload = async (files: FileList) => {
    const readers = Array.from(files).map(file => new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
    }));
    const base64Images = await Promise.all(readers);
    const currentImages = product?.images.map(img => img.url) || [];
    const allImages = [...currentImages, ...base64Images];
    await updateProductField('images', allImages);
    await loadProduct();
  };
    
  const removeImage = async (indexToRemove: number) => {
      if(!product) return;
      const newImages = product.images.filter((_, idx) => idx !== indexToRemove).map(i => i.url);
      await updateProductField('images', newImages);
      await loadProduct();
  };

  if (loading || !product) return <div className="min-h-screen flex items-center justify-center"><Loader className="animate-spin text-emerald-500" /></div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1520] to-[#0f1822] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-400 mb-4 transition-colors">
            <ChevronLeft size={16} /> Retour
          </button>
          
          <div className="flex justify-between items-start">
             <div className="flex-1 w-full max-w-2xl">
                <EditableField 
                   value={product.name} 
                   onSave={(v) => updateProductField('name', v)}
                   className="text-3xl font-bold text-white bg-transparent"
                   placeholder="Nom du produit"
                />
                <p className="text-gray-400 mt-2 text-sm">
                   Créé le {new Date(product.createdAt).toLocaleDateString()}
                </p>
             </div>
             <div className="flex gap-2">
                 <button onClick={() => setDeleteConfirm(true)} className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors font-medium">
                     <Trash2 size={18} /> Supprimer
                 </button>
             </div>
          </div>
        </div>

        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-sm">
              <h3 className="text-xl font-bold text-white mb-2">Supprimer ?</h3>
              <p className="text-gray-400 mb-6">Irréversible.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(false)} className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700">Annuler</button>
                <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Confirmer</button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
           <div className="lg:col-span-4 space-y-4">
              <div className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700 p-4 sticky top-4">
                  <div className="aspect-square bg-gray-900 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden group">
                     {product.images.length > 0 ? (
                        <img src={product.images[currentImageIndex].url} alt="" className="w-full h-full object-cover" />
                     ) : (
                        <div className="text-center text-gray-500">
                           <ImageIcon size={48} className="mx-auto mb-2 opacity-30" />
                           <p>Aucune image</p>
                        </div>
                     )}
                     <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                         <label className="cursor-pointer px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-2 transition-transform hover:scale-105">
                            <Upload size={16} /> Ajouter Image
                            <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => e.target.files && handleImageUpload(e.target.files)} />
                         </label>
                         {product.images.length > 0 && <button onClick={() => removeImage(currentImageIndex)} className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1 mt-2"><Trash2 size={14}/> Supprimer</button>}
                     </div>
                  </div>
                  {product.images.length > 1 && (
                     <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {product.images.map((img, idx) => (
                           <button key={img.id} onClick={() => setCurrentImageIndex(idx)} className={`w-16 h-16 rounded overflow-hidden flex-shrink-0 border-2 transition-all ${currentImageIndex === idx ? 'border-emerald-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                              <img src={img.url} className="w-full h-full object-cover" />
                           </button>
                        ))}
                     </div>
                  )}
              </div>
           </div>

           <div className="lg:col-span-8 space-y-6">
              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700 backdrop-blur-sm">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><MessageSquare className="text-emerald-500"/> Informations Générales</h2>
                  
                  <div className="space-y-6">
                      <EditableField 
                         label="Accroche (Headline)" 
                         value={product.headline} 
                         onSave={(v) => updateProductField('headline', v)} 
                         className="text-xl font-semibold text-emerald-400"
                         placeholder="Ex: La solution ultime..."
                         suggestionType="headline"
                         productContext={{ productName: product.name }}
                      />

                      <EditableField 
                         label="Description" 
                         value={product.description} 
                         onSave={(v) => updateProductField('description', v)} 
                         className="text-gray-300 leading-relaxed text-sm"
                         multiline
                         placeholder="Décrivez votre produit..."
                         suggestionType="description"
                         productContext={{ productName: product.name }}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                             <label className="text-xs text-gray-500 uppercase font-semibold mb-1 block">Prix & Devise</label>
                             <div className="flex gap-2 items-center">
                                 <EditableField value={product.priceNew} type="number" onSave={(v) => updateProductField('priceNew', v)} className="text-2xl font-bold text-white" placeholder="0.00" />
                                 <select 
                                    value={product.currency} 
                                    onChange={(e) => updateProductField('currency', e.target.value)}
                                    className="bg-gray-800 border-none text-gray-400 font-bold focus:ring-0 cursor-pointer rounded py-1"
                                 >
                                    {['DA', 'EUR', 'USD', 'MAD', 'TND'].map(c => <option key={c} value={c}>{c}</option>)}
                                 </select>
                             </div>
                             <div className="mt-1">
                                <EditableField value={product.priceOld} type="number" onSave={(v) => updateProductField('priceOld', v)} className="text-gray-500 line-through text-sm" placeholder="Ancien prix..." />
                             </div>
                          </div>
                          
                          <div className="space-y-4">
                              <EditableField label="Texte CTA" value={product.ctaText} onSave={(v) => updateProductField('ctaText', v)} className="text-emerald-400 font-medium" />
                              <EditableField label="Téléphone" value={product.phone} onSave={(v) => updateProductField('phone', v)} className="text-gray-300" placeholder="+213..." />
                          </div>
                      </div>
                  </div>
              </div>

              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700 backdrop-blur-sm">
                  <div className="flex justify-between items-center mb-4">
                     <h2 className="text-xl font-bold text-white flex items-center gap-2"><CheckCircle2 className="text-emerald-500"/> Bénéfices Clés</h2>
                     <button onClick={() => updateProductField('benefits', [...(product.benefits||[]), {title: 'Nouveau', description: 'Description...'}])} className="text-xs flex items-center gap-1 text-emerald-400 hover:text-emerald-300"><Plus size={14}/> Ajouter</button>
                  </div>
                  
                  <div className="grid gap-4">
                      {(product.benefits || []).map((benefit, idx) => (
                         <div key={idx} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 relative group hover:border-emerald-500/30 transition-colors">
                             <div className="space-y-2">
                                 <EditableField 
                                    value={benefit.title} 
                                    onSave={(v) => {
                                       const newBenefits = [...(product.benefits||[])];
                                       newBenefits[idx].title = v;
                                       updateProductField('benefits', newBenefits);
                                    }}
                                    className="font-bold text-emerald-400"
                                    placeholder="Titre du bénéfice"
                                 />
                                 <EditableField 
                                    value={benefit.description} 
                                    onSave={(v) => {
                                       const newBenefits = [...(product.benefits||[])];
                                       newBenefits[idx].description = v;
                                       updateProductField('benefits', newBenefits);
                                    }}
                                    className="text-gray-400 text-sm"
                                    multiline
                                    placeholder="Description..."
                                 />
                             </div>
                             <button 
                                onClick={() => updateProductField('benefits', (product.benefits||[]).filter((_, i) => i !== idx))}
                                className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-gray-900 rounded"
                             >
                                <X size={14}/>
                             </button>
                         </div>
                      ))}
                  </div>
              </div>
           </div>
        </div>

        <StrategySection product={product} />

      </div>
    </div>
  );
}

function StrategySection({ product }: { product: Product }) {
  const router = useRouter();
  const [personas, setPersonas] = useState<Persona[]>(product.personas || []);
  const [activePersonaId, setActivePersonaId] = useState<string>(product.personas?.[0]?.id || '');
  const [saving, setSaving] = useState(false);
  const [isAddingPersona, setIsAddingPersona] = useState(false);
  const [newPersonaName, setNewPersonaName] = useState('');
  const [newPersonaDesc, setNewPersonaDesc] = useState('');
  const activePersona = personas.find(p => p.id === activePersonaId) || personas[0];

  const handleSaveAll = async (updatedPersonas: Persona[]) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personas: updatedPersonas }),
      });
      if (!res.ok) throw new Error("Save failed");
      router.refresh(); 
      setPersonas(updatedPersonas);
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const createPersona = async () => {
    if (!newPersonaName) return;
    const newPersona: any = {
      id: `temp-${Date.now()}`,
      name: newPersonaName,
      description: newPersonaDesc,
      marketingAngles: [{ id: `temp-angle-${Date.now()}`, name: "Angle Principal", adCopies: [{ id: `temp-copy-${Date.now()}`, text: "Ad Copy..." }] }]
    };
    const updated = [...personas, newPersona];
    setPersonas(updated);
    setActivePersonaId(newPersona.id);
    setIsAddingPersona(false);
    setNewPersonaName('');
    setNewPersonaDesc('');
    await handleSaveAll(updated);
  };

  const updatePersona = (updated: Persona) => {
    const newPersonas = personas.map(p => p.id === updated.id ? updated : p);
    setPersonas(newPersonas);
    handleSaveAll(newPersonas);
  };

  if (personas.length === 0 && !isAddingPersona) {
     return (
       <div className="pt-6 border-t border-gray-800 text-center">
          <button onClick={() => setIsAddingPersona(true)} className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 font-medium flex items-center gap-2 mx-auto"><Plus size={16} /> Créer une stratégie marketing</button>
       </div>
     );
  }

  return (
    <div className="space-y-6 pt-6 border-t border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="text-emerald-500" size={24} />
          <h2 className="text-xl font-bold text-white">Stratégie Marketing</h2>
        </div>
        {saving && <span className="text-xs text-gray-500 flex items-center gap-1"><Loader size={12} className="animate-spin"/> Sauvegarde...</span>}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-800 mb-6 scrollbar-thin scrollbar-thumb-gray-700 items-center">
        {personas.map(persona => (
           <button key={persona.id} onClick={() => { setActivePersonaId(persona.id); setIsAddingPersona(false); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${activePersonaId === persona.id && !isAddingPersona ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'}`}>
             {activePersonaId === persona.id && !isAddingPersona && <CheckCircle2 size={14} />} {persona.name}
           </button>
        ))}
        <button onClick={() => setIsAddingPersona(true)} className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:text-emerald-400 hover:bg-gray-800" title="Ajouter un Persona"><Plus size={16} /></button>
      </div>
      {isAddingPersona ? (
        <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-700/50 animate-in fade-in">
           <h3 className="text-lg font-bold text-white mb-4">Nouveau Persona</h3>
           <div className="space-y-4 max-w-lg">
              <div><label className="text-xs text-gray-500 uppercase font-semibold">Nom</label><div className="flex gap-2"><input className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" value={newPersonaName} onChange={(e) => setNewPersonaName(e.target.value)} /><SuggestionButton type="persona_name" context={{ productName: product.name }} onSuggest={setNewPersonaName} /></div></div>
              <div><label className="text-xs text-gray-500 uppercase font-semibold">Description</label><div className="relative"><textarea className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" rows={3} value={newPersonaDesc} onChange={(e) => setNewPersonaDesc(e.target.value)} /><SuggestionButton type="persona_description" context={{ productName: product.name }} onSuggest={setNewPersonaDesc} className="absolute right-2 top-2" /></div></div>
              <div className="flex gap-2 mt-4"><button onClick={createPersona} className="px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 text-sm">Créer</button><button onClick={() => setIsAddingPersona(false)} className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 text-sm">Annuler</button></div>
           </div>
        </div>
      ) : activePersona ? <PersonaDetailView key={activePersona.id} persona={activePersona} updatePersona={updatePersona} productContext={{ name: product.name, description: product.description }} /> : null}
    </div>
  );
}

function PersonaDetailView({ persona, updatePersona, productContext }: { persona: Persona, updatePersona: (p: Persona) => void, productContext: any }) {
  const addMarketingAngle = () => { const newAngle = { id: `temp-angle-${Date.now()}`, name: "Nouvel Angle", adCopies: [{ id: `temp-copy-${Date.now()}`, text: "" }] }; updatePersona({ ...persona, marketingAngles: [...persona.marketingAngles, newAngle] as any }); };
  const updateAngle = (updatedAngle: MarketingAngle) => { const newAngles = persona.marketingAngles.map(a => a.id === updatedAngle.id ? updatedAngle : a); updatePersona({ ...persona, marketingAngles: newAngles }); };
  const removeAngle = (angleId: string) => { if(!confirm("Supprimer ?")) return; const newAngles = persona.marketingAngles.filter(a => a.id !== angleId); updatePersona({ ...persona, marketingAngles: newAngles }); };
  return (
    <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-700/50 animate-in fade-in duration-300">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
          <div><h3 className="text-2xl font-bold text-emerald-400 mb-2">{persona.name}</h3><p className="text-gray-400 text-base leading-relaxed max-w-2xl">{persona.description}</p></div>
        </div>
        <div className="space-y-6">
          <h4 className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-4">Angles Marketing</h4>
          {persona.marketingAngles.map((angle) => <MarketingAngleView key={angle.id} angle={angle} onUpdate={updateAngle} onRemove={() => removeAngle(angle.id)} productContext={{ ...productContext, personaName: persona.name }} />)}
          <button onClick={addMarketingAngle} className="w-full py-2 border border-dashed border-gray-700 text-gray-500 hover:text-emerald-400 hover:border-emerald-500 hover:bg-emerald-500/5 rounded-lg text-sm transition-all flex items-center justify-center gap-2"><Plus size={14} /> Ajouter un Angle</button>
        </div>
      </div>
  );
}

function MarketingAngleView({ angle, onUpdate, onRemove, productContext }: { angle: MarketingAngle, onUpdate: (a: MarketingAngle) => void, onRemove: () => void, productContext: any }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(angle.name);
  const saveName = () => { onUpdate({ ...angle, name }); setIsEditingName(false); };
  const addAdCopy = () => { const newCopy = { id: `temp-copy-${Date.now()}`, text: "" }; onUpdate({ ...angle, adCopies: [...angle.adCopies, newCopy] as any }); };
  const updateAdCopy = (updatedCopy: AdCopy) => { const newCopies = angle.adCopies.map(c => c.id === updatedCopy.id ? updatedCopy : c); onUpdate({ ...angle, adCopies: newCopies }); };
  const removeAdCopy = (copyId: string) => { const newCopies = angle.adCopies.filter(c => c.id !== copyId); onUpdate({ ...angle, adCopies: newCopies }); };
  return (
    <div className="relative pl-6 border-l-2 border-gray-700/50 hover:border-emerald-500/50 transition-colors duration-300 group/angle">
      <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 transition-colors ${isExpanded ? 'bg-blue-500 border-blue-500' : 'bg-gray-900 border-gray-600'}`}></div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
           <button onClick={() => setIsExpanded(!isExpanded)}><ChevronRight size={16} className={`text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} /></button>
           {isEditingName ? (
              <div className="flex bg-gray-900 rounded border border-gray-700"><input value={name} onChange={(e) => setName(e.target.value)} className="bg-transparent text-white px-2 py-1 outline-none font-semibold" /><button onClick={saveName} className="px-2 hover:text-emerald-400"><Save size={14}/></button></div>
           ) : (
              <h4 onClick={() => setIsEditingName(true)} className="text-lg font-semibold text-white hover:text-blue-400 transition-colors cursor-pointer border-b border-transparent hover:border-blue-400/50">{angle.name}</h4>
           )}
        </div>
        <button onClick={onRemove} className="text-gray-600 hover:text-red-500 opacity-0 group-hover/angle:opacity-100 transition-opacity p-1"><Trash2 size={14} /></button>
      </div>
      {isExpanded && (
        <div className="space-y-4 mt-3 animate-in slide-in-from-top-2 duration-200">
          {angle.adCopies.map((copy) => <AdCopyCard key={copy.id} copy={copy} onSave={updateAdCopy} onRemove={() => removeAdCopy(copy.id)} productContext={{ ...productContext, angleName: angle.name }} />)}
          <button onClick={addAdCopy} className="text-xs flex items-center gap-1 text-gray-500 hover:text-emerald-400 py-1"><Plus size={12} /> Ajouter une variante</button>
        </div>
      )}
    </div>
  );
}

function AdCopyCard({ copy, onSave, onRemove, productContext }: { copy: AdCopy, onSave: (c: AdCopy) => void, onRemove: () => void, productContext: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(copy.text);
  const [copied, setCopied] = useState(false);
  useEffect(() => { if (!copy.text) setIsEditing(true); }, [copy.text]);
  const handleCopy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const handleSave = () => { onSave({ ...copy, text }); setIsEditing(false); };
  const cleanText = (t: string) => t.replace(/^["']|["']$/g, '').trim();

  return (
    <div className="bg-gray-900/40 p-5 rounded-xl border border-gray-800 hover:border-gray-600 transition-all hover:bg-gray-900/60 group">
      <div className="flex justify-between items-start mb-3"><span></span><div className="flex gap-2">
           {!isEditing && <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2"><button onClick={() => setIsEditing(true)} className="p-1.5 text-gray-400 hover:text-white bg-gray-800 rounded hover:bg-gray-700"><Edit2 size={14} /></button><button onClick={handleCopy} className="p-1.5 text-gray-400 hover:text-white bg-gray-800 rounded hover:bg-gray-700">{copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}</button><button onClick={onRemove} className="p-1.5 text-gray-400 hover:text-red-400 bg-gray-800 rounded hover:bg-gray-700"><Trash2 size={14} /></button></div>}
           {isEditing && <button onClick={onRemove} className="p-1 text-red-500 hover:text-red-400"><X size={14} /></button>}
        </div></div>
      {isEditing ? (
        <div className="space-y-3"><div className="relative"><textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full bg-gray-950 text-gray-200 p-3 rounded-lg border border-gray-700 focus:border-emerald-500 min-h-[120px] text-sm leading-relaxed" placeholder="Texte de la publicité..." /><SuggestionButton type="ad_copy" context={productContext} onSuggest={setText} className="absolute right-2 top-2 bg-gray-900" /></div><div className="flex justify-end gap-2 pt-2"><button onClick={() => { setText(copy.text); setIsEditing(false); }} className="text-xs px-3 py-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded">Annuler</button><button onClick={handleSave} className="text-xs px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-500 font-medium">Enregistrer</button></div></div>
      ) : <p className="text-gray-300 text-sm whitespace-pre-line leading-relaxed font-light min-h-[1.5rem]">{cleanText(text)}</p>}
    </div>
  );
}
