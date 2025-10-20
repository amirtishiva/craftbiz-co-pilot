export interface DashboardUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  lastLogin: string;
  activityStreak: number;
}

export interface Idea {
  id: string;
  title: string;
  content: string;
  businessType: string;
  inputMethod: 'text' | 'voice' | 'image';
  status: 'draft' | 'submitted' | 'plan-generated';
  createdAt: string;
  lastEdited: string;
  hasPlan: boolean;
  planId?: string;
  originalLanguage?: string;
  transcription?: string;
  imageUrl?: string;
  productAnalysis?: any;
}

export interface BusinessPlan {
  id: string;
  ideaId: string;
  businessName: string;
  businessType: string;
  sections: {
    executiveSummary: string;
    marketAnalysis: string;
    businessModel: string;
    marketingStrategy: string;
    operationsPlanning: string;
    financialProjections: string;
  };
  financialData: {
    startupCost: number;
    monthlyExpenses: number;
    monthlyRevenue: number;
    monthlyProfit: number;
    breakEvenMonths: number;
  };
  status: 'draft' | 'complete';
  completionPercentage: number;
  createdAt: string;
  lastEdited: string;
}

export interface Design {
  id: string;
  type: 'logo' | 'mockup' | 'scene';
  name: string;
  description: string;
  style?: string;
  imageUrl: string;
  thumbnailUrl: string;
  createdAt: string;
  favorited: boolean;
  appliedTo?: string[];
  sceneType?: string;
  aspectRatio?: string;
}

export interface MarketingContent {
  id: string;
  platform: 'facebook' | 'instagram' | 'linkedin' | 'twitter' | 'general';
  contentType: string;
  content: string;
  hashtags: string[];
  engagement: 'low' | 'medium' | 'high';
  audienceType: string;
  createdAt: string;
  lastEdited: string;
}

export interface Activity {
  id: string;
  type: 'idea' | 'plan' | 'design' | 'marketing';
  action: 'created' | 'edited' | 'deleted' | 'downloaded';
  itemId: string;
  itemTitle: string;
  timestamp: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
  category: 'ideas' | 'plans' | 'designs' | 'marketing';
}

export interface DashboardData {
  user: DashboardUser;
  ideas: Idea[];
  businessPlans: BusinessPlan[];
  designs: Design[];
  marketing: MarketingContent[];
  activities: Activity[];
  achievements: Achievement[];
}
