
export type PresenceStatus = 'office' | 'remote' | 'leave' | 'weekend' | 'holiday' | 'sick' | 'other' | 'planned';

export interface PresenceRecord {
  date: string; // ISO string YYYY-MM-DD
  status: PresenceStatus;
  reason?: string;
}

export interface Reminder {
  id: string;
  title: string;
  dateTime: string; // ISO string
  completed: boolean;
  notified: boolean;
  type?: 'standard' | 'system';
}

// Added PageContent interface to support browser tab simulation data
export interface PageContent {
  title: string;
  url: string;
  body: string;
}

// Added AnalysisResult interface for Gemini page analysis response
export interface AnalysisResult {
  summary: string;
  keyPoints: string[];
  sentiment: string;
  readingTime: string;
  topics: string[];
}

// Added ChatMessage interface for the AI chat sidebar
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
