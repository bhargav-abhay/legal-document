class APIService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    this.timeout = 30000; // 30 seconds
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      timeout: this.timeout,
      ...options,
    };

    // Add timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), this.timeout);
    });

    try {
      const fetchPromise = fetch(url, config);
      const response = await Promise.race([fetchPromise, timeoutPromise]);

      if (!response.ok) {
        const text = await response.text(); // Get raw response
        let errorData = {};
        try {
          errorData = JSON.parse(text) || {};
        } catch {
          errorData = { message: text || `HTTP ${response.status}: ${response.statusText}` };
        }
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        throw new Error('Invalid JSON response from server');
      }
      return data;
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network connection error. Please check your internet connection.');
      }
      if (error.message.includes('timeout')) {
        throw new Error('Request timed out. Please try again.');
      }
      if (error.message.includes('Invalid JSON')) {
        throw new Error('Server returned invalid data. Please try again later.');
      }
      throw error;
    }
  }

  // Authentication endpoints (unchanged)
  async authenticateGoogle(token) {
    return this.request('/api/v1/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async authenticateEmail(email, password) {
    return this.request('/api/v1/auth/email', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async registerUser(userData) {
    return this.request('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async refreshToken(refreshToken) {
    return this.request('/api/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  // Document Analysis endpoints (updated)
  async analyzeDocument(file, token, options = {}) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('analysis_type', options.analysisType || 'comprehensive');
    formData.append('include_visualizations', options.includeVisualizations || 'true');
    formData.append('confidence_threshold', options.confidenceThreshold || '0.7');

    if (options.language) {
      formData.append('language', options.language);
    }

    const response = await this.request('/api/v1/documents/analyze', {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
      body: formData,
    });

    // Fallback for malformed response
    if (!response.generativeAnalysis) {
      return {
        success: false,
        error: 'Analysis data unavailable due to server error',
        fallback: {
          summary: 'Analysis summary unavailable due to processing error.',
          keyInsights: [],
          riskFactors: [],
        },
      };
    }

    return response;
  }

  async getDocumentHistory(token, limit = 10) {
    return this.request(`/api/v1/documents/history?limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async deleteDocument(documentId, token) {
    return this.request(`/api/v1/documents/${documentId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async exportAnalysis(documentId, format, token) {
    return this.request(`/api/v1/documents/${documentId}/export?format=${format}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // AI Chat endpoints (unchanged)
  async submitQuery(query, context, domain, token, options = {}) {
    return this.request('/api/v1/ai/query', {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
      body: JSON.stringify({
        query,
        context,
        domain,
        include_sources: options.includeSources || true,
        confidence_threshold: options.confidenceThreshold || 0.7,
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7,
      }),
    });
  }

  async getChatHistory(token, limit = 50) {
    return this.request(`/api/v1/ai/history?limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async saveChatSession(sessionData, token) {
    return this.request('/api/v1/ai/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(sessionData),
    });
  }

  // Legal Search endpoints (unchanged)
  async searchLegal(query, filters = {}, token) {
    const searchParams = new URLSearchParams({
      q: query,
      jurisdiction: filters.jurisdiction || 'all',
      docType: filters.docType || 'all',
      dateRange: filters.dateRange || 'all',
      sortBy: filters.sortBy || 'relevance',
      limit: filters.limit || 20,
    });

    return this.request(`/api/v1/search/legal?${searchParams}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    });
  }

  async searchCaseLaw(query, jurisdiction, token) {
    return this.request('/api/v1/search/cases', {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
      body: JSON.stringify({ query, jurisdiction }),
    });
  }

  async searchStatutes(query, jurisdiction, token) {
    return this.request('/api/v1/search/statutes', {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
      body: JSON.stringify({ query, jurisdiction }),
    });
  }

  // News endpoints (unchanged)
  async getLegalNews(category = 'all', limit = 10) {
    return this.request(`/api/v1/news/legal?category=${category}&limit=${limit}`);
  }

  async getNewsById(newsId) {
    return this.request(`/api/v1/news/${newsId}`);
  }

  async searchNews(query, filters = {}) {
    const searchParams = new URLSearchParams({
      q: query,
      category: filters.category || 'all',
      dateRange: filters.dateRange || '30d',
      limit: filters.limit || 20,
    });

    return this.request(`/api/v1/news/search?${searchParams}`);
  }

  // User Management endpoints (unchanged)
  async getUserProfile(token) {
    return this.request('/api/v1/user/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async updateUserProfile(profileData, token) {
    return this.request('/api/v1/user/profile', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
  }

  async getUserPreferences(token) {
    return this.request('/api/v1/user/preferences', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async updateUserPreferences(preferences, token) {
    return this.request('/api/v1/user/preferences', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(preferences),
    });
  }

  async deleteUser(token) {
    return this.request('/api/v1/user/account', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Analytics endpoints (unchanged)
  async getAnalytics(token, timeRange = '30d') {
    return this.request(`/api/v1/analytics/dashboard?timeRange=${timeRange}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getUserStats(token) {
    return this.request('/api/v1/analytics/user/stats', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async trackEvent(eventData, token) {
    return this.request('/api/v1/analytics/events', {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
      body: JSON.stringify(eventData),
    });
  }

  // Legal Domains endpoints (unchanged)
  async getLegalDomains() {
    return this.request('/api/v1/legal/domains');
  }

  async getDomainInfo(domainId) {
    return this.request(`/api/v1/legal/domains/${domainId}`);
  }

  // Feedback endpoints (unchanged)
  async submitFeedback(feedback, token) {
    return this.request('/api/v1/feedback', {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
      body: JSON.stringify({
        ...feedback,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      }),
    });
  }

  async getFeedbackHistory(token) {
    return this.request('/api/v1/feedback/history', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // System endpoints (unchanged)
  async getSystemHealth() {
    return this.request('/api/v1/system/health');
  }

  async getSystemStatus() {
    return this.request('/api/v1/system/status');
  }

  // Utility methods (updated uploadFile with progress)
  async uploadFile(file, endpoint, token, onProgress) {
    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener('load', () => {
        try {
          const response = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(response);
          } else {
            reject(new Error(response.message || `Upload failed with status ${xhr.status}`));
          }
        } catch (error) {
          reject(new Error('Invalid response from server'));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during file upload'));
      });

      xhr.addEventListener('timeout', () => {
        reject(new Error('File upload timed out'));
      });

      xhr.open('POST', `${this.baseURL}${endpoint}`);
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      xhr.timeout = 60000; // 60 seconds for file uploads
      xhr.send(formData);
    });
  }

  // Batch operations (unchanged)
  async batchAnalyzeDocuments(files, token, onProgress) {
    const results = [];
    const total = files.length;

    for (let i = 0; i < files.length; i++) {
      try {
        const result = await this.analyzeDocument(files[i], token);
        results.push({ file: files[i], result, success: true });

        if (onProgress) {
          onProgress((i + 1) / total * 100, i + 1, total);
        }
      } catch (error) {
        results.push({ file: files[i], error, success: false });
      }
    }

    return results;
  }

  // Cache management (unchanged)
  async clearCache(token) {
    return this.request('/api/v1/cache/clear', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Export utilities (unchanged)
  async exportUserData(token, format = 'json') {
    const response = await fetch(`${this.baseURL}/api/v1/user/export?format=${format}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  }

  // Real-time data (add WebSocket support)
  async getRealTimeData() {
    return this.request('/api/v1/realtime/data');
  }

  connectWebSocket(onMessage) {
    const ws = new WebSocket(`${this.baseURL.replace('http', 'ws')}/ws`);
    ws.onopen = () => console.log('WebSocket connected');
    ws.onmessage = (event) => onMessage(JSON.parse(event.data));
    ws.onclose = () => console.log('WebSocket disconnected');
    ws.onerror = (error) => console.error('WebSocket error:', error);
    return ws;
  }

  // Error reporting (unchanged)
  async reportError(errorData) {
    return this.request('/api/v1/errors/report', {
      method: 'POST',
      body: JSON.stringify({
        ...errorData,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      }),
    });
  }
}

// Create singleton instance
const apiService = new APIService();

// Export both the class and instance
export { APIService };
export default apiService;