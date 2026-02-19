
export type PresenceStatus = 'office' | 'remote' | 'leave' | 'weekend' | 'holiday';

export interface PresenceRecord {
  date: string; // ISO string YYYY-MM-DD
  status: PresenceStatus;
  reason?: string;
}

// Added PageContent interface to support page analysis features
export interface PageContent {
  title: string;
  url: string;
  body: string;
}

// Added AnalysisResult interface to match the Gemini API JSON response schema
export interface AnalysisResult {
  summary: string;
  keyPoints: string[];
  sentiment: string;
  readingTime: string;
  topics: string[];
}

// Added ChatMessage interface for managing conversation state in the sidebar
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
