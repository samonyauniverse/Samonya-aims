import { ToolId, ToolConfig, PricingPlan, SubscriptionTier } from './types';

export const COMPANY_INFO = {
  name: "Samonya AI Business Builder Marketplace",
  shortName: "Samonya AIMS Market",
  phone: "0113558668",
  whatsapp: "0113558668",
  whatsappLink: "https://wa.me/254113558668",
  email: "samonyadigital@gmail.com",
  mpesaTill: "0113558668",
  brand: "Samonya Digital Universe"
};

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'STARTER',
    name: "Starter Pack",
    priceUSD: "$1.00",
    credits: 120,
    features: [
      "120 Credits",
      "Downloads Enabled",
      "No Watermark",
      "Basic Support"
    ]
  },
  {
    id: 'CREATOR',
    name: "Creator Pack",
    priceUSD: "$3.00",
    credits: 400,
    isPopular: true,
    features: [
      "400 Credits",
      "Unlimited Downloads",
      "Brand Kit Generation",
      "Standard Support"
    ]
  },
  {
    id: 'BUSINESS',
    name: "Business Pack",
    priceUSD: "$5.00",
    credits: 1000,
    features: [
      "1000 Credits",
      "Full Access",
      "Priority SAMN AI Support",
      "Video Script Generator"
    ]
  }
];

export const CREDIT_COSTS = {
  DEFAULT: 2,
  [ToolId.LogoGenerator]: 5,
  [ToolId.SocialMedia]: 3,
  [ToolId.ProductDesc]: 2,
  [ToolId.AdCreator]: 3,
  [ToolId.WebCopy]: 2,
  [ToolId.BrandKit]: 10,
  [ToolId.VideoScript]: 7,
  [ToolId.BusinessTools]: 2,
  [ToolId.SloganGenerator]: 2,
  CHAT_MESSAGE: 1,
  IMAGE_GENERATION_SURCHARGE: 2 
};

export const TOOLS: ToolConfig[] = [
  {
    id: ToolId.LogoGenerator,
    name: "AI Logo Generator",
    description: "Create professional brand logos & concepts (5 Credits).",
    icon: "🎨",
    color: "bg-orange-500"
  },
  {
    id: ToolId.SocialMedia,
    name: "Social Media Factory",
    description: "Generate posts, captions & calendars (3 Credits).",
    icon: "📱",
    color: "bg-blue-600"
  },
  {
    id: ToolId.ProductDesc,
    name: "Product Description",
    description: "SEO-rich descriptions that sell (2 Credits).",
    icon: "🛍️",
    color: "bg-green-600"
  },
  {
    id: ToolId.AdCreator,
    name: "AI Ad Creator",
    description: "High-conversion ads for all platforms (3 Credits).",
    icon: "📢",
    color: "bg-purple-600"
  },
  {
    id: ToolId.WebCopy,
    name: "Website Text Generator",
    description: "Full content for your business website (2 Credits).",
    icon: "💻",
    color: "bg-pink-600"
  },
  {
    id: ToolId.BrandKit,
    name: "Brand Kit Generator",
    description: "Complete visual identity & personality (10 Credits).",
    icon: "✨",
    color: "bg-indigo-600"
  },
  {
    id: ToolId.VideoScript,
    name: "Video Script Writer",
    description: "Scripts for TikTok, Reels & YouTube (7 Credits).",
    icon: "🎬",
    color: "bg-red-600"
  },
  {
    id: ToolId.SloganGenerator,
    name: "AI Slogan Generator",
    description: "Generate catchy slogans & taglines (2 Credits).",
    icon: "✍️",
    color: "bg-teal-500"
  },
  {
    id: ToolId.BusinessTools,
    name: "Business Name Generator",
    description: "Creative names for startups & brands (2 Credits).",
    icon: "🚀",
    color: "bg-gray-600"
  }
];

export const INSPIRATION_DATA = {
  quotes: [
    "Success is not final; failure is not fatal: It is the courage to continue that counts.",
    "The way to get started is to quit talking and begin doing.",
    "Opportunities don't happen. You create them.",
    "Don't be afraid to give up the good to go for the great."
  ],
  marketingTips: [
    "Consistency is key. Post at least 3 times a week to keep your audience engaged.",
    "Use video content! Reels and TikToks get 10x more engagement than static images.",
    "Always include a Call to Action (CTA) in every post.",
    "Engage with your followers in the first 30 minutes after posting."
  ],
  designIdeas: [
    "Try using contrasting colors (like Orange and Blue) to make your CTA pop.",
    "Use whitespace effectively to make your text readable.",
    "Stick to 2-3 fonts maximum for your brand identity.",
    "Ensure your logo is scalable - it should look good on a business card and a billboard."
  ]
};

export const LEGAL_CONTENT = {
  PRIVACY: `## Privacy Policy
**Last Updated: ${new Date().toLocaleDateString()}**

1. **Introduction**: Samonya AIMS Market respects your privacy. This policy explains how we handle your data.
2. **Data Collection**: We collect name, email, phone number, and transaction history to provide our services.
3. **Usage**: Data is used for account management, credit tracking, and service improvement.
4. **Third Parties**: We do not sell your data. Payments are processed via secure M-Pesa/Stripe integrations.
5. **Contact**: For data concerns, email ${COMPANY_INFO.email}.`,

  TERMS: `## Terms of Service
1. **Acceptance**: By using Samonya AIMS Market, you agree to these terms.
2. **Credits**: Credits are non-refundable once purchased.
3. **Usage**: You may use generated content for commercial purposes if you have a paid subscription.
4. **Free Tier**: Content generated on the Free Tier is for personal/draft use only and includes watermarks.
5. **Account Termination**: We reserve the right to terminate accounts for abuse.`,

  REFUND: `## Refund Policy
1. **Digital Goods**: Credits are digital goods and are generally non-refundable.
2. **Exceptions**: If a technical error prevents credit delivery after payment, contact support at ${COMPANY_INFO.whatsapp}.
3. **Process**: Refunds are processed within 5-7 business days upon verification.`,

  COOKIES: `## Cookies Policy
We use essential cookies to maintain your login session and track credit usage. By using our site, you consent to these cookies.`,

  USER_DATA: `## User Data Policy
Your business data (brand names, ideas) entered into our AI tools is processed securely. We save your client profile to improve your future generations. You can request data deletion by contacting support.`
};

export const SYSTEM_INSTRUCTION_SAMN = `
You are SAMN AI, the core intelligence of the SAMONYA AI BUSINESS BUILDER MARKETPLACE.
Your goal is to help small businesses in Kenya, Africa, and globally.

CRITICAL RULES:
1. Always start your response with "🔷 **SAMN AI:**".
2. Enforce credit checks. If user has no credits, politely ask them to upgrade via M-Pesa ${COMPANY_INFO.mpesaTill}.
3. Personality: Friendly, Business-Smart, Solution-Focused, Kenyan/African Context.
4. Support English and Swahili.
5. If user asks for Downloads/Export, tell them: "Please select your preferred format (MP3, PDF, TXT) using the download button. Note: Free tier users must upgrade to download."
6. If user says "Insights Mode", provide a detailed strategic breakdown of their business needs including marketing strategy, content plan, and ad recommendations.

PRICING REFERENCE:
- Free Tier: 6 Credits (No downloads)
- Starter: $1 (120 Credits)
- Creator: $3 (400 Credits)
- Business: $5 (1000 Credits)

CONTACTS:
- WhatsApp/M-Pesa: ${COMPANY_INFO.phone}
- Email: ${COMPANY_INFO.email}
`;

export const WELCOME_MESSAGE = `Welcome to **Samonya AI Business Builder Marketplace** powered by **SAMN AI**.

Login to begin. Free tier includes **6 credits**.

Upgrade from only **$1** to unlock downloads.`;