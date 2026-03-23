/**
 * Configuration centralisée des modèles AI
 * Liste blanche des modèles autorisés et configuration par défaut
 */

// Liste blanche des modèles Gemini autorisés
export const ALLOWED_MODELS = {
  // Modèles de texte
  TEXT: [
    'gemini-3-flash-preview',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-exp',
  ],
  // Modèles d'images
  IMAGE: [
    'gemini-3-pro-image-preview',
    'gemini-2.5-flash-image',
  ],
} as const;

// Configuration par défaut pour chaque endpoint
export const DEFAULT_AI_CONFIG = {
  benefits: {
    endpoint: 'benefits',
    modelName: 'gemini-2.0-flash',
    description: 'Génération des bénéfices produit',
  },
  headline: {
    endpoint: 'headline',
    modelName: 'gemini-2.0-flash',
    description: 'Génération des accroches marketing',
  },
  adCopies: {
    endpoint: 'adCopies',
    modelName: 'gemini-2.0-flash',
    description: 'Génération des ad copies publicitaires',
  },
  suggest: {
    endpoint: 'suggest',
    modelName: 'gemini-2.0-flash',
    description: 'Suggestions de contenu (personas, angles)',
  },
  generateAll: {
    endpoint: 'generateAll',
    modelName: 'gemini-2.0-flash',
    description: 'Génération complète (informations de produit) depuis image',
  },
  images: {
    endpoint: 'images',
    modelName: 'gemini-3-pro-image-preview',
    description: 'Génération d\'images de sections',
  },
  palette: {
    endpoint: 'palette',
    modelName: 'gemini-2.0-flash',
    description: 'Analyse d\'image et extraction de palette de couleurs',
  },
} as const;

// Type pour les endpoints
export type AIEndpoint = keyof typeof DEFAULT_AI_CONFIG;

// Validation d'un nom de modèle
export function isModelAllowed(modelName: string, type: 'TEXT' | 'IMAGE' = 'TEXT'): boolean {
  const allowedList = ALLOWED_MODELS[type] as readonly string[];
  return allowedList.includes(modelName);
}

// Obtenir la liste des modèles autorisés pour un type
export function getAllowedModels(type: 'TEXT' | 'IMAGE' = 'TEXT'): readonly string[] {
  return ALLOWED_MODELS[type];
}
