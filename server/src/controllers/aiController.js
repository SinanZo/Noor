const QuranEmbedding = require('../models/QuranEmbedding');
const HadithEmbedding = require('../models/HadithEmbedding');
const { OpenAI } = require('openai');

// Initialize OpenAI client
let openai;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
} catch (error) {
  console.error('OpenAI initialization failed:', error.message);
}

async function embedQuery(text) {
  const model = process.env.OPENAI_EMBEDDINGS_MODEL || 'text-embedding-3-large';
  const response = await openai.embeddings.create({
    model,
    input: text,
  });
  return response.data[0].embedding;
}

/**
 * @desc    Ask AI a question about Islam with Quran and Hadith references
 * @route   POST /api/ai/ask
 * @access  Public
 */
exports.askAI = async (req, res) => {
  try {
    const q = String(req.body.q || '').trim();
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Empty question'
      });
    }

    // Check if OpenAI is configured
    if (!openai) {
      return res.status(503).json({
        success: false,
        error: 'AI service not configured',
        mock: true,
        answer: `Mock response: Your question "${q}" has been received. To enable AI responses with Quran and Hadith RAG, please configure OPENAI_API_KEY in your environment variables.`,
        quranRefs: [],
        hadithRefs: []
      });
    }

    // Generate embedding for question
    const queryVector = await embedQuery(q);
    
    // Search Quran embeddings
    let quranResults = [];
    try {
      quranResults = await QuranEmbedding.aggregate([
        {
          $vectorSearch: {
            index: 'quran_embeddings_index',
            path: 'embedding',
            queryVector: queryVector,
            numCandidates: 200,
            limit: 6,
          },
        },
        {
          $project: {
            surah: 1,
            ayah: 1,
            text: 1,
            score: { $meta: 'vectorSearchScore' },
          },
        },
      ]);
    } catch (vectorErr) {
      console.warn('Quran vector search failed, falling back to empty results:', vectorErr.message);
    }
    
    // Search Hadith embeddings
    let hadithResults = [];
    try {
      hadithResults = await HadithEmbedding.aggregate([
        {
          $vectorSearch: {
            index: 'hadith_embeddings_index',
            path: 'embedding',
            queryVector: queryVector,
            numCandidates: 200,
            limit: 6,
          },
        },
        {
          $project: {
            refId: 1,
            collection: 1,
            book: 1,
            number: 1,
            text: 1,
            score: { $meta: 'vectorSearchScore' },
          },
        },
      ]);
    } catch (vectorErr) {
      console.warn('Hadith vector search failed, falling back to empty results:', vectorErr.message);
    }
    
    // Build context
    const contextQuran = quranResults
      .map(r => `QURAN (${r.surah}:${r.ayah}) ${r.text}`)
      .join('\n\n');
    
    const contextHadith = hadithResults
      .map(r => `HADITH [${r.collection} ${r.book}:${r.number}] ${r.text}`)
      .join('\n\n');
    
    // System prompt
    const systemPrompt = `You are an Islamic assistant. Base answers ONLY on the provided Quran ayat and authentic hadith excerpts.
- Always cite sources inline: (2:255) for Quran, and [Bukhari 1:2] for hadith.
- If the question requires scholarly judgement, say: "Consult a qualified scholar."
- Answer briefly and clearly in the user's language (Arabic if Arabic input detected).
- Distinguish between facts from sources and scholarly opinions.`;
    
    // User prompt with context
    const userContent = `Question:\n${q}\n\nQuran passages:\n${contextQuran || 'None'}\n\nHadith passages:\n${contextHadith || 'None'}\n\nCompose a concise answer with citations.`;
    
    // Call OpenAI API
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      temperature: 0.2,
      max_tokens: 1000,
    });
    
    const answer = completion.choices[0]?.message?.content || 'No response generated.';
    
    res.json({
      success: true,
      answer,
      quranRefs: quranResults.map(r => ({
        surah: r.surah,
        ayah: r.ayah,
        score: r.score,
      })),
      hadithRefs: hadithResults.map(r => ({
        refId: r.refId,
        collection: r.collection,
        book: r.book,
        number: r.number,
        score: r.score,
      })),
      model
    });

  } catch (error) {
    console.error('AI ask error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process AI request',
      message: error.message
    });
  }
};

module.exports = exports;
