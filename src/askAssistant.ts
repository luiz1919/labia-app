// Sends a request to the user's chosen AI and returns the JSON object it answered with.
import { activeAi, AiError, askAi, parseJsonObject } from 'firebase-app-kit/ai'
import type { AiEffort, AiSettings, AskInput } from 'firebase-app-kit/ai'

export const NO_AI_MESSAGE = 'Para usar esto, configura una IA en Ajustes (Gemini tiene un nivel gratuito).'

export async function askJson(settings: AiSettings, input: AskInput, effort?: AiEffort): Promise<Record<string, unknown>> {
  const ai = activeAi(settings)
  if (!ai) throw new Error(NO_AI_MESSAGE)
  const result = await askAi(ai.provider, input, { apiKey: ai.apiKey, model: ai.model, fallback: settings.anthropicFallback, effort })
  return parseJsonObject(result.text)
}

export function errorMessage(error: unknown): string {
  if (error instanceof AiError || error instanceof Error) return error.message
  return 'Algo ha fallado. Inténtalo de nuevo.'
}
