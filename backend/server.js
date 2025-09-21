// --- IMPORTS ---
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs').promises;
require('dotenv').config();
const { WebSocketServer } = require('ws');

const { DocumentProcessorServiceClient } = require('@google-cloud/documentai').v1;
const { VertexAI } = require('@google-cloud/vertexai');
const { Storage } = require('@google-cloud/storage');

// --- INITIALIZATION ---
const app = express();
const port = process.env.PORT || 8000;

// Initialize Google Cloud clients with error handling
let docAIClient, vertexAI, storage;
try {
  docAIClient = new DocumentProcessorServiceClient();
  vertexAI = new VertexAI({
    project: process.env.GOOGLE_CLOUD_PROJECT,
    location: process.env.VERTEX_AI_LOCATION
  });
  storage = new Storage();
  console.log('✅ Google Cloud clients initialized.');
} catch (error) {
  console.error('❌ Failed to initialize Google Cloud clients:', error.message);
}

// In-Memory Vector Store for RAG demonstration
let documentVectorStore = [];
console.log("In-memory vector store initialized.");

// --- MIDDLEWARE ---
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());
const upload = multer({ dest: 'uploads/' });

// --- HELPER FUNCTIONS for RAG ---
const chunkText = (text, chunkSize = 1000, overlap = 100) => {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize - overlap) {
        chunks.push(text.substring(i, i + chunkSize));
    }
    return chunks;
};

const cosineSimilarity = (vecA, vecB) => {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    return dotProduct / (magnitudeA * magnitudeB);
};

// Auto-create bucket if it doesn't exist
const ensureBucketExists = async () => {
  const bucketName = process.env.STORAGE_BUCKET_NAME;
  if (!bucketName) {
    console.error('❌ STORAGE_BUCKET_NAME not set in .env');
    return false;
  }
  try {
    const [exists] = await storage.bucket(bucketName).exists();
    if (!exists) {
      await storage.createBucket(bucketName, { location: 'US' });
      console.log(`✅ Bucket ${bucketName} created.`);
    } else {
      console.log(`✅ Bucket ${bucketName} already exists.`);
    }
    return true;
  } catch (error) {
    console.error(`❌ Failed to create/access bucket ${bucketName}:`, error.message);
    return false;
  }
};

// --- API ROUTES ---
app.get('/', (req, res) => res.send('Legal AI Backend is running!'));

app.post('/api/analyze-document', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded.' });
    }

    const filePath = req.file.path;
    let bucketOk = false;
    try {
      bucketOk = await ensureBucketExists();
      if (!bucketOk) {
        throw new Error('Failed to access storage bucket');
      }

      const destination = `uploads/${Date.now()}-${req.file.originalname}`;
      await storage.bucket(process.env.STORAGE_BUCKET_NAME).upload(filePath, { destination });
      console.log(`File uploaded to GCS: ${destination}`);

      const file = await fs.readFile(filePath);
      const encodedFile = Buffer.from(file).toString('base64');
      const docAiName = `projects/${process.env.GOOGLE_CLOUD_PROJECT}/locations/${process.env.DOCUMENT_AI_LOCATION}/processors/${process.env.DOCUMENT_AI_PROCESSOR_ID}`;
      console.log(`Processing with Document AI: ${docAiName}`);

      const [docAiResult] = await docAIClient.processDocument({
        name: docAiName,
        rawDocument: { content: encodedFile, mimeType: req.file.mimetype }
      });
      const { text } = docAiResult.document;
      console.log('✅ Text extracted via Document AI.');

      const generativeModel = vertexAI.getGenerativeModel({
        model: 'text-bison@002',
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.1,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
        ]
      });
      
      // --- SIMPLIFIED PROMPT ---
      // This prompt only asks for the data your original App.js uses.
      const analysisPrompt = `
          You are an expert AI legal assistant. Analyze the following legal document text.
          Provide a response in a valid JSON format with three keys: "summary", "keyClauses", and "potentialRisks".
          - "summary": (string) A concise, one-paragraph executive summary.
          - "keyClauses": (string) A single string containing a bulleted list (using markdown '-') of the 5-7 most important clauses.
          - "potentialRisks": (string) A single string containing a bulleted list (using markdown '-') of 3-5 potential risks or areas that require attention.

          Document Text: """ ${text.substring(0, 30000)} """
      `;
      console.log('Sending extracted text to Vertex AI for generative analysis...');
      const analysisResult = await generativeModel.generateContent(analysisPrompt);
      const analysisResponse = await analysisResult.response;
      let analysisJsonText = analysisResponse.candidates[0].content.parts[0].text.replace(/```json/g, '').replace(/```/g, '').trim();

      let generativeAnalysis;
      try {
        generativeAnalysis = JSON.parse(analysisJsonText);
      } catch (jsonError) {
        console.error('❌ Invalid JSON from Vertex AI:', jsonError.message);
        throw new Error('Failed to parse AI-generated JSON response');
      }
      console.log('✅ Generative analysis complete.');

      const embeddingModel = vertexAI.getGenerativeModel({ model: 'text-embedding-004' });
      const textChunks = chunkText(text);
      console.log(`Generating embeddings for ${textChunks.length} text chunks...`);

      const embeddings = [];
      for (const chunk of textChunks) {
        const result = await embeddingModel.embedContent({
            content: { parts: [{ text: chunk }] },
        });
        embeddings.push(result.embedding.values);
      }

      const newEmbeddings = embeddings.map((embedding, i) => ({
          documentName: req.file.originalname,
          chunkText: textChunks[i],
          vector: embedding,
      }));

      documentVectorStore.push(...newEmbeddings);
      console.log(`Added ${newEmbeddings.length} new vectors. Total vectors in store: ${documentVectorStore.length}`);

      res.json({
          success: true,
          generativeAnalysis: generativeAnalysis,
      });

    } catch (error) {
        console.error('❌ Error during document processing:', error.message, error.stack);
        res.status(500).json({ success: false, error: `Failed to process document: ${error.message}` });
    } finally {
        if (filePath) {
            try {
                await fs.unlink(filePath);
            } catch (unlinkErr) {
                console.error("Error deleting temp file:", unlinkErr);
            }
        }
    }
});

