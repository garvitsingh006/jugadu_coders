const axios = require('axios');

class LyzrAiService {
  constructor() {
    this.apiKey = process.env.LYZR_API_KEY;
    this.agentId = process.env.LYZR_AGENT_ID;
    this.baseUrl = 'https://agent-prod.studio.lyzr.ai/v3/inference/chat/';
    
    if (!this.apiKey || !this.agentId) {
      console.error('Lyzr AI credentials not found in environment variables');
    }
  }

  async generateKeywords(searchQuery, userId = 'system') {
    if (!this.apiKey || !this.agentId) {
      console.warn('Lyzr AI not configured, using fallback keywords');
      return [searchQuery.toLowerCase()];
    }

    try {
      console.log('Generating keywords for:', searchQuery);
      const response = await axios.post(this.baseUrl, {
        user_id: userId,
        agent_id: this.agentId,
        session_id: `${this.agentId}-keywords-${Date.now()}`,
        message: `Generate keywords for: ${searchQuery}`
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        },
        timeout: 10000
      });

      const keywords = response.data.response || searchQuery;
      const keywordArray = keywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k.length > 0);
      console.log('Generated keywords:', keywordArray);
      return keywordArray;
    } catch (error) {
      console.error('AI keyword generation failed:', error.response?.data || error.message);
      return [searchQuery.toLowerCase()];
    }
  }

  async generateIcebreaker(communityTags, userId = 'system') {
    if (!this.apiKey || !this.agentId) {
      return "What's everyone working on today? 🚀";
    }

    try {
      const tagsText = communityTags.join(', ');
      console.log('Generating icebreaker for tags:', tagsText);
      
      const response = await axios.post(this.baseUrl, {
        user_id: userId,
        agent_id: this.agentId,
        session_id: `${this.agentId}-icebreaker-${Date.now()}`,
        message: `Generate an icebreaker for community with tags: ${tagsText}`
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        },
        timeout: 8000
      });

      const icebreaker = response.data.response || "What's everyone working on today? 🚀";
      console.log('Generated icebreaker:', icebreaker);
      return icebreaker;
    } catch (error) {
      console.error('AI icebreaker generation failed:', error.response?.data || error.message);
      return "What's everyone working on today? 🚀";
    }
  }
}

module.exports = new LyzrAiService();