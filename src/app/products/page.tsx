'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';
import { Package, Plus, Edit2, Trash2, X, Check, Image as ImageIcon } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string | null;
  images: Array<{ id: string; url: string }>;
  landingPages: Array<{ id: string }>;
  createdAt: string;
  updatedAt: string;
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product?: Product) => {
    // Removed modal - redirect to edit page instead
  };

  const handleCloseModal = () => {
    // Modal removed
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchProducts();
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Erreur lors de la suppression');
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
              <h1 className="text-4xl font-bold text-white mb-2">Mes Produits</h1>
              <p className="text-gray-400">
                Gérez vos produits ({products.length})
              </p>
            </div>
            <Link href="/products/create">
              <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/40 transition-all">
                <Plus className="w-5 h-5" />
                Nouveau Produit
              </button>
            </Link>
          </div>

          {/* Empty State */}
          {products.length === 0 ? (
            <div className="text-center py-24 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-500" />
              <h2 className="text-2xl font-semibold text-white mb-2">Aucun produit</h2>
              <p className="text-gray-400 mb-8">
                Commencez par créer votre premier produit
              </p>
              <Link href="/products/create">
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/40 transition-all">
                  <Plus className="w-5 h-5" />
                  Créer un produit
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-all group h-full"
                >
                    {/* Image Preview */}
                    <div 
                      onClick={() => {
                        if (product.id && typeof product.id === 'string' && product.id.trim() !== '') {
                          router.push(`/products/${product.id}`);
                        } else {
                          console.error('Invalid product ID:', product.id);
                        }
                      }}
                      className="h-40 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 flex items-center justify-center relative overflow-hidden cursor-pointer"
                    >
                      {product.images.length > 0 ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <ImageIcon className="w-12 h-12 text-gray-500" />
                      )}
                    </div>

                    {/* Content */}
                    <div 
                      onClick={() => {
                        if (product.id && typeof product.id === 'string' && product.id.trim() !== '') {
                          router.push(`/products/${product.id}`);
                        } else {
                          console.error('Invalid product ID:', product.id);
                        }
                      }}
                      className="p-5 cursor-pointer"
                    >
                      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                          {product.description}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="flex gap-3 mb-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          📸 {product.images.length}
                        </span>
                        <span className="flex items-center gap-1">
                          📄 {product.landingPages.length}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (product.id && typeof product.id === 'string' && product.id.trim() !== '') {
                              router.push(`/products/${product.id}/edit`);
                            } else {
                              console.error('Invalid product ID for edit:', product.id);
                            }
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors text-sm font-medium"
                        >
                          <Edit2 className="w-4 h-4" />
                          Éditer
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(product.id);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-sm font-medium"
                        >
                          <Trash2 className="w-4 h-4" />
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