app.post('/api/legal-search', async (req, res) => {
    const { query } = req.body;
    if (!query) {
        return res.status(400).json({ success: false, error: 'Search query is required.' });
    }
    if (documentVectorStore.length === 0) {
        return res.status(400).json({ success: false, error: 'No documents analyzed. Please upload a document first.' });
    }

    try {
        const embeddingModel = vertexAI.getGenerativeModel({ model: 'text-embedding-004' });
        const resultQuery = await embeddingModel.embedContent({
            content: { parts: [{ text: query }] },
        });
        const queryEmbedding = resultQuery.embedding.values;
        console.log('✅ Generated embedding for search query.');

        const similarities = documentVectorStore.map(doc => ({
            ...doc,
            similarity: cosineSimilarity(queryEmbedding, doc.vector)
        }));
        similarities.sort((a, b) => b.similarity - a.similarity);
        const relevantChunks = similarities.slice(0, 3);
        console.log(`Found ${relevantChunks.length} relevant chunks.`);

        const context = relevantChunks.map(chunk => `Source: ${chunk.documentName}\nContent: ${chunk.chunkText}`).join('\n\n---\n\n');

        const generativeModel = vertexAI.getGenerativeModel({
          model: 'text-bison@002',
          generationConfig: {
            maxOutputTokens: 1024,
            temperature: 0.1,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
          ]
        });

        const ragPrompt = `
            You are an AI legal assistant. Answer the user's question based *only* on the provided context.
            If the context doesn't contain the answer, state that the information is not in the provided documents.
            Cite the source document for your answer.

            CONTEXT: """ ${context} """
            USER'S QUESTION: "${query}"
        `;
        const result = await generativeModel.generateContent(ragPrompt);
        const response = await result.response;
        const text = response.candidates[0].content.parts[0].text;
        console.log('✅ RAG response generated successfully.');

        res.json({ success: true, results: text, sources: relevantChunks });

    } catch (error) {
        console.error('❌ Error in Vertex AI RAG search:', error.message, error.stack);
        res.status(500).json({ success: false, error: `Failed to perform legal search: ${error.message}` });
    }
});

app.get('/api/legal-news', async (req, res) => {
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
    const query = "legal technology law";

    if (!apiKey || !searchEngineId) {
        return res.status(500).json({ success: false, error: 'Google Search API is not configured.' });
    }

    try {
        const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}`;
        
        console.log('Fetching legal news from Google...');
        const response = await fetch(searchUrl);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Google Search API failed with status ${response.status}: ${errorData.error.message}`);
        }
        
        const searchData = await response.json();
        if (!searchData.items) {
             console.log('✅ Google API returned no news items for the query.');
             return res.json({ success: true, articles: [] });
        }
        console.log('✅ Successfully fetched news from Google.');

        const articles = searchData.items.map((item, index) => ({
            id: item.cacheId || index, 
            title: item.title,
            description: item.snippet,
            url: item.link,
            source: item.displayLink, 
            author: item.displayLink,
            urlToImage: item.pagemap?.cse_image?.[0]?.src || 'https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=2069&auto=format&fit=crop',
            publishedAt: new Date().toISOString(),
            category: 'Legal Tech',
            featured: index === 0, 
            readTime: Math.ceil(item.snippet.length / 500), 
            tags: ['legal', 'technology', 'law'] 
        }));

        res.json({ success: true, articles: articles });

    } catch (error) {
        console.error('❌ Error fetching legal news from Google:', error.message);
        res.status(500).json({ success: false, error: `Failed to fetch legal news: ${error.message}` });
    }
});


// --- START SERVER and WEBSOCKET---
const server = app.listen(port, () => {
  console.log(`✅ Server listening at http://localhost:${port}`);
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    console.log('✅ WebSocket client connected');
    ws.on('close', () => {
        console.log('WebSocket client disconnected');
    });
    ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error.message);
    });
});