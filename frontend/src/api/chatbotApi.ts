import axios from './axios';

interface ChatMessage {
  id: number;
  type: string;
  content: string;
  sentAt: string;
  references?: Array<{
    documentId: number;
    documentName: string;
    relevanceScore: number;
  }>;
}

interface ChatResponse {
  response: string;
  sources: Array<{
    id: number;
    name: string;
    content: string;
    relevanceScore: number;
  }>;
}

// Ask a question within a project context
export const askProjectQuestion = async (
  projectId: number,
  question: string
): Promise<ChatResponse> => {
  try {
    const response = await axios.post(`/api/chatbot/projects/${projectId}/ask`, {
      question
    });
    return response.data;
  } catch (error) {
    console.error('Error asking project question:', error);
    throw error;
  }
};

// Ask a question about a specific document
export const askDocumentQuestion = async (
  projectId: number,
  documentName: string,
  question: string
): Promise<ChatResponse> => {
  try {
    const response = await axios.post(`/api/chatbot/projects/${projectId}/documents/ask`, {
      documentName,
      question
    });
    return response.data;
  } catch (error) {
    console.error('Error asking document question:', error);
    throw error;
  }
};

// Ask a global question (across all projects)
export const askGlobalQuestion = async (
  question: string
): Promise<ChatResponse> => {
  try {
    const response = await axios.post('/api/chatbot/ask', {
      question
    });
    return response.data;
  } catch (error) {
    console.error('Error asking global question:', error);
    throw error;
  }
};

// Get project conversation history
export const getProjectConversationHistory = async (
  projectId: number,
  limit: number = 20
): Promise<ChatMessage[]> => {
  try {
    const response = await axios.get(`/api/chatbot/projects/${projectId}/history`, {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching project conversation history:', error);
    throw error;
  }
};

// Get global conversation history
export const getGlobalConversationHistory = async (
  limit: number = 20
): Promise<ChatMessage[]> => {
  try {
    const response = await axios.get('/api/chatbot/history', {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching global conversation history:', error);
    throw error;
  }
}; 