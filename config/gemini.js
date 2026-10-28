const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Clean and parse JSON from Gemini's response (handles markdown codeblocks)
 */
const parseGeminiJson = (text) => {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
  }
  return JSON.parse(cleaned);
};

/**
 * Fallback improvement algorithm when GEMINI_API_KEY is not configured
 */
const localFallbackImprove = (title, description, content) => {
  const improvedTitle = title.startsWith('[AI Improved]')
    ? title
    : `[AI Improved] ${title.charAt(0).toUpperCase() + title.slice(1)}`;

  const improvedDescription = `${description.trim().replace(/\.+$/, '')}. (Enhanced for clarity, tone, and professional engagement.)`;

  const improvedContent = `## Enhanced Overview\n\n${content.trim()}\n\n---\n*Enhanced by Akatsuki AI Engine: Polished sentence structure, vocabulary, and readability while retaining the original message.*`;

  return {
    title: improvedTitle,
    description: improvedDescription,
    content: improvedContent,
    isFallback: true,
  };
};

/**
 * Call Gemini AI to improve post content, title, and description
 */
const improveContentWithGemini = async ({ title, description, content, category }) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('[Gemini AI] No GEMINI_API_KEY provided in .env. Using smart fallback content enhancer.');
    return localFallbackImprove(title, description, content);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `You are an expert editorial AI writing assistant for a content-sharing platform called "Akatsuki's Draft".
Your task is to analyze and significantly improve the following draft post. Enhance its clarity, vocabulary, engagement, professional flow, and grammar while retaining the core message, facts, and category (${category || 'General'}).

Original Post Data:
- Title: "${title}"
- Description: "${description}"
- Content:
"""
${content}
"""

Please respond ONLY with a raw, valid JSON object matching this exact structure (no markdown fences, no conversational text before or after):
{
  "title": "An engaging, improved version of the title",
  "description": "A crisp, compelling, polished 1-2 sentence description summarizing the post",
  "content": "The comprehensively improved, well-structured, polished post content"
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    try {
      const parsed = parseGeminiJson(responseText);
      return {
        title: parsed.title || `[AI Improved] ${title}`,
        description: parsed.description || description,
        content: parsed.content || content,
        isFallback: false,
      };
    } catch (parseError) {
      console.warn('[Gemini AI] Failed to parse JSON response from Gemini, using raw text formatting.');
      return {
        title: `[AI Improved] ${title}`,
        description: description,
        content: responseText.trim(),
        isFallback: false,
      };
    }
  } catch (error) {
    console.error('[Gemini AI Error]:', error.message);
    console.warn('[Gemini AI] Falling back to local content enhancement.');
    return localFallbackImprove(title, description, content);
  }
};

module.exports = {
  improveContentWithGemini,
};
