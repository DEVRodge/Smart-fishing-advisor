// Helper functions to safely access environment variables
export function getDeepSeekApiKey(): string {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is not defined. Please set it in your .env.local file or environment variables.")
  }
  return apiKey
}

// Optional: If you want to use OpenAI as a fallback
export function getOpenAIApiKey(): string | null {
  return process.env.OPENAI_API_KEY || null
}

// Check if we're in development mode
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development"
}

