
export type PresenceStatus = 'office' | 'remote' | 'leave' | 'weekend' | 'holiday' | 'sick' | 'other' | 'planned';

export type TransactionCategory = 'Food' | 'Rent' | 'EMI' | 'Utilities' | 'Shopping' | 'Investments' | 'Travel' | 'Insurance' | 'Others' | 'Income';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  merchant?: string;
  accountType?: string;
  category?: TransactionCategory;
  confidence?: number;
}

export interface FinancialStability {
  score: number;
  explanation: string;
  breakdown: {
    incomeConsistency: number;
    savingsRatio: number;
    emiToIncomeRatio: number;
    expenseVariability: number;
  };
}

export interface CashFlowForecast {
  nextMonthTotal: number;
  categoryForecast: Record<string, number>;
  confidenceInterval: [number, number];
}

export interface AnomalyRecord {
  id: string;
  transactionId: string;
  score: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  reason: string;
}

export interface FinancialHealth {
  stabilityScore: number;
  defaultProbability: number;
  predictedSavings: number;
  emergencyFundMonths: number;
  readiness: 'Poor' | 'Moderate' | 'Strong';
}

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
