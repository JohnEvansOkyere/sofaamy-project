// DEMO ONLY: OpenAI API is called directly from the frontend.
// Before production, move this to a backend to keep the API key secure.

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

function getApiKey() {
  return import.meta.env.VITE_OPENAI_API_KEY?.trim() || '';
}

export function hasOpenAIKey() {
  return !!getApiKey();
}

/**
 * Call OpenAI Chat Completions and return parsed JSON from the first message.
 * Expects the model to return ONLY valid JSON (no markdown).
 */
async function chatWithJSON(systemPrompt, userContent) {
  const key = getApiKey();
  if (!key) {
    throw new Error('API key not configured');
  }

  const res = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `OpenAI API error: ${res.status}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('Empty response from OpenAI');

  // Strip markdown code block if present
  let raw = content;
  const codeMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeMatch) raw = codeMatch[1].trim();
  return JSON.parse(raw);
}

/**
 * Glass Advisor: get product recommendation based on project type, location, and concerns.
 */
export async function getGlassRecommendation(projectType, location, concerns) {
  const systemPrompt = `You are a glass and aluminium product expert for Sofaamy Co. Ltd. in Ghana.
Based on the project details provided, recommend the best glass type and aluminium profile.
Be specific and practical. Structure your response as JSON:
{
  "primaryRecommendation": {
    "product": "string",
    "thickness": "string",
    "reason": "string (2-3 sentences, practical, Ghana-specific context)"
  },
  "alternativeRecommendation": {
    "product": "string",
    "thickness": "string",
    "reason": "string"
  },
  "profileRecommendation": {
    "product": "string",
    "reason": "string"
  },
  "importantNote": "string (one practical installation or maintenance tip specific to Ghana climate/context)"
}
Return ONLY valid JSON.`;

  const userContent = `Project type: ${projectType}\nLocation/environment: ${location}\nPrimary concerns: ${concerns}`;
  return chatWithJSON(systemPrompt, userContent);
}

/**
 * Material Estimator: parse free-text project description into structured JSON.
 */
export async function parseProjectDescription(description) {
  const systemPrompt = `You are a materials parsing assistant for Sofaamy Co. Ltd., a glass and aluminium supplier in Ghana.
Parse the contractor's project description and return ONLY this JSON:
{
  "projectType": "one of [Shopfront, Windows, Partition, Balustrade, Security Door, Curtain Wall, Shower Enclosure]",
  "quantity": number,
  "width": number (meters),
  "height": number (meters),
  "glassType": "one of [Clear Float, Tempered, Frosted, Tinted, Laminated, Reflective]",
  "glassThickness": "one of [4mm, 6mm, 8mm, 10mm, 12mm]",
  "profileType": "one of [None, Standard Window Frame, Curtain Wall Profile, Casement Frame, Sliding Door Track] or null",
  "includeAlucobond": boolean,
  "alucobondArea": number or null,
  "includeSecurityDoor": boolean,
  "securityDoorQuantity": number or null
}
Return ONLY valid JSON, no markdown.`;

  return chatWithJSON(systemPrompt, description);
}
