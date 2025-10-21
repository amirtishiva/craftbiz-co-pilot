import { DashboardData, Idea, BusinessPlan, Design, MarketingContent, Activity } from '@/types/dashboard';

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const extractTitle = (content: string): string => {
  const firstLine = content.split('\n')[0];
  return firstLine.slice(0, 50) + (firstLine.length > 50 ? '...' : '');
};

export const formatRelative = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(amount);
};

export const truncate = (text: string, length: number): string => {
  return text.length > length ? text.slice(0, length) + '...' : text;
};

export const getDashboardData = (): DashboardData => {
  const data = localStorage.getItem('craftbiz_dashboard');
  if (!data) {
    return {
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
  localStorage.setItem('craftbiz_dashboard', JSON.stringify(data));
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
  data.activities = [newActivity, ...(data.activities || [])].slice(0, 50); // Keep last 50 activities
  saveDashboardData(data);
};

export const getLastEditedItem = (data: DashboardData): any => {
  const allItems = [
    ...(data.ideas || []).map(i => ({ ...i, type: 'idea', sortDate: i.lastEdited })),
    ...(data.businessPlans || []).map(p => ({ ...p, type: 'plan', sortDate: p.lastEdited })),
    ...(data.designs || []).map(d => ({ ...d, type: 'design', sortDate: d.createdAt })),
    ...(data.marketing || []).map(m => ({ ...m, type: 'marketing', sortDate: m.lastEdited })),
  ];

  if (allItems.length === 0) return null;

  return allItems.sort((a, b) => 
    new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime()
  )[0];
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

export const extractHashtags = (content: string): string[] => {
  const hashtagRegex = /#[\w]+/g;
  return content.match(hashtagRegex) || [];
};
