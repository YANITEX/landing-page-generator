'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';
import { ChevronRight, Plus, X, Sparkles, Loader, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';

interface Benefit {
  title: string;
  description: string;
}

interface UploadedImage {
  file: File;
  preview: string;
}

interface FormData {
  images: UploadedImage[];
  productName: string;
  headline: string;
  description: string;
  currency: string;
  priceOld: number | null;
  priceNew: number | null;
  benefits: Benefit[];
  ctaText: string;
  phone: string;
  whatsapp: string;
  deliveryInfo: string;
  adCopies: string[];
  language: string;
}

const currencies = ['DA', 'EUR', 'USD', 'MAD', 'TND'];
const languages = [
  { code: 'FR', label: 'Français (FR)' },
  { code: 'AR', label: 'Arabe (AR)' },
  { code: 'ESP', label: 'Espagnol (ESP)' },
  { code: 'EN', label: 'Anglais (EN)' },
  { code: 'IT', label: 'Italien (IT)' },
];

export default function CreateProductPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    images: [],
    productName: '',
    headline: '',
    description: '',
    currency: 'DA',
    priceOld: null,
    priceNew: null,
    benefits: [],
    ctaText: 'Commander maintenant',
    phone: '',
    whatsapp: '',
    deliveryInfo: '',
    adCopies: [],
    language: 'FR',
  });
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [generatingAdCopies, setGeneratingAdCopies] = useState(false);
  const [generatingAllFromImage, setGeneratingAllFromImage] = useState(false);

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;

    const newImages = formData.images.length;
    const filesToAdd = Math.min(files.length, 5 - newImages);

    for (let i = 0; i < filesToAdd; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFormData((prev) => ({
            ...prev,
            images: [
              ...prev.images,
              {
                file,
                preview: e.target?.result as string,
              },
            ],
          }));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleImageUpload(e.dataTransfer.files);
  };

  const handleGenerateHeadline = async () => {
    if (!formData.productName) {
      alert('Veuillez entrer le nom du produit');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/ai/generate-headline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productName: formData.productName,
          language: formData.language
        }),
      });
      const data = await res.json();
      if (data.headline) {
        setFormData({ ...formData, headline: data.headline });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBenefits = async () => {
    if (!formData.productName) {
      alert('Veuillez entrer le nom du produit');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/ai/generate-benefits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: formData.productName,
          description: formData.description,
          language: formData.language,
        }),
      });
      const data = await res.json();
      if (data.benefits) {
        setFormData({ ...formData, benefits: data.benefits });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBenefit = () => {
    if (formData.benefits.length < 6) {
      setFormData({
        ...formData,
        benefits: [...formData.benefits, { title: '', description: '' }],
      });
    }
  };

  const handleRemoveBenefit = (index: number) => {
    setFormData({
      ...formData,
      benefits: formData.benefits.filter((_, i) => i !== index),
    });
  };

  const handleUpdateBenefit = (index: number, field: string, value: string) => {
    const newBenefits = [...formData.benefits];
    newBenefits[index] = { ...newBenefits[index], [field]: value };
    setFormData({ ...formData, benefits: newBenefits });
  };

  const handleGenerateAdCopies = async () => {
    if (!formData.productName) {
      alert('Veuillez entrer le nom du produit');
      return;
    }
    setGeneratingAdCopies(true);
    try {
      const res = await fetch('/api/ai/generate-ad-copies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: formData.productName,
          headline: formData.headline,
          description: formData.description,
          benefits: formData.benefits,
          language: formData.language,
        }),
      });
      const data = await res.json();
      if (data.adCopies) {
        setFormData({ ...formData, adCopies: data.adCopies });
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Erreur lors de la génération des ad copies');
    } finally {
      setGeneratingAdCopies(false);
    }
  };

  const handleGenerateAllFromImage = async () => {
    if (formData.images.length === 0) {
      alert('Veuillez ajouter au moins une image');
      return;
    }

    setGeneratingAllFromImage(true);
    try {
      let imageDataUrl = formData.images[0].preview;

      if (imageDataUrl.startsWith('data:')) {
        try {
          imageDataUrl = await new Promise<string>((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
              const maxSize = 1024;
              const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
              const width = Math.round(img.width * scale);
              const height = Math.round(img.height * scale);

              const canvas = document.createElement('canvas');
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');

              if (!ctx) {
                resolve(formData.images[0].preview);
                return;
              }

              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.onerror = () => reject(new Error('Image load failed'));
            img.src = imageDataUrl;
          });
        } catch (error) {
          console.error('Image resize error:', error);
        }
      }

      const res = await fetch('/api/ai/generate-all-from-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          imageDataUrl,
          language: formData.language 
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setFormData((prev) => ({
          ...prev,
          productName: data.productName || prev.productName,
          headline: data.headline || prev.headline,
          description: data.description || prev.description,
          benefits: Array.isArray(data.benefits) ? data.benefits : prev.benefits,
          adCopies: Array.isArray(data.adCopies) ? data.adCopies : prev.adCopies,
        }));
      } else {
        alert(data.error || 'Erreur lors de la génération');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Erreur lors de la génération');
    } finally {
      setGeneratingAllFromImage(false);
    }
  };

  const handleRemoveAdCopy = (index: number) => {
    setFormData({
      ...formData,
      adCopies: formData.adCopies.filter((_, i) => i !== index),
    });
  };

  const handleUpdateAdCopy = (index: number, value: string) => {
    const newAdCopies = [...formData.adCopies];
    newAdCopies[index] = value;
    setFormData({ ...formData, adCopies: newAdCopies });
  };

  const handleSave = async () => {
    if (!formData.productName) {
      alert('Le nom du produit est requis');
      return;
    }

    if (formData.images.length === 0) {
      alert('Au moins une image est requise');
      return;
    }

    setLoading(true);
    try {
      // Convertir les images en base64
      const imagePromises = formData.images.map((img) => {
        return new Promise<string>((resolve) => {
          resolve(img.preview);
        });
      });

      const imageUrls = await Promise.all(imagePromises);

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.productName,
          description: formData.description,
          images: imageUrls,
          headline: formData.headline,
          currency: formData.currency,
          priceOld: formData.priceOld,
          priceNew: formData.priceNew,
          ctaText: formData.ctaText,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          deliveryInfo: formData.deliveryInfo,
          benefits: formData.benefits,
          adCopies: formData.adCopies.length > 0 ? formData.adCopies : undefined,
        }),
      });

      if (res.ok) {
        alert('Produit créé avec succès!');
        // Rediriger vers les produits
        window.location.href = '/products';
      } else {
        alert('Erreur lors de la création');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1520]">
      <Sidebar />
      <TopNav />

      <main className="ml-64 pt-16 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Steps Navigation */}
          <div className="mb-8">
            <div className="flex items-center gap-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className="flex items-center gap-4">
                  <button
                    onClick={() => setStep(s)}
                    className={`w-10 h-10 rounded-full font-bold transition-all flex items-center justify-center ${
                      step === s
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                        : step > s
                        ? 'bg-emerald-500/30 text-emerald-400'
                        : 'bg-white/10 text-gray-400'
                    }`}
                  >
                    {s}
                  </button>
                  {s < 5 && (
                    <div
                      className={`h-1 w-8 ${
                        step > s ? 'bg-emerald-500' : 'bg-white/10'
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-6 mt-4 text-sm">
              <span className={step === 1 ? 'text-emerald-400 font-semibold' : 'text-gray-400'}>
                Images
              </span>
              <span className={step === 2 ? 'text-emerald-400 font-semibold' : 'text-gray-400'}>
                Informations
              </span>
              <span className={step === 3 ? 'text-emerald-400 font-semibold' : 'text-gray-400'}>
                Bénéfices
              </span>
              <span className={step === 4 ? 'text-emerald-400 font-semibold' : 'text-gray-400'}>
                Contact & CTA
              </span>
              <span className={step === 5 ? 'text-emerald-400 font-semibold' : 'text-gray-400'}>
                Ad Copies
              </span>
            </div>
          </div>

          {/* Step 1: Image Upload */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Photos du Produit</h2>
              <p className="text-gray-400">Uploadez entre 1 et 5 images de votre produit (minimum 1 requise)</p>

              {/* Drag & Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
                  dragActive
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-white/20 hover:border-white/40'
                }`}
              >
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files)}
                  disabled={formData.images.length >= 5}
                  className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-white font-semibold mb-2">
                    Glissez-déposez vos images ou cliquez pour parcourir
                  </p>
                  <p className="text-gray-400 text-sm">
                    PNG, JPG ou WebP. Maximum 5 images.
                  </p>
                </label>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Langue de génération:</span>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code} className="bg-gray-900">
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 text-sm text-gray-400 text-right">
                  Utilisez la première image pour générer toutes les suggestions IA.
                </div>
                <button
                  onClick={handleGenerateAllFromImage}
                  disabled={formData.images.length === 0 || generatingAllFromImage}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${
                    formData.images.length === 0 || generatingAllFromImage
                      ? 'bg-white/10 text-gray-500 cursor-not-allowed'
                      : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                  }`}
                >
                  {generatingAllFromImage ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  Générer tout avec l'image
                </button>
              </div>

              {/* Uploaded Images */}
              {formData.images.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Images uploadées ({formData.images.length}/5)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative group bg-white/5 border border-white/10 rounded-xl overflow-hidden"
                      >
                        <img
                          src={img.preview}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-40 object-cover"
                        />
                        <button
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-emerald-500/80 text-white text-xs rounded">
                          {idx === 0 ? 'Principale' : `Image ${idx + 1}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formData.images.length === 0 && (
                <div className="text-center py-8">
                  <ImageIcon className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">Aucune image uploadée</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Product Information */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Informations Produit</h2>
              <p className="text-gray-400">Décrivez votre produit et finissez les prix.</p>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom du produit *
                </label>
                <input
                  type="text"
                  maxLength={100}
                  value={formData.productName}
                  onChange={(e) =>
                    setFormData({ ...formData, productName: e.target.value })
                  }
                  placeholder="Ex: Crème Anti-rides Premium"
                  className="w-full px-4 py-3 bg-white/5 border border-emerald-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">{formData.productName.length}/100</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Headline / Accroche *
                  </label>
                  <button
                    onClick={handleGenerateHeadline}
                    disabled={loading}
                    className="flex items-center gap-1 px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    Générer IA
                  </button>
                </div>
                <textarea
                  maxLength={150}
                  value={formData.headline}
                  onChange={(e) =>
                    setFormData({ ...formData, headline: e.target.value })
                  }
                  placeholder="Ex: Découvrez le secret d'une peau jeune et radieuse en seulement 7 jours !"
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">{formData.headline.length}/150</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description (optionnel)
                </label>
                <textarea
                  maxLength={300}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Décrivez brièvement votre produit..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">{formData.description.length}/300</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Devise</label>
                <select
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                >
                  {currencies.map((c) => (
                    <option key={c} value={c} className="bg-[#0f1822]">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Prix avant *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={formData.priceOld || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, priceOld: e.target.value ? parseFloat(e.target.value) : null })
                      }
                      placeholder="5000"
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                    <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 flex items-center">
                      {formData.currency}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Prix après *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={formData.priceNew || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, priceNew: e.target.value ? parseFloat(e.target.value) : null })
                      }
                      placeholder="2990"
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                    <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 flex items-center">
                      {formData.currency}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Benefits */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold text-white">Bénéfices</h2>
                  <button
                    onClick={handleGenerateBenefits}
                    disabled={loading}
                    className="flex items-center gap-1 px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    Suggestions IA
                  </button>
                </div>
                <p className="text-gray-400">Ajoutez jusqu'à 6 bénéfices de votre produit.</p>
              </div>

              <div className="space-y-4">
                {formData.benefits.map((benefit, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-300">
                        Bénéfice {idx + 1}
                      </label>
                      <button
                        onClick={() => handleRemoveBenefit(idx)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      maxLength={60}
                      value={benefit.title}
                      onChange={(e) => handleUpdateBenefit(idx, 'title', e.target.value)}
                      placeholder="Titre du bénéfice"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors text-sm"
                    />
                    <textarea
                      maxLength={150}
                      value={benefit.description}
                      onChange={(e) =>
                        handleUpdateBenefit(idx, 'description', e.target.value)
                      }
                      placeholder="Description du bénéfice"
                      rows={2}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none text-sm"
                    />
                  </div>
                ))}
              </div>

              {formData.benefits.length < 6 && (
                <button
                  onClick={handleAddBenefit}
                  className="w-full py-3 border border-dashed border-white/20 hover:border-emerald-500/50 rounded-xl text-gray-400 hover:text-emerald-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Ajouter un bénéfice
                </button>
              )}

              <p className="text-xs text-gray-500">
                Vous avez ajouté au moins 1 bénéfice · {formData.benefits.length}/6
              </p>
            </div>
          )}

          {/* Step 4: CTA & Contact */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">CTA & Contact</h2>
              <p className="text-gray-400">
                Configurez le bouton d'action et les informations de contact.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Texte du bouton CTA *
                </label>
                <input
                  type="text"
                  maxLength={50}
                  value={formData.ctaText}
                  onChange={(e) =>
                    setFormData({ ...formData, ctaText: e.target.value })
                  }
                  placeholder="Commander maintenant"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ce texte apparaîtra sur le bouton principal · {formData.ctaText.length}/50
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Numéro de téléphone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="07 XX XX XX XX"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Numéro WhatsApp (optionnel)
                  </label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) =>
                      setFormData({ ...formData, whatsapp: e.target.value })
                    }
                    placeholder="07 XX XX XX XX"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Informations de livraison
                </label>
                <textarea
                  value={formData.deliveryInfo}
                  onChange={(e) =>
                    setFormData({ ...formData, deliveryInfo: e.target.value })
                  }
                  placeholder="Ex: Livraison gratuite partout en Algérie. Délai: 2-5 jours."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.deliveryInfo.length}/200</p>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <p className="font-medium text-white">Compteur d'urgence</p>
                  <p className="text-sm text-gray-300">
                    Ajouter un compte à rebours pour créer l'urgence
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Ad Copies */}
          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Ad Copies (Publicités)</h2>
              <p className="text-gray-400">Ajoutez entre 1 et 5 ad copies pour votre campagne (optionnel)</p>

              <button
                onClick={handleGenerateAdCopies}
                disabled={generatingAdCopies || !formData.productName}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:shadow-lg hover:shadow-purple-500/40 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingAdCopies ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Générer par AI
                  </>
                )}
              </button>

              <div className="space-y-4">
                {formData.adCopies.map((copy, idx) => (
                  <div key={idx} className="relative">
                    <div className="flex justify-between items-start mb-2">
                      <label className="block text-sm font-medium text-gray-300">
                        Ad Copy {idx + 1}
                      </label>
                      <button
                        onClick={() => handleRemoveAdCopy(idx)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      value={copy}
                      onChange={(e) => handleUpdateAdCopy(idx, e.target.value)}
                      maxLength={150}
                      rows={2}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
                      placeholder="Écrivez votre ad copy..."
                    />
                    <p className="text-xs text-gray-500 mt-1">{copy.length}/150</p>
                  </div>
                ))}

                {formData.adCopies.length < 5 && (
                  <button
                    onClick={() =>
                      setFormData({
                        ...formData,
                        adCopies: [...formData.adCopies, ''],
                      })
                    }
                    className="w-full py-2 px-4 border-2 border-dashed border-gray-600 text-gray-400 hover:border-emerald-500 hover:text-emerald-400 rounded-lg transition-colors text-sm font-medium"
                  >
                    + Ajouter une ad copy
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-12 pt-8 border-t border-white/10">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Retour
            </button>

            {step < 5 ? (
              <button
                onClick={() => {
                  if (step === 1 && formData.images.length === 0) {
                    alert('Au moins une image est requise');
                    return;
                  }
                  setStep(step + 1);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-lg hover:shadow-emerald-500/40 text-white rounded-xl font-medium transition-all"
              >
                Suivant
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={loading || !formData.productName || !formData.priceNew || formData.images.length === 0}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-lg hover:shadow-emerald-500/40 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
                Créer le produit
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
