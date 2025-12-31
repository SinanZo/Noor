require('dotenv').config();
const mongoose = require('mongoose');
const OpenAI = require('openai');
const Hadith = require('../models/Hadith');
const HadithEmbedding = require('../models/HadithEmbedding');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const model = process.env.OPENAI_EMBEDDINGS_MODEL || 'text-embedding-3-large';

async function embedBatch(texts) {
  const response = await openai.embeddings.create({ model, input: texts });
  return response.data.map(item => item.embedding);
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');
  
  const cursor = Hadith.find().cursor();
  let batch = [];
  let processed = 0;
  
  for await (const hadith of cursor) {
    const text = `${hadith.ar || ''}\n${hadith.en || ''}`.trim();
    batch.push({
      refId: hadith.refId,
      collection: hadith.collection,
      book: hadith.book,
      number: hadith.number,
      text,
    });
    
    if (batch.length >= 50) {
      const embeddings = await embedBatch(batch.map(b => b.text));
      
      await Promise.all(batch.map((item, i) =>
        HadithEmbedding.findOneAndUpdate(
          { refId: item.refId },
          {
            $set: {
              collection: item.collection,
              book: item.book,
              number: item.number,
              text: item.text,
              embedding: embeddings[i],
            },
          },
          { upsert: true }
        )
      ));
      
      processed += batch.length;
      console.log(`✅ Processed ${processed} hadith embeddings`);
      batch = [];
    }
  }
  
  if (batch.length) {
    const embeddings = await embedBatch(batch.map(b => b.text));
    
    await Promise.all(batch.map((item, i) =>
      HadithEmbedding.findOneAndUpdate(
        { refId: item.refId },
        {
          $set: {
            collection: item.collection,
            book: item.book,
            number: item.number,
            text: item.text,
            embedding: embeddings[i],
          },
        },
        { upsert: true }
      )
    ));
    
    processed += batch.length;
    console.log(`✅ Processed remaining ${batch.length} hadith embeddings`);
  }
  
  console.log(`🎉 Total hadith embeddings created: ${processed}`);
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
