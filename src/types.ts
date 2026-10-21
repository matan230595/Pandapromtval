export interface FewShotExample {
  id: string;
  input: string;
  output: string;
  isActive: boolean;
}

export interface PromptVersion {

  versionId?: string;
  content: string;
  updatedAt: string;
  currentVersionName?: string;
  versionName?: string;
}

export type PromptType = 'text' | 'image' | 'code';

export interface CustomPlaceholder {
  id: string;
  name: string; // e.g. "topic" or "customer_name"
  label: string; // e.g. "נושא הפרומפט"
  type: 'text' | 'textarea' | 'select' | 'number' | 'date';
  defaultValue?: string;
  options?: string[]; // for 'select' type
  description?: string;
  required?: boolean;
}

export interface PromptReminder {
  id: string;
  dateTime: string; // ISO string e.g. "2026-10-06T14:30"
  note?: string;
  isCompleted?: boolean;
  notified?: boolean;
  priority?: 'normal' | 'high' | 'urgent';
  snoozedUntil?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  description?: string;
  createdAt?: string;
}

export interface Prompt {
  id: string;
  title: string;
  content: string;
  platform: string; 
  tags: string[];
  categories?: string[]; // IDs or names of categories the prompt belongs to
  reminder?: PromptReminder;
  folder: string; 
  projectId: string | null;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
  useCount: number;
  type?: PromptType; // 'text' | 'image' | 'code'
  imageModel?: string; // e.g. 'Midjourney v6', 'DALL-E 3', 'FLUX.1'
  aspectRatio?: string; // e.g. '16:9', '1:1', '9:16'
  negativePrompt?: string;
  imageStyle?: string; // e.g. 'Photorealistic', 'Anime', '3D Render'
  codeLanguage?: string; // e.g. 'TypeScript', 'Python', 'React'
  codeFramework?: string;
  isAIOptimized?: boolean;
  aiOptimized?: boolean;
  currentVersionName?: string;
  description?: string;
  dueDate?: string;
  lastUsedAt?: string;
  notes?: string;
  exampleOutput?: string;
  language: 'he' | 'en';
  topic?: string;
  history?: PromptVersion[];
  isReadOnly?: boolean;
  usageHistory?: string[];
  sortIndex?: number;
  testChatHistory?: {role: 'user'|'assistant', content: string}[];
  fewShotExamples?: FewShotExample[];
  qualityScore?: { upvotes: number; downvotes: number };
  forkedFromId?: string;
  mediaAttachments?: string[];
  keyboardShortcut?: string;
  chainNextPromptId?: string;
  teamComments?: PromptComment[];
  isPublic?: boolean;
  customPlaceholders?: CustomPlaceholder[];
  summary?: string;
  archived?: boolean;
}

export interface Folder {
  id: string;
  name: string;
  color?: string;
  icon?: string; 
  sharedWith?: string[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

export interface PlatformConfig {
  id: string;
  name: string;
  color: string;      
  bgColor: string;    
  textColor: string;  
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    website?: string;
  };
  followers?: string[];
  following?: string[];
}

export interface PublicPrompt extends Prompt {
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  likes: string[];
  commentsCount: number;
  trendingScore?: number;
}

export interface PromptComment {
  id: string;
  promptId: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  text: string;
  createdAt: string;
}

export interface AutomationRule {
  id: string;
  keyword: string;
  targetFolderId: string;
  matchIn: 'tags' | 'content' | 'both';
  isActive: boolean;
}
