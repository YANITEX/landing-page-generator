'use client';

import { useState, useEffect } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
  SortableContext as SortableProvider
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Eye,
  RotateCcw,
  Trash2,
  Plus,
  Loader2,
  AlertTriangle,
  Image as ImageIcon,
  Download
} from 'lucide-react';
import Image from 'next/image';

// Fonction helper pour normaliser les sections de l'API
function normalizeSections(sections: any[]): Section[] {
  return sections.map(section => ({
    ...section,
    images: getImages(section)
  }));
}

// Fonction helper pour gérer les images (JSON string ou array)
function getImages(section: any): string[] {
  if (typeof section.images === 'string') {
    try {
      return JSON.parse(section.images);
    } catch {
      return [];
    }
  }
  return Array.isArray(section.images) ? section.images : [];
}

interface Section {
  id: string;
  type: string;
  title?: string;
  content?: string;
  images: string[];
  order: number;
  isActive: boolean;
  generationStatus: string;
  createdAt: string;
  updatedAt: string;
}

interface SectionManagerProps {
  landingPageId: string;
  sections: Section[];
  onSectionsUpdate: (sections: Section[]) => void;
}

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

const availableSectionTypes = [
  { value: 'hero', label: 'Hero / En-tête' },
  { value: 'problem', label: 'Problème' },
  { value: 'solution', label: 'Solution' },
  { value: 'benefits', label: 'Bénéfices' },
  { value: 'social-proof', label: 'Preuves sociales' },
  { value: 'how-it-works', label: 'Comment ça marche' },
  { value: 'faq', label: 'FAQ' },
  { value: 'cta', label: 'Appel à l\'action' }
];

