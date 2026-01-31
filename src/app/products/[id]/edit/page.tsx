'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Upload, Image as ImageIcon, Trash2, ChevronLeft, ChevronRight, AlertCircle, Sparkles, Loader } from 'lucide-react';

interface UploadedImage {
  file?: File;
  preview: string;
  isExisting?: boolean; // Pour distinguer les images existantes des nouvelles
}

interface FormData {
  images: UploadedImage[];
  productName: string;
  headline: string;
  description: string;
  currency: string;
  priceOld: number | null;
  priceNew: number | null;
  benefits: Array<{ title: string; description: string }>;
  ctaText: string;
  phone: string;
  whatsapp: string;
  deliveryInfo: string;
  adCopies: string[];
  language?: string;
}

const languages = [
  { code: 'FR', label: 'Français (FR)' },
  { code: 'AR', label: 'Arabe (AR)' },
  { code: 'ESP', label: 'Espagnol (ESP)' },
  { code: 'EN', label: 'Anglais (EN)' },
  { code: 'IT', label: 'Italien (IT)' },
];

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatingAdCopies, setGeneratingAdCopies] = useState(false);
  const [generatingAllFromImage, setGeneratingAllFromImage] = useState(false);

  // Charger les données du produit existant
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) throw new Error('Failed to load product');

        const product = await response.json();
        
        // Convertir les images existantes en format UploadedImage
        const existingImages: UploadedImage[] = product.images?.map((img: any) => ({
          preview: img.url,
          isExisting: true,
        })) || [];

        // Remplir le formulaire avec les données existantes
        setFormData(prev => ({
          ...prev,
          productName: product.name,
          headline: product.headline || '',
          description: product.description || '',
          currency: product.currency || 'DA',
          priceOld: product.priceOld || null,
          priceNew: product.priceNew || null,
          benefits: (product.benefits && Array.isArray(product.benefits)) ? product.benefits : [],
          ctaText: product.ctaText || 'Commander maintenant',
          phone: product.phone || '',
          whatsapp: product.whatsapp || '',
          deliveryInfo: product.deliveryInfo || '',
          adCopies: (product.adCopies && Array.isArray(product.adCopies)) ? product.adCopies : [],
          images: existingImages,
        }));

        setLoading(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur de chargement';
        setError(message);
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    handleImageUpload(files);
  };

  const handleImageUpload = (files: FileList) => {
    const newImages: UploadedImage[] = [];
    const currentCount = formData.images.length;

    Array.from(files).forEach((file, index) => {
      if (currentCount + index >= 5) return;
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        newImages.push({ file, preview, isExisting: false });
        
        if (newImages.length === Math.min(files.length, 5 - currentCount)) {
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...newImages].slice(0, 5),
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleInputChange = (
    field: keyof FormData,
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleGenerateAdCopies = async () => {
    if (!formData.productName) {
      setError('Veuillez entrer le nom du produit');
      return;
    }
    setGeneratingAdCopies(true);
    setError(null);
    try {
      const res = await fetch('/api/generate-ad-copies', {
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
        setFormData(prev => ({ ...prev, adCopies: data.adCopies }));
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Erreur lors de la génération des ad copies');
    } finally {
      setGeneratingAdCopies(false);
    }
  };

  const handleGenerateAllFromImage = async () => {
    if (formData.images.length === 0) {
      setError('Veuillez ajouter au moins une image');
      return;
    }

    setGeneratingAllFromImage(true);
    setError(null);
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
        setError(data.error || 'Erreur lors de la génération');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Erreur lors de la génération');
    } finally {
      setGeneratingAllFromImage(false);
    }
  };

  const handleRemoveAdCopy = (index: number) => {
    setFormData(prev => ({
      ...prev,
      adCopies: prev.adCopies.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateAdCopy = (index: number, value: string) => {
    const newAdCopies = [...formData.adCopies];
    newAdCopies[index] = value;
    setFormData(prev => ({ ...prev, adCopies: newAdCopies }));
  };

  const handleBenefitChange = (
    index: number,
    field: 'title' | 'description',
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.map((b, i) =>
        i === index ? { ...b, [field]: value } : b
      ),
    }));
  };

  const addBenefit = () => {
    if (formData.benefits.length < 6) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, { title: '', description: '' }],
      }));
    }
  };

  const removeBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    setError(null);

    if (formData.images.length === 0) {
      setError('Au moins une image est requise');
      return;
    }

    try {
      setSaving(true);

      // Convertir les images en URLs (base64)
      const imageUrls = formData.images.map(img => img.preview);

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.productName,
          headline: formData.headline,
          description: formData.description,
          currency: formData.currency,
          priceOld: formData.priceOld,
          priceNew: formData.priceNew,
          ctaText: formData.ctaText,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          deliveryInfo: formData.deliveryInfo,
          benefits: formData.benefits,
          adCopies: formData.adCopies.length > 0 ? formData.adCopies : undefined,
          images: imageUrls.length > 0 ? imageUrls : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour');
      }

      router.push('/products');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  const steps = ['Images', 'Informations', 'Bénéfices', 'Contact & CTA', 'Ad Copies'];
  const stepsCount = 5;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1520] to-[#0f1822] p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-400 transition-colors mb-4"
          >
            <ChevronLeft size={16} />
            Retour
          </button>
          <h1 className="text-3xl font-bold text-white">Éditer le Produit</h1>
          <p className="text-gray-400 mt-2">{formData.productName}</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex gap-3">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Step Indicators */}
        <div className="mb-8">
          <div className="flex gap-2 mb-4">
            {steps.map((stepName, i) => (
              <button
                key={i}
                onClick={() => setStep(i + 1)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  step === i + 1
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800/80'
                }`}
              >
                {i + 1}. {stepName}
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-500">
            Étape {step} sur {stepsCount}
          </div>
        </div>

        {/* Step 1: Images */}
        {step === 1 && (
          <div className="space-y-6">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                dragActive
                  ? 'border-emerald-500 bg-emerald-500/5'
                  : 'border-gray-600 bg-gray-800/30 hover:border-gray-500'
              }`}
            >
              <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-300 font-medium mb-2">
                Déposez vos images ici
              </p>
              <p className="text-xs text-gray-500 mb-4">
                ou cliquez pour sélectionner (max 5 images)
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                className="hidden"
                id="imageInput"
              />
              <label
                htmlFor="imageInput"
                className="inline-block px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 cursor-pointer transition-colors text-sm font-medium"
              >
                Sélectionner des images
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

            {/* Image Grid */}
            {formData.images.length > 0 && (
              <div>
                <p className="text-sm text-gray-400 mb-3">
                  {formData.images.length}/5 images téléchargées
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={img.preview}
                        alt={`Preview ${idx}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      {img.isExisting && (
                        <div className="absolute top-2 left-2 px-2 py-1 bg-blue-500 text-white text-xs rounded">
                          Existante
                        </div>
                      )}
                      <button
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Informations */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Nom du produit
              </label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => handleInputChange('productName', e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Accroche marketing
              </label>
              <input
                type="text"
                value={formData.headline}
                onChange={(e) => handleInputChange('headline', e.target.value)}
                maxLength={100}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                placeholder="Ex: Le meilleur produit du marché"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.headline.length}/100 caractères
              </p>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Devise
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option>DA</option>
                  <option>EUR</option>
                  <option>USD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Ancien prix
                </label>
                <input
                  type="number"
                  value={formData.priceOld || ''}
                  onChange={(e) =>
                    handleInputChange('priceOld', e.target.value ? parseFloat(e.target.value) : null)
                  }
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Prix
                </label>
                <input
                  type="number"
                  value={formData.priceNew || ''}
                  onChange={(e) =>
                    handleInputChange('priceNew', e.target.value ? parseFloat(e.target.value) : null)
                  }
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Bénéfices */}
        {step === 3 && (
          <div className="space-y-4">
            {formData.benefits.map((benefit, idx) => (
              <div key={idx} className="p-4 border border-gray-700 rounded-lg space-y-3">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm text-gray-400">Bénéfice {idx + 1}</p>
                  <button
                    onClick={() => removeBenefit(idx)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <input
                  type="text"
                  value={benefit.title}
                  onChange={(e) =>
                    handleBenefitChange(idx, 'title', e.target.value)
                  }
                  maxLength={50}
                  placeholder="Titre du bénéfice"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none text-sm"
                />
                <textarea
                  value={benefit.description}
                  onChange={(e) =>
                    handleBenefitChange(idx, 'description', e.target.value)
                  }
                  maxLength={150}
                  placeholder="Description du bénéfice"
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none text-sm resize-none"
                />
              </div>
            ))}
            {formData.benefits.length < 6 && (
              <button
                onClick={addBenefit}
                className="w-full py-2 px-4 border-2 border-dashed border-gray-600 text-gray-400 hover:border-emerald-500 hover:text-emerald-400 rounded-lg transition-colors text-sm font-medium"
              >
                + Ajouter un bénéfice
              </button>
            )}
          </div>
        )}

        {/* Step 4: Contact & CTA */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Texte du bouton CTA
              </label>
              <input
                type="text"
                value={formData.ctaText}
                onChange={(e) => handleInputChange('ctaText', e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Numéro téléphone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+213..."
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                WhatsApp
              </label>
              <input
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                placeholder="+213..."
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Informations de livraison
              </label>
              <textarea
                value={formData.deliveryInfo}
                onChange={(e) => handleInputChange('deliveryInfo', e.target.value)}
                rows={3}
                placeholder="Ex: Livraison gratuite partout en Algérie"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 5: Ad Copies */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Ad Copies (Publicités)</h3>
              <button
                onClick={handleGenerateAdCopies}
                disabled={generatingAdCopies || !formData.productName}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:shadow-lg hover:shadow-purple-500/40 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
              >
                {generatingAdCopies ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Générer par AI
                  </>
                )}
              </button>
            </div>

            {formData.adCopies.map((copy, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-start">
                  <label className="block text-sm font-medium text-gray-300">
                    Ad Copy {idx + 1}
                  </label>
                  <button
                    onClick={() => handleRemoveAdCopy(idx)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <textarea
                  value={copy}
                  onChange={(e) => handleUpdateAdCopy(idx, e.target.value)}
                  maxLength={150}
                  rows={2}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none resize-none"
                  placeholder="Écrivez votre ad copy..."
                />
                <p className="text-xs text-gray-500">{copy.length}/150</p>
              </div>
            ))}

            {formData.adCopies.length < 5 && (
              <button
                onClick={() =>
                  setFormData(prev => ({
                    ...prev,
                    adCopies: [...prev.adCopies, ''],
                  }))
                }
                className="w-full py-2 px-4 border-2 border-dashed border-gray-600 text-gray-400 hover:border-emerald-500 hover:text-emerald-400 rounded-lg transition-colors text-sm font-medium"
              >
                + Ajouter une ad copy
              </button>
            )}
          </div>
        )}

        {/* Navigation Footer */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="flex items-center gap-2 px-6 py-2 bg-gray-800/50 text-gray-400 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors font-medium"
          >
            <ChevronLeft size={18} />
            Précédent
          </button>

          {step < stepsCount ? (
            <button
              onClick={() => {
                if (step === 1 && formData.images.length === 0) {
                  setError('Au moins une image est requise');
                  return;
                }
                setStep(Math.min(stepsCount, step + 1));
              }}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-colors font-medium"
            >
              Suivant
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving || formData.images.length === 0}
              className="flex-1 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
