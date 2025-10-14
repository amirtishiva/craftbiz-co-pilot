# CraftBiz - Technical Specification Document

## 1. Executive Summary

CraftBiz is a comprehensive AI-powered platform designed to help entrepreneurs transform business ideas into actionable business plans with design assets, marketing materials, and supplier connections. The platform leverages Google's Vertex AI services (Gemini, Gemma, Imagen) to provide intelligent content generation, language processing, and visual design capabilities.

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer (React)                   │
│  - React 18.3+ with TypeScript                              │
│  - Vite Build Tool                                           │
│  - Tailwind CSS for Styling                                 │
│  - React Router for Navigation                              │
└─────────────────────────────────────────────────────────────┘
                            ↓↑
┌─────────────────────────────────────────────────────────────┐
│                  Authentication Layer                        │
│  - Supabase Auth (Email/Password, OAuth)                    │
│  - JWT Token Management                                      │
│  - Session Persistence                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓↑
┌─────────────────────────────────────────────────────────────┐
│                    Backend Services                          │
│  - Supabase Edge Functions (Deno Runtime)                   │
│  - RESTful API Endpoints                                     │
│  - Serverless Computing                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓↑
┌─────────────────────────────────────────────────────────────┐
│                  AI & External Services Layer                │
│  - OpenAI API (GPT-5 series, DALL-E)                        │
│  - Google Maps APIs (Maps, Geocoding, Places, etc.)        │
│  - Meta Graph API (Facebook, Instagram)                     │
│  - Twitter/X API                                             │
│  - LinkedIn API                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓↑
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer                                 │
│  - PostgreSQL Database (Supabase)                           │
│  - File Storage (Supabase Storage)                          │
│  - Caching Layer                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

#### Frontend
- **Framework**: React 18.3.1
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3.x with custom design system
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: React Hooks (useState, useEffect, useContext)
- **Routing**: React Router DOM 6.x
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Fetch API with Supabase client
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: Sonner (toast notifications)

#### Backend
- **Runtime**: Deno (Supabase Edge Functions)
- **Database**: PostgreSQL 15+ (Supabase)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **API Gateway**: Supabase REST API

#### AI & ML Services
- **Primary AI**: OpenAI API
  - gpt-5-mini-2025-08-07 (default model - balanced performance)
  - gpt-5-2025-08-07 (complex reasoning and business plans)
  - gpt-5-nano-2025-08-07 (simple tasks like language detection)
  - gpt-image-1 (DALL-E - image generation for logos, scenes, mockups)
- **Document Processing**: 
  - mammoth (DOCX parsing)
  - pdfjs-dist (PDF parsing)
- **Language Detection**: OpenAI GPT models
- **Translation**: OpenAI GPT models

#### Mapping & Location Services (Suppliers Module)
- **Google Maps JavaScript API**: Interactive maps with supplier pins and routes
- **Google Maps Geocoding API**: Address to coordinates conversion
- **Google Maps Distance Matrix API**: Calculate distance and travel time
- **Google Maps Directions API**: Turn-by-turn route navigation
- **Google Places API**: Supplier business details, reviews, and ratings
- **Google Maps Static API**: Static map image generation (optional)
- **Google Maps URL Scheme**: Deep linking to Google Maps app

#### Social Media Analytics (Marketing Hub)
- **Meta Graph API**: Facebook and Instagram insights, engagement, and audience analytics
- **Twitter/X API**: Tweet analytics, engagement metrics, and impressions
- **LinkedIn API**: Company page analytics, post performance, and engagement data

#### DevOps & Infrastructure
- **Hosting**: Lovable Platform
- **CI/CD**: Automated deployment via Lovable
- **Monitoring**: Supabase Dashboard
- **Version Control**: Git

## 3. Frontend Architecture

### 3.1 Component Structure