export default function SectionManager({ landingPageId, sections, onSectionsUpdate }: SectionManagerProps) {
  const [localSections, setLocalSections] = useState<Section[]>(sections);
  const [isReordering, setIsReordering] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setLocalSections(normalizeSections(sections));
  }, [sections]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = localSections.findIndex(section => section.id === active.id);
    const newIndex = localSections.findIndex(section => section.id === over.id);

    const newSections = arrayMove(localSections, oldIndex, newIndex);
    
    // Mettre à jour l'ordre local immédiatement
    const sectionsWithNewOrder = newSections.map((section, index) => ({
      ...section,
      order: index
    }));

    setLocalSections(sectionsWithNewOrder);
    setIsReordering(true);

    try {
      const sectionOrders = sectionsWithNewOrder.map(section => ({
        id: section.id,
        order: section.order
      }));

      const response = await fetch(`/api/landing-pages/${landingPageId}/sections/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionOrders })
      });

      if (response.ok) {
        const updatedSections = normalizeSections(await response.json());
        setLocalSections(updatedSections);
        onSectionsUpdate(updatedSections);
      } else {
        // Rétablir l'ordre précédent en cas d'erreur
        setLocalSections(normalizeSections(sections));
        console.error('Erreur lors de la réorganisation');
      }
    } catch (error) {
      console.error('Erreur lors de la réorganisation:', error);
      setLocalSections(normalizeSections(sections));
    } finally {
      setIsReordering(false);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette section ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/landing-pages/${landingPageId}/sections/${sectionId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const updatedSections = localSections.filter(s => s.id !== sectionId);
        setLocalSections(updatedSections);
        onSectionsUpdate(updatedSections);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleRegenerateSection = async (sectionId: string) => {
    try {
      const response = await fetch(`/api/landing-pages/${landingPageId}/sections/${sectionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'regenerate' })
      });

      if (response.ok) {
        // Marquer la section comme en cours de génération
        const updatedSections = localSections.map(section =>
          section.id === sectionId 
            ? { ...section, generationStatus: 'generating', images: [] }
            : section
        );
        setLocalSections(updatedSections);
        onSectionsUpdate(updatedSections);
      }
    } catch (error) {
      console.error('Erreur lors de la régénération:', error);
    }
  };

  const handleDownloadSection = async (sectionId: string) => {
    try {
      const response = await fetch(`/api/landing-pages/${landingPageId}/sections/${sectionId}/download`);
      
      if (response.ok) {
        const blob = await response.blob();
        const contentDisposition = response.headers.get('Content-Disposition');
        const fileName = contentDisposition 
          ? contentDisposition.split('filename="')[1].split('"')[0]
          : `section-${sectionId}.png`;
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        const errorData = await response.json();
        console.error('Erreur lors du téléchargement:', errorData);
        alert(`Erreur lors du téléchargement: ${errorData.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      alert('Erreur lors du téléchargement de la section');
    }
  };

  const handleAddSection = async (sectionType: string) => {
    try {
      const response = await fetch(`/api/landing-pages/${landingPageId}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: sectionType,
          title: sectionTypeNames[sectionType] || sectionType
        })
      });

      if (response.ok) {
        const newSection = await response.json();
        const updatedSections = [...localSections, newSection];
        setLocalSections(updatedSections);
        onSectionsUpdate(updatedSections);
        setShowAddSection(false);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la section:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">
          Gestion des sections ({localSections.length})
        </h3>
        <button
          onClick={() => setShowAddSection(!showAddSection)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter une section
        </button>
      </div>

      {/* Menu d'ajout de section */}
      {showAddSection && (
        <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <h4 className="text-white font-medium mb-3">Choisir un type de section</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {availableSectionTypes.map(type => (
              <button
                key={type.value}
                onClick={() => handleAddSection(type.value)}
                className="p-3 text-left bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors text-gray-300 hover:text-white text-sm"
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Liste des sections */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={localSections.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {localSections.map((section) => (
              <SortableSection
                key={section.id}
                section={section}
                onDelete={() => handleDeleteSection(section.id)}
                onRegenerate={() => handleRegenerateSection(section.id)}
                onDownload={() => handleDownloadSection(section.id)}
                isReordering={isReordering}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {localSections.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          <p>Aucune section créée</p>
          <p className="text-sm">Ajoutez votre première section pour commencer</p>
        </div>
      )}
    </div>
  );
}

interface SortableSectionProps {
  section: Section;
  onDelete: () => void;
  onRegenerate: () => void;
  onDownload: () => void;
  isReordering: boolean;
}

function SortableSection({ section, onDelete, onRegenerate, onDownload, isReordering }: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'generating':
      case 'pending':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'error':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusText = (status: string) => {
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
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors ${
        isDragging ? 'shadow-xl' : ''
      } ${isReordering ? 'pointer-events-none' : ''}`}
    >
      <div className="flex items-center gap-4">
        {/* Handle de drag */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-move p-2 hover:bg-gray-700/50 rounded text-gray-400 hover:text-gray-300"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Preview de l'image */}
        <div className="w-16 h-16 bg-gray-700/50 rounded-lg flex-shrink-0 overflow-hidden">
          {getImages(section).length > 0 ? (
            <Image
              src={getImages(section)[0]}
              alt={section.type}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {section.generationStatus === 'generating' ? (
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              ) : section.generationStatus === 'error' ? (
                <AlertTriangle className="w-6 h-6 text-red-400" />
              ) : (
                <ImageIcon className="w-6 h-6 text-gray-600" />
              )}
            </div>
          )}
        </div>

        {/* Infos de la section */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="text-white font-medium">
              {sectionTypeNames[section.type] || section.type}
            </h4>
            <div className={`px-2 py-1 rounded text-xs border ${getStatusColor(section.generationStatus)}`}>
              {getStatusText(section.generationStatus)}
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>Ordre: {section.order}</span>
            {getImages(section).length > 0 && (
              <span>{getImages(section).length} image(s)</span>
            )}
            <span>Modifié: {new Date(section.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onDownload}
            disabled={getImages(section).length === 0 || section.generationStatus !== 'completed'}
            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Télécharger"
          >
            <Download className="w-4 h-4" />
          </button>
          
          <button
            onClick={onRegenerate}
            disabled={section.generationStatus === 'generating'}
            className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Régénérer"
          >
            <RotateCcw className={`w-4 h-4 ${section.generationStatus === 'generating' ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}