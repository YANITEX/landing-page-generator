/**
 * Service centralisé pour gérer la configuration des modèles AI
 * Charge depuis la base de données avec cache pour performance
 */

import { prisma } from './prisma';
import { DEFAULT_AI_CONFIG, isModelAllowed, type AIEndpoint } from './ai-config';

// Cache en mémoire avec invalidation
let configCache: Map<string, { modelName: string; timestamp: number }> = new Map();
const CACHE_TTL = 5000; // 5 secondes - hot reload rapide

/**
 * Récupère le modèle AI configuré pour un endpoint donné
 * Utilise le cache et se replie sur la config par défaut
 */
export async function getAIModel(endpoint: AIEndpoint): Promise<string> {
  const cacheKey = endpoint;
  const cached = configCache.get(cacheKey);
  
  // Vérifier le cache
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.modelName;
  }

  try {
    // Charger depuis la DB
    const config = await prisma.aIConfiguration.findUnique({
      where: { endpoint, isActive: true },
    });

    if (config) {
      // Valider que le modèle est autorisé
      const modelType = endpoint === 'images' || endpoint === 'palette' ? 'IMAGE' : 'TEXT';
      
      if (isModelAllowed(config.modelName, modelType)) {
        // Mettre en cache
        configCache.set(cacheKey, {
          modelName: config.modelName,
          timestamp: Date.now(),
        });
        return config.modelName;
      } else {
        console.warn(`Model ${config.modelName} not allowed for ${endpoint}, using default`);
      }
    }
  } catch (error) {
    console.error(`Error loading AI config for ${endpoint}:`, error);
  }

  // Fallback sur la config par défaut
  const defaultConfig = DEFAULT_AI_CONFIG[endpoint];
  return defaultConfig.modelName;
}

/**
 * Invalide le cache pour forcer le rechargement
 */
export function invalidateCache(endpoint?: AIEndpoint) {
  if (endpoint) {
    configCache.delete(endpoint);
  } else {
    configCache.clear();
  }
}

/**
 * Initialise la base de données avec les configurations par défaut
 */
export async function initializeDefaultConfigs() {
  try {
    for (const [endpoint, config] of Object.entries(DEFAULT_AI_CONFIG)) {
      const existing = await prisma.aIConfiguration.findUnique({
        where: { endpoint },
      });

      if (!existing) {
        await prisma.aIConfiguration.create({
          data: {
            endpoint,
            modelName: config.modelName,
            description: config.description,
            isActive: true,
          },
        });
        console.log(`✅ Initialized AI config for ${endpoint}`);
      }
    }
  } catch (error) {
    console.error('Error initializing AI configs:', error);
  }
}
