'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Edit2, Trash2, AlertCircle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  headline: string | null;
  currency: string;
  priceOld: number | null;
  priceNew: number | null;
  ctaText: string;
  phone: string | null;
  whatsapp: string | null;
  deliveryInfo: string | null;
  benefits: Array<{ title: string; description: string }> | null;
  adCopies: string[] | null;
  createdAt: string;
  updatedAt: string;
  images: Array<{
    id: string;
    url: string;
    isPrimary: boolean;
    order: number;
  }>;
  landingPages: Array<{ id: string }>;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) throw new Error('Produit non trouvé');

        const data = await response.json();
        setProduct(data);
        setLoading(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur de chargement';
        setError(message);
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erreur lors de la suppression');

      router.push('/products');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      setDeleting(false);
    }
  };

  const nextImage = () => {
    if (product?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product?.images) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + product.images.length) % product.images.length
      );
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

  if (error || !product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-red-400">{error || 'Produit non trouvé'}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1520] to-[#0f1822] p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-400 transition-colors mb-4"
          >
            <ChevronLeft size={16} />
            Retour
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white">{product.name}</h1>
              <p className="text-gray-400 mt-2 text-sm">
                Créé le {new Date(product.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/products/${productId}/edit`)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors font-medium"
              >
                <Edit2 size={18} />
                Éditer
              </button>
              <button
                onClick={() => setDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors font-medium"
              >
                <Trash2 size={18} />
                Supprimer
              </button>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-sm">
              <h3 className="text-xl font-bold text-white mb-2">Supprimer le produit?</h3>
              <p className="text-gray-400 mb-6">
                Cette action est irréversible. Le produit et toutes ses images seront supprimés.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Images Section */}
          <div>
            <div className="relative bg-gray-800/50 rounded-lg overflow-hidden aspect-square flex items-center justify-center">
              {product.images.length > 0 ? (
                <>
                  <img
                    src={product.images[currentImageIndex].url}
                    alt={`${product.name} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors"
                      >
                        <ChevronRight size={20} />
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 rounded-full text-xs text-white">
                        {currentImageIndex + 1}/{product.images.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <p className="text-gray-500">Aucune image</p>
              )}
            </div>

            {/* Image Thumbnails */}
            {product.images.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto">
                {product.images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all ${
                      currentImageIndex === idx
                        ? 'ring-2 ring-emerald-500'
                        : 'opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="space-y-6">
            {/* Headline */}
            {product.headline && (
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">Accroche</p>
                <p className="text-xl font-semibold text-emerald-400">
                  {product.headline}
                </p>
              </div>
            )}

            {/* Description */}
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">Description</p>
              <p className="text-gray-300 leading-relaxed">
                {product.description || 'Aucune description'}
              </p>
            </div>

            {/* Prix */}
            {(product.priceOld || product.priceNew) && (
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">Prix</p>
                <div className="flex items-center gap-4">
                  {product.priceOld && (
                    <p className="text-lg text-gray-500 line-through">
                      {product.priceOld} {product.currency}
                    </p>
                  )}
                  {product.priceNew && (
                    <p className="text-2xl font-bold text-emerald-400">
                      {product.priceNew} {product.currency}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Bénéfices */}
            {product.benefits && Array.isArray(product.benefits) && product.benefits.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider mb-3">Bénéfices</p>
                <div className="space-y-3">
                  {product.benefits.map((benefit: any, idx: number) => (
                    <div key={idx} className="p-3 bg-gray-800/50 rounded-lg">
                      <p className="font-semibold text-emerald-400 mb-1">{benefit.title}</p>
                      <p className="text-sm text-gray-400">{benefit.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact */}
            {(product.phone || product.whatsapp) && (
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">Contact</p>
                <div className="space-y-2">
                  {product.phone && (
                    <p className="text-gray-300">
                      <span className="text-gray-500">Téléphone:</span> {product.phone}
                    </p>
                  )}
                  {product.whatsapp && (
                    <p className="text-gray-300">
                      <span className="text-gray-500">WhatsApp:</span> {product.whatsapp}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* CTA */}
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">Bouton d'action</p>
              <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-lg">
                {product.ctaText}
              </button>
            </div>

            {/* Livraison */}
            {product.deliveryInfo && (
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">Livraison</p>
                <p className="text-gray-300">{product.deliveryInfo}</p>
              </div>
            )}

            {/* Ad Copies */}
            {product.adCopies && product.adCopies.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">Ad Copies (Publicités)</p>
                <div className="space-y-2">
                  {product.adCopies.map((copy, idx) => (
                    <div key={idx} className="p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-gray-300">
                        <span className="text-gray-500 font-medium">#{idx + 1}:</span> {copy}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Images</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {product.images.length}
                </p>
              </div>
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                  Landing Pages
                </p>
                <p className="text-2xl font-bold text-emerald-400">
                  {product.landingPages.length}
                </p>
              </div>
            </div>

            {/* Metadata */}
            <div className="space-y-2 text-sm text-gray-400">
              <p>
                <span className="text-gray-500">ID:</span> {product.id}
              </p>
              <p>
                <span className="text-gray-500">Créé:</span>{' '}
                {new Date(product.createdAt).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <p>
                <span className="text-gray-500">Modifié:</span>{' '}
                {new Date(product.updatedAt).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            <button
              onClick={() => router.push(`/products/${productId}/edit`)}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
            >
              Continuer l'édition
            </button>
          </div>
        </div>

        {/* All Images */}
        {product.images.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Toutes les images</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {product.images.map((img, idx) => (
                <div
                  key={img.id}
                  className="relative group rounded-lg overflow-hidden aspect-square"
                >
                  <img
                    src={img.url}
                    alt={`Image ${idx}`}
                    className="w-full h-full object-cover"
                  />
                  {img.isPrimary && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-emerald-500 text-white text-xs font-medium rounded">
                      Image principale
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
