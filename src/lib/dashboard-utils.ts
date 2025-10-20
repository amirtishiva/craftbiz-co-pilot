import { DashboardData, Idea, BusinessPlan, Design, MarketingContent, Activity } from '@/types/dashboard';

const STORAGE_KEY = 'craftbiz_dashboard';

export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const extractTitle = (content: string, maxLength: number = 50): string => {
  const cleaned = content.trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.substring(0, maxLength) + '...';
};

export const formatRelative = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  
  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  return `${months} month${months > 1 ? 's' : ''} ago`;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(amount);
};

export const truncate = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

export const getDashboardData = (): DashboardData => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    return {
      user: {
        id: generateId(),
        name: localStorage.getItem('craftbiz_user') || 'User',
        email: '',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        activityStreak: 0,
      },
      ideas: [],
      businessPlans: [],
      designs: [],
      marketing: [],
      activities: [],
      achievements: [],
    };
  }
  return JSON.parse(data);
};

export const saveDashboardData = (data: DashboardData): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const addActivity = (
  type: Activity['type'],
  action: Activity['action'],
  itemId: string,
  itemTitle: string
): void => {
  const data = getDashboardData();
  const newActivity: Activity = {
    id: generateId(),
    type,
    action,
    itemId,
    itemTitle,
    timestamp: new Date().toISOString(),
  };
  data.activities = [newActivity, ...data.activities].slice(0, 50); // Keep last 50 activities
  saveDashboardData(data);
};

export const getLastEditedItem = (data: DashboardData): any | null => {
  const allItems = [
    ...data.ideas.map(i => ({ ...i, type: 'idea', sortDate: i.lastEdited })),
    ...data.businessPlans.map(p => ({ ...p, type: 'plan', sortDate: p.lastEdited })),
    ...data.designs.map(d => ({ ...d, type: 'design', sortDate: d.createdAt })),
    ...data.marketing.map(m => ({ ...m, type: 'marketing', sortDate: m.lastEdited })),
  ];
  
  if (allItems.length === 0) return null;
  
  return allItems.sort((a, b) => 
    new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime()
  )[0];
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};
