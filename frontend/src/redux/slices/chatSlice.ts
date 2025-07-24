import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as chatbotApi from '../../api/chatbotApi';
import { RootState } from '../store';

// Define types
interface ChatReference {
  documentId: number;
  documentName: string;
  relevanceScore: number;
}

interface ChatMessage {
  id: number;
  type: string;
  content: string;
  sentAt: string;
  references?: ChatReference[];
}

interface ChatState {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  currentProjectId: number | null;
  isGlobalMode: boolean;
}

// Initial state
const initialState: ChatState = {
  messages: [],
  loading: false,
  error: null,
  currentProjectId: null,
  isGlobalMode: false
};

// Async thunks
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (
    { message, projectId, isGlobal = false }: 
    { message: string; projectId?: number; isGlobal?: boolean },
    { rejectWithValue }
  ) => {
    try {
      let response;
      
      // Extract document name if the message is about a specific document
      const documentMatch = message.match(/what is document ["']?([^"']+)["']? about/i) || 
                           message.match(/content of document ["']?([^"']+)["']?/i);
      
      if (documentMatch && projectId) {
        // If asking about a specific document
        const documentName = documentMatch[1];
        response = await chatbotApi.askDocumentQuestion(projectId, documentName, message);
      } else if (isGlobal) {
        // If in global mode
        response = await chatbotApi.askGlobalQuestion(message);
      } else if (projectId) {
        // If in project mode
        response = await chatbotApi.askProjectQuestion(projectId, message);
      } else {
        return rejectWithValue('No project context or global mode specified');
      }
      
      // Create user message
      const userMessage: Partial<ChatMessage> = {
        type: 'USER',
        content: message,
        sentAt: new Date().toISOString()
      };
      
      // Create bot message
      const botMessage: Partial<ChatMessage> = {
        type: 'BOT',
        content: response.response,
        sentAt: new Date().toISOString(),
        references: response.sources?.map(source => ({
          documentId: source.id,
          documentName: source.name,
          relevanceScore: source.relevanceScore
        }))
      };
      
      return { userMessage, botMessage };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

export const fetchConversationHistory = createAsyncThunk(
  'chat/fetchConversationHistory',
  async (
    { projectId, limit = 20 }: { projectId: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      return await chatbotApi.getProjectConversationHistory(projectId, limit);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch conversation history');
    }
  }
);

export const fetchGlobalConversationHistory = createAsyncThunk(
  'chat/fetchGlobalConversationHistory',
  async (limit: number = 20, { rejectWithValue }) => {
    try {
      return await chatbotApi.getGlobalConversationHistory(limit);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch global conversation history');
    }
  }
);

// Create the slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.messages = [];
    },
    setProjectContext: (state, action: PayloadAction<number>) => {
      state.currentProjectId = action.payload;
      state.isGlobalMode = false;
    },
    toggleGlobalMode: (state) => {
      state.isGlobalMode = !state.isGlobalMode;
    }
  },
  extraReducers: (builder) => {
    builder
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.messages.push(
          action.payload.userMessage as ChatMessage,
          action.payload.botMessage as ChatMessage
        );
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch conversation history
      .addCase(fetchConversationHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversationHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchConversationHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch global conversation history
      .addCase(fetchGlobalConversationHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGlobalConversationHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchGlobalConversationHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

// Export actions
export const { clearMessages, setProjectContext, toggleGlobalMode } = chatSlice.actions;

// Export selectors
export const selectChatMessages = (state: RootState) => state.chat.messages;
export const selectChatLoading = (state: RootState) => state.chat.loading;
export const selectChatError = (state: RootState) => state.chat.error;
export const selectCurrentProjectId = (state: RootState) => state.chat.currentProjectId;
export const selectIsGlobalMode = (state: RootState) => state.chat.isGlobalMode;

// Export reducer
export default chatSlice.reducer; 