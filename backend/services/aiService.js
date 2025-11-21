const axios = require('axios');
const Community = require('../models/Community');
const Fuse = require('fuse.js');

// Generate embedding using OpenAI
async function generateEmbedding(text) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/embeddings',
      {
        model: 'text-embedding-ada-002',
        input: text
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.data[0].embedding;
  } catch (error) {
    console.error('OpenAI embedding error:', error.response?.data || error.message);
    return null;
  }
}

// Calculate cosine similarity
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Search communities with AI
async function searchCommunities(query, mode = 'global', userLocation = null, userId) {
  try {
    let communities = [];

    // Step 1: Get base communities based on mode
    if (mode === 'local' && userLocation) {
      communities = await Community.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [userLocation.lng, userLocation.lat]
            },
            $maxDistance: 10000 // 10km
          }
        }
      }).limit(100);
    } else {
      communities = await Community.find().limit(100);
    }

    // Step 2: Keyword match
    const keywordMatches = communities.filter(c => 
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.tags.some(tag => tag.includes(query.toLowerCase())) ||
      c.description.toLowerCase().includes(query.toLowerCase())
    );

    // Step 3: Fuzzy match
    const fuse = new Fuse(communities, {
      keys: ['name', 'tags', 'description'],
      threshold: 0.4
    });
    const fuzzyMatches = fuse.search(query);

    // Step 4: Semantic match
    const queryEmbedding = await generateEmbedding(query);
    const semanticScores = communities.map(c => ({
      community: c,
      similarity: queryEmbedding && c.embedding.length > 0 
        ? cosineSimilarity(queryEmbedding, c.embedding)
        : 0
    }));

    // Step 5: Combine scores
    const scoredCommunities = communities.map(community => {
      const keywordScore = keywordMatches.includes(community) ? 1 : 0;
      const fuzzyScore = fuzzyMatches.find(m => m.item._id.equals(community._id)) ? 0.8 : 0;
      const semanticScore = semanticScores.find(s => s.community._id.equals(community._id))?.similarity || 0;
      const activityScore = community.activityScore / 100;
      const proximityScore = mode === 'local' ? 0.5 : 0;

      const totalScore = 
        0.6 * keywordScore +
        0.25 * fuzzyScore +
        0.45 * semanticScore +
        0.1 * activityScore +
        0.05 * proximityScore;

      return {
        community,
        score: totalScore
      };
    });

    // Sort by score
    scoredCommunities.sort((a, b) => b.score - a.score);

    // Threshold check
    const bestMatch = scoredCommunities[0];
    if (bestMatch && bestMatch.score >= 0.6) {
      return {
        found: true,
        communities: scoredCommunities.slice(0, 10).map(s => s.community),
        suggestion: null
      };
    } else {
      // Generate AI suggestion
      const suggestion = await generateCommunityName(query);
      return {
        found: false,
        communities: scoredCommunities.slice(0, 5).map(s => s.community),
        suggestion
      };
    }
  } catch (error) {
    console.error('Search communities error:', error);
    throw error;
  }
}

// Generate community embedding
async function generateCommunityEmbedding(name, tags, description) {
  const text = `${name} ${tags.join(' ')} ${description}`;
  return await generateEmbedding(text);
}

// Generate community name using AI
async function generateCommunityName(query, existingTags = []) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a creative community name generator. Generate a catchy, relevant community name, 3-5 relevant tags, and a brief description based on user query.'
          },
          {
            role: 'user',
            content: `Generate a community for: "${query}". Return JSON with: name, tags (array), description.`
          }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      name: query,
      tags: existingTags,
      description: `A community for ${query}`
    };
  } catch (error) {
    console.error('Generate community name error:', error);
    return {
      name: query,
      tags: existingTags,
      description: `A community for ${query}`
    };
  }
}

module.exports = {
  generateEmbedding,
  searchCommunities,
  generateCommunityEmbedding,
  generateCommunityName
};
