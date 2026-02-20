
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

export interface PageContent {
  title: string;
  url: string;
  body: string;
}

export interface ExtractedTask {
  description: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface AnalysisResult {
  summary: string;
  keyPoints: string[];
  sentiment: string;
  readingTime: string;
  topics: string[];
  suggestedTasks: ExtractedTask[]; // New: Tasks found on the page
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  groundingUrls?: string[]; // New: URLs from search grounding
}
