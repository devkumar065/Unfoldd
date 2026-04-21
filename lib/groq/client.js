import Groq from 'groq-sdk'
import { getGroqKey, getGroqModel } from '@/lib/admin/settings'

// Model selection based on task type
export const GROQ_MODELS = {
  // Best for complex reasoning (roadmap, analysis)
  SMART: 'llama-3.3-70b-versatile',
  
  // Best for fast generation (questions, missions)
  FAST: 'llama-3.1-8b-instant',
  
  // Best for code-related questions
  CODE: 'llama3-70b-8192',
  
  // Fallback model
  FALLBACK: 'gemma2-9b-it'
}

// Core completion function
export async function groqComplete({
  prompt,
  modelType = 'smart',  // 'smart' | 'fast' | 'code'
  model = null,         // override if provided
  maxTokens = 2000,
  temperature = 0.7,
  systemPrompt = null
}) {
  try {
    // Get key and model dynamically from DB
    const apiKey = await getGroqKey()
    const selectedModel = model || await getGroqModel(modelType)

    if (!apiKey) {
      throw new Error('Groq API key not configured. Add it in Admin → Integrations')
    }

    const groq = new Groq({ apiKey })
    
    const messages = []
    
    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt
      })
    }
    
    messages.push({
      role: 'user',
      content: prompt
    })

    const completion = await groq.chat.completions
      .create({
        messages,
        model: selectedModel,
        max_tokens: maxTokens,
        temperature,
        // Force JSON response for structured data
        response_format: { type: 'json_object' }
      })

    const content = completion.choices[0]
      ?.message?.content

    if (!content) {
      throw new Error('Empty response from Groq')
    }

    // Parse JSON response
    try {
      return JSON.parse(content)
    } catch(e) {
      // Try to extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      throw new Error('Failed to parse Groq response')
    }

  } catch(error) {
    console.error('Groq API error:', error)
    
    // Try fallback model on failure (only if it wasn't already a fallback attempt)
    if (model !== GROQ_MODELS.FALLBACK) {
      console.log('Trying fallback model...')
      return groqComplete({
        prompt,
        model: GROQ_MODELS.FALLBACK,
        maxTokens,
        temperature,
        systemPrompt
      })
    }
    
    throw error
  }
}

// Health check
export async function checkGroqConnection() {
  try {
    const result = await groqComplete({
      prompt: 'Say {"status": "ok"}',
      modelType: 'fast',
      maxTokens: 10
    })
    return result.status === 'ok'
  } catch(e) {
    return false
  }
}
