export enum ToolId {
  Dashboard = 'DASHBOARD',
  LogoGenerator = 'LOGO_GENERATOR',
  SocialMedia = 'SOCIAL_MEDIA',
  ProductDesc = 'PRODUCT_DESC',
  AdCreator = 'AD_CREATOR',
  WebCopy = 'WEB_COPY',
  BrandKit = 'BRAND_KIT',
  VideoScript = 'VIDEO_SCRIPT',
  BusinessTools = 'BUSINESS_TOOLS',
  SloganGenerator = 'SLOGAN_GENERATOR'
}

export type SubscriptionTier = 'FREE' | 'STARTER' | 'CREATOR' | 'BUSINESS';

export interface User {
  name: string;
  email: string;
  phone: string;
  credits: number;
  subscriptionTier: SubscriptionTier;
  lastActivity: Date;
}

export interface PricingPlan {
  id: SubscriptionTier;
  name: string;
  priceUSD: string;
  credits: number;
  features: string[];
  isPopular?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface ToolConfig {
  id: ToolId;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface Transaction {
  id: string;
  date: Date;
  type: 'DEPOSIT' | 'USAGE';
  description: string;
  amount: number;
}