```
src/
├── components/
│   ├── layout/
│   │   └── Navigation.tsx          # Main navigation component
│   ├── dashboard/
│   │   └── Dashboard.tsx            # Dashboard with quick actions
│   ├── idea/
│   │   ├── IdeaCapture.tsx         # Main idea input interface
│   │   └── DocumentUpload.tsx      # Document upload & processing
│   ├── business/
│   │   └── BusinessPlan.tsx        # Business plan display & edit
│   ├── design/
│   │   └── DesignStudio.tsx        # Logo, scenes, mockups
│   ├── marketing/
│   │   └── MarketingHub.tsx        # Content generation & scheduling
│   ├── suppliers/
│   │   └── SuppliersMap.tsx        # Supplier search & map
│   └── ui/                          # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       └── ... (50+ UI components)
├── pages/
│   ├── Index.tsx                    # Main app container
│   └── NotFound.tsx                 # 404 page
├── hooks/
│   ├── use-toast.ts                 # Toast notification hook
│   └── use-mobile.tsx               # Mobile detection hook
├── lib/
│   └── utils.ts                     # Utility functions
├── index.css                        # Global styles & design tokens
└── main.tsx                         # App entry point
```

### 3.2 Key Components Specification

#### 3.2.1 IdeaCapture Component
**Purpose**: Capture business ideas through text, voice, or document upload

**Features**:
- Multi-modal input (text, voice, document upload)
- Language selection (8 Indian languages + English)
- Business type categorization
- Real-time validation
- Document preview and editing

**State Management**:
```typescript
interface IdeaCaptureState {
  inputMethod: 'text' | 'voice' | 'upload';
  isRecording: boolean;
  businessIdea: string;
  businessType: string;
  language: string;
  isProcessing: boolean;
  documentData: {
    originalContent: string;
    originalLanguage: string;
    englishContent: string;
  } | null;
}
```

#### 3.2.2 DocumentUpload Component
**Purpose**: Handle document uploads with preview and editing

**Features**:
- Support for TXT, DOCX, PDF
- File validation (max 10MB)
- Document preview with syntax highlighting
- Inline editing capability
- Character and word count
- Content normalization
- Language detection
- AI-powered refinement

**Processing Pipeline**:
1. File upload validation
2. Content extraction (format-specific parsers)
3. Text normalization (whitespace, encoding)
4. Language detection
5. Translation (if needed)
6. NLP refinement (grammar, clarity, structure)
7. Preview with edit capability
8. Final submission

#### 3.2.3 BusinessPlan Component
**Purpose**: Display and manage generated business plans

**Features**:
- Structured sections display
- Edit mode with inline editing
- PDF export functionality
- Financial calculator integration
- Real-time auto-save (future)

**Business Plan Structure**:
```typescript
interface BusinessPlan {
  executiveSummary: string;
  businessDescription: string;
  marketAnalysis: {
    targetMarket: string;
    competition: string;
    marketSize: string;
  };
  businessModel: string;
  financialProjections: {
    startupCosts: number;
    monthlyExpenses: number;
    revenueProjections: number[];
    breakEvenPoint: number;
  };
  marketingStrategy: string;
  operations: string;
  metadata: {
    generatedAt: string;
    language: string;
    businessType: string;
  };
}
```

#### 3.2.4 DesignStudio Component
**Purpose**: AI-powered design asset generation

**Features**:
- Logo generation with customization
- Scene/background generation (templates + custom)
- Product mockup creation
- Design history and management
- Download functionality

**Design Generation Flow**:
1. User provides description/prompt
2. API call to AI image generation
3. Progress tracking with loading states
4. Result display with preview
5. Download/save options

#### 3.2.5 MarketingHub Component
**Purpose**: Marketing content generation and management

**Features**:
- AI content generation for multiple platforms
- Hashtag research and suggestions
- Post scheduling optimizer
- Content preview with platform-specific formatting
- Copy and share functionality

**Content Types**:
- Social media posts (Facebook, Instagram, Twitter/X, LinkedIn)
- Email campaigns
- Ad copy
- Blog posts
- Product descriptions

#### 3.2.6 SuppliersMap Component
**Purpose**: Supplier discovery and connection

**Features**:
- Category-based filtering
- Location-based search
- List and map view toggle
- Supplier detail cards
- Contact information display

### 3.3 Design System

#### Color Tokens (HSL Format)
```css
:root {
  /* Primary Colors */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  
  /* Accent Colors */
  --accent-orange: 24 95% 53%;
  --accent-blue: 221 83% 53%;
  --accent-green: 142 71% 45%;
  
  /* Semantic Colors */
  --card: 0 0% 100%;
  --muted: 210 40% 96.1%;
  --destructive: 0 84.2% 60.2%;
  
  /* Shadows */
  --shadow-small: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-medium: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-large: 0 20px 25px -5px rgb(0 0 0 / 0.1);
}
```

#### Typography Scale
- **Headings**: Inter font family
- **Body**: Inter font family
- **Scale**: 0.75rem to 3rem (responsive)

#### Spacing System
- Base unit: 0.25rem (4px)
- Scale: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64

#### Breakpoints
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

## 4. Data Models

### 4.1 Database Schema

#### Users Table (Managed by Supabase Auth)
```sql
-- users table is managed by Supabase Auth
-- We extend it with a profiles table
```

#### Profiles Table
```sql
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

#### User Roles Table
```sql
create type public.app_role as enum ('admin', 'moderator', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
```

#### Business Ideas Table
```sql
create table public.business_ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  original_content text not null,
  original_language text not null,
  english_content text not null,
  business_type text not null,
  input_method text check (input_method in ('text', 'voice', 'upload')),
  is_from_document boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

#### Business Plans Table
```sql
create table public.business_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  idea_id uuid references public.business_ideas(id) on delete cascade,
  executive_summary text,
  business_description text,
  market_analysis jsonb,
  business_model text,
  financial_projections jsonb,
  marketing_strategy text,
  operations text,
  status text check (status in ('draft', 'completed', 'archived')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

#### Design Assets Table
```sql
create table public.design_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  business_plan_id uuid references public.business_plans(id) on delete cascade,
  asset_type text check (asset_type in ('logo', 'scene', 'mockup')),
  prompt text not null,
  file_url text not null,
  file_path text not null,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

#### Marketing Content Table
```sql
create table public.marketing_content (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  business_plan_id uuid references public.business_plans(id) on delete cascade,
  platform text check (platform in ('facebook', 'instagram', 'twitter', 'linkedin', 'email')),
  content_type text check (content_type in ('post', 'ad', 'email', 'blog')),
  content text not null,
  hashtags text[],
  scheduled_at timestamp with time zone,
  status text check (status in ('draft', 'scheduled', 'published')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

#### Suppliers Table
```sql
create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  description text,
  location text not null,
  coordinates geography(point),
  contact_email text,
  contact_phone text,
  website text,
  rating numeric(3,2),
  verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### 4.2 Storage Buckets

#### Business Documents Bucket
```sql
insert into storage.buckets (id, name, public)
values ('business-documents', 'business-documents', false);
```

#### Design Assets Bucket
```sql
insert into storage.buckets (id, name, public)
values ('design-assets', 'design-assets', true);
```

#### User Avatars Bucket
```sql
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);
```

## 5. Security Architecture

### 5.1 Authentication Flow

```
User Registration:
1. User submits email + password
2. Supabase creates auth.users record
3. Trigger creates profiles record
4. Trigger assigns default 'user' role
5. JWT token issued
6. Client stores session

User Login:
1. User submits credentials
2. Supabase validates
3. JWT token issued with claims
4. Client stores session
5. Auto-refresh on expiry
```

### 5.2 Row Level Security (RLS) Policies

#### Profiles Table
```sql
-- Users can read their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);
```

#### Business Ideas Table
```sql
-- Users can insert their own ideas
create policy "Users can create ideas"
  on public.business_ideas for insert
  with check (auth.uid() = user_id);

-- Users can view their own ideas
create policy "Users can view own ideas"
  on public.business_ideas for select
  using (auth.uid() = user_id);

-- Users can update their own ideas
create policy "Users can update own ideas"
  on public.business_ideas for update
  using (auth.uid() = user_id);
```

#### Business Plans Table
```sql
-- Similar RLS policies for business_plans
create policy "Users can manage own plans"
  on public.business_plans for all
  using (auth.uid() = user_id);
```

#### Design Assets Table
```sql
-- Users can manage their own assets
create policy "Users can manage own assets"
  on public.design_assets for all
  using (auth.uid() = user_id);
```

#### Storage Policies
```sql
-- Business documents - private access
create policy "Users can upload own documents"
  on storage.objects for insert
  with check (
    bucket_id = 'business-documents' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Design assets - public read, authenticated write
create policy "Anyone can view design assets"
  on storage.objects for select
  using (bucket_id = 'design-assets');

create policy "Users can upload design assets"
  on storage.objects for insert
  with check (
    bucket_id = 'design-assets' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );
```

### 5.3 Input Validation

All user inputs must be validated using Zod schemas:

```typescript
import { z } from 'zod';

// Business idea validation
const businessIdeaSchema = z.object({
  content: z.string().min(50).max(5000),
  businessType: z.enum(['E-commerce', 'Food & Restaurant', ...]),
  language: z.string().length(2),
});

// File upload validation
const fileUploadSchema = z.object({
  file: z.instanceof(File)
    .refine(file => file.size <= 10 * 1024 * 1024, 'Max 10MB')
    .refine(file => ['text/plain', 'application/pdf', ...].includes(file.type)),
});
```

## 6. AI Integration Architecture

### 6.1 Lovable AI Gateway Integration

**Endpoint**: `https://ai.gateway.lovable.dev/v1/chat/completions`

**Default Model**: `google/gemini-2.5-flash`

**Authentication**: Bearer token (LOVABLE_API_KEY)

### 6.2 AI Use Cases

#### 6.2.1 Document Processing & Refinement
**Purpose**: Convert raw text to business-ready content

**Process**:
1. Extract text from uploaded document
2. Normalize content (whitespace, encoding)
3. Detect language
4. Translate to English if needed
5. Refine with AI (grammar, clarity, structure)

**Prompt Template**:
```
You are a business consultant helping entrepreneurs refine their business ideas.

Original text:
{originalContent}

Tasks:
1. Fix grammar and spelling
2. Remove redundancy
3. Simplify complex sentences
4. Structure into clear paragraphs
5. Make it business-plan ready

Output a polished, professional business idea description.
```

#### 6.2.2 Business Plan Generation
**Purpose**: Generate comprehensive business plans

**Sections Generated**:
1. Executive Summary
2. Business Description
3. Market Analysis
4. Business Model
5. Financial Projections
6. Marketing Strategy
7. Operations Plan

**Prompt Template**:
```
Generate a comprehensive business plan for the following idea:

Business Idea: {refinedIdea}
Business Type: {businessType}
Language: {language}

Create a detailed business plan with these sections:
[Section specifications...]

Output in JSON format with structured data.
```

#### 6.2.3 Logo Generation
**Purpose**: Create brand logos (Future - requires image generation model)

**Note**: Currently uses placeholder. Future integration with image generation API.

#### 6.2.4 Marketing Content Generation
**Purpose**: Create platform-specific marketing content

**Prompt Template**:
```
Create marketing content for:
Platform: {platform}
Business: {businessName}
Description: {businessDescription}
Tone: {tone}

Generate:
1. Engaging post content (max {characterLimit} chars)
2. Relevant hashtags (5-10)
3. Call-to-action

Output in JSON format.
```

### 6.3 Rate Limiting & Error Handling

**Rate Limits**:
- 429 Too Many Requests: Implement exponential backoff
- 402 Payment Required: Show user-friendly message

**Error Handling**:
```typescript
try {
  const response = await fetch(aiEndpoint, config);
  
  if (response.status === 429) {
    // Rate limit - wait and retry
    await new Promise(resolve => setTimeout(resolve, 5000));
    return retry(request);
  }
  
  if (response.status === 402) {
    // Payment required
    throw new Error('AI credits exhausted');
  }
  
  if (!response.ok) {
    throw new Error(`AI request failed: ${response.status}`);
  }
  
  return await response.json();
} catch (error) {
  // Log and handle error
  console.error('AI integration error:', error);
  throw error;
}
```

## 7. Performance Optimization

### 7.1 Frontend Optimization
- **Code Splitting**: Route-based lazy loading
- **Image Optimization**: WebP format, lazy loading
- **Bundle Size**: Tree shaking, minification
- **Caching**: Service worker for offline capability

### 7.2 Backend Optimization
- **Database Indexing**: 
  - user_id columns
  - created_at columns
  - frequently queried fields
- **Query Optimization**: Use database functions for complex queries
- **Connection Pooling**: Managed by Supabase
- **Caching**: Redis layer for frequently accessed data (future)

### 7.3 API Optimization
- **Request Batching**: Combine multiple requests
- **Response Compression**: Gzip/Brotli
- **Pagination**: Limit result sets (default 50 items)
- **Selective Field Loading**: Only fetch required fields

## 8. Testing Strategy

### 8.1 Frontend Testing
- **Unit Tests**: Jest + React Testing Library
- **Component Tests**: Storybook for UI components
- **Integration Tests**: Test component interactions
- **E2E Tests**: Playwright for critical user flows

### 8.2 Backend Testing
- **API Tests**: Test edge functions with sample data
- **Database Tests**: Test RLS policies and triggers
- **Load Tests**: Artillery for performance testing

### 8.3 AI Testing
- **Prompt Testing**: Validate AI responses
- **Edge Case Testing**: Handle API failures gracefully
- **Output Validation**: Ensure AI outputs meet format requirements

## 9. Deployment Architecture

### 9.1 Environments
- **Development**: Local development with Supabase local instance
- **Staging**: Lovable preview environment
- **Production**: Lovable production deployment

### 9.2 CI/CD Pipeline
1. Code push to repository
2. Automatic deployment via Lovable
3. Edge functions deployed to Supabase
4. Database migrations applied
5. Frontend build and deployment
6. Health checks

### 9.3 Monitoring
- **Application Monitoring**: Supabase Dashboard
- **Error Tracking**: Console logs, edge function logs
- **Performance Monitoring**: Lighthouse metrics
- **Usage Analytics**: Track feature usage

## 10. Scalability Considerations

### 10.1 Database Scalability
- **Partitioning**: Partition large tables by date
- **Read Replicas**: For heavy read operations
- **Archiving**: Move old data to cold storage

### 10.2 Application Scalability
- **Serverless Functions**: Auto-scaling edge functions
- **CDN**: Static asset delivery via CDN
- **Load Balancing**: Managed by hosting platform

### 10.3 AI Service Scalability
- **Request Queuing**: Queue AI requests during high load
- **Fallback Models**: Use lighter models when rate limited
- **Caching**: Cache common AI responses

## 11. Security Considerations

### 11.1 Data Protection
- **Encryption at Rest**: Database encryption
- **Encryption in Transit**: HTTPS/TLS
- **Sensitive Data**: Hash passwords, encrypt PII

### 11.2 API Security
- **Authentication**: JWT-based auth for all API calls
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Sanitize all user inputs
- **SQL Injection Prevention**: Use parameterized queries

### 11.3 File Upload Security
- **File Type Validation**: Whitelist allowed types
- **File Size Limits**: Max 10MB per file
- **Virus Scanning**: Scan uploads for malware (future)
- **Storage Isolation**: User-specific folders

## 12. Future Enhancements

### 12.1 Phase 2 Features
- Real-time collaboration on business plans
- Export to multiple formats (Word, PowerPoint)
- Integration with accounting software
- Mobile app (React Native)

### 12.2 Phase 3 Features
- Investor matching platform
- Funding assistance tools
- Legal document generation
- Business mentorship matching

### 12.3 Advanced AI Features
- Voice-to-text with real-time transcription
- Image recognition for product analysis
- Competitive analysis automation
- Market trend prediction

## 13. Maintenance & Support

### 13.1 Regular Maintenance
- **Weekly**: Review error logs
- **Monthly**: Performance optimization
- **Quarterly**: Security audits
- **Annually**: Major version updates

### 13.2 Support Channels
- In-app chat support
- Email support
- Documentation portal
- Community forum

## 14. Compliance & Legal

### 14.1 Data Privacy
- GDPR compliance (if serving EU users)
- Data retention policies
- User data export/deletion capabilities

### 14.2 Terms & Conditions
- User agreement
- Privacy policy
- Cookie policy
- Acceptable use policy

## 15. Appendices

### 15.1 Glossary
- **RLS**: Row Level Security
- **JWT**: JSON Web Token
- **AI Gateway**: Lovable AI service endpoint
- **Edge Function**: Serverless function running on edge network

### 15.2 References
- Supabase Documentation: https://supabase.com/docs
- Lovable Documentation: https://docs.lovable.dev
- React Documentation: https://react.dev
- Tailwind CSS: https://tailwindcss.com

---

**Document Version**: 2.0  
**Last Updated**: 2025-10-14  
**Author**: CraftBiz Development Team  
**Changes**: Updated technical stack - OpenAI APIs for AI/Image Generation, Google Maps APIs for Suppliers, Social Media Analytics APIs for Marketing
