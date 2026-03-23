/**
 * Service de logging pour les requêtes AI
 * Enregistre toutes les requêtes vers les APIs AI pour monitoring et debug
 */

import { prisma } from './prisma';

type LogData = {
  endpoint: string;
  modelUsed: string;
  inputData: any;
  prompt?: string;
  response?: any;
  status: 'success' | 'error';
  errorMessage?: string;
  duration?: number;
};

/**
 * Enregistre une requête AI dans la base de données
 */
export async function logAIRequest(data: LogData): Promise<void> {
  try {
    await prisma.aIRequestLog.create({
      data: {
        endpoint: data.endpoint,
        modelUsed: data.modelUsed,
        inputData: JSON.stringify(data.inputData),
        prompt: data.prompt ? truncate(data.prompt, 10000) : null,
        response: data.response ? truncate(JSON.stringify(data.response), 10000) : null,
        status: data.status,
        errorMessage: data.errorMessage || null,
        duration: data.duration || null,
      },
    });
  } catch (error) {
    // Ne pas bloquer si le logging échoue
    console.error('Failed to log AI request:', error);
  }
}

/**
 * Wrapper pour exécuter une fonction AI avec logging automatique
 */
export async function withAILogging<T>(
  endpoint: string,
  modelUsed: string,
  inputData: any,
  prompt: string,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  
  try {
    const response = await fn();
    const duration = Date.now() - startTime;
    
    // Logger le succès (async, non bloquant)
    logAIRequest({
      endpoint,
      modelUsed,
      inputData,
      prompt,
      response,
      status: 'success',
      duration,
    });
    
    return response;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    // Logger l'erreur (async, non bloquant)
    logAIRequest({
      endpoint,
      modelUsed,
      inputData,
      prompt,
      status: 'error',
      errorMessage: error.message || 'Unknown error',
      duration,
    });
    
    throw error;
  }
}

/**
 * Tronque une chaîne pour éviter les logs trop lourds
 */
function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '... [truncated]';
}
