# CraftBiz - Technical Specification

**Version**: 2.0  
**Last Updated**: January 2025  
**Status**: Active Development

---

## 1. Executive Summary

CraftBiz is an AI-powered platform that helps entrepreneurs transform business ideas into comprehensive business plans with design assets, marketing materials, and supplier connections. The platform uses OpenAI's GPT and DALL-E APIs for content and image generation, Google Maps APIs for supplier discovery, and social media APIs for marketing analytics.

---

## 2. System Architecture

### 2.1 Technology Stack

#### Frontend
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **UI Library**: shadcn/ui (Radix UI primitives)
- **Routing**: React Router DOM 6.x
- **State**: React Hooks
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Document Processing**: mammoth (DOCX), pdfjs-dist (PDF)

#### Backend
- **Runtime**: Deno (Supabase Edge Functions)
- **Database**: PostgreSQL 15+ (Supabase)
- **Authentication**: Supabase Auth (JWT)
- **Storage**: Supabase Storage
- **ORM**: Supabase PostgREST

#### AI & External Services
- **OpenAI API**:
  - `gpt-5-2025-08-07` - Complex reasoning, business plans
  - `gpt-5-mini-2025-08-07` - Default for content generation
  - `gpt-5-nano-2025-08-07` - Simple tasks (language detection)
  - `gpt-image-1` - Image generation (logos, scenes, mockups)

- **Google Maps APIs**:
  - JavaScript API - Interactive maps
  - Geocoding API - Address conversion
  - Distance Matrix API - Distance/time calculation
  - Directions API - Route navigation
  - Places API - Business details & reviews
  - Static Maps API - Static images
  - URL Scheme - Deep linking

- **Social Media APIs**:
  - Meta Graph API - Facebook/Instagram analytics
  - Twitter/X API - Tweet engagement
  - LinkedIn API - Company page analytics

---

## 3. Core Features

### 3.1 Idea Capture Module
**Purpose**: Capture and process business ideas in multiple formats with AI refinement

**Features**:
- **Text Input**: Natural language business idea entry with AI refinement icon
  - Users describe their idea freely
  - Click "Refine" icon (✨ sparkle, bottom-right) to expand with AI
  - AI generates: Executive Summary, Business Goals, Market Overview, Operations Plan, Financial Insights
  
- **Voice Recording**: Speak in any language
  - Auto-detects spoken language
  - Transcribes speech to text
  - Auto-translates to English
  - Displays transcription with AI refinement option (✨ sparkle, bottom-right)
  - Click "Refine" to convert transcription into structured business plan
  
- **Image Upload/Capture**: For artisans and creators
  - Upload or capture product photos (crafts, jewelry, textiles, woodwork)
  - AI Vision (GPT-4o/CLIP) analyzes:
    - Product type identification
    - Materials and craftsmanship details  
    - Visual cues (colors, motifs, regional art styles)
  - Product-to-Business Mapping: AI interprets visual metadata
  - Generates business plan based on product analysis
  - Examples: Terracotta pot → Home décor, Handwoven fabric → Sustainable Fashion

**Flow**:
1. User inputs idea via text/voice/image
2. For text/voice: Optional AI refinement into structured plan
3. For image: AI vision analyzes product, generates business context
4. Refined/analyzed content passes to Business Plan generator

---

### 3.2 Business Plan Generator
**Purpose**: AI-generated comprehensive business plans

**AI Model**: `gpt-5-2025-08-07`

**Generated Sections**:
- Executive Summary
- Market Analysis
- Business Model
- Marketing Strategy
- Operations Planning
- Financial Projections

**Features**:
- Financial calculator (startup costs, revenue, break-even)
- Editable plan sections
- PDF export
- Multilingual input support

---

### 3.3 Design Studio
**Purpose**: Generate visual brand assets with AI enhancement

**AI Model**: `gpt-image-1` (DALL-E)

**Features**:
- **AI-powered Logo Generation**
  - Brand description input with AI refinement icon (✨ wand, bottom-left)
  - Click "Refine" to enhance/clarify description before generation
  - AI improves creativity and relevance of logo prompts
  - Generates multiple logo style variations
  
- **Scene Creator**: Marketing backgrounds and lifestyle photos
- **Product Mockups**: Apply logos to products (t-shirts, mugs, phone cases, tote bags)
- Upload existing designs
- Download assets in various formats

---

### 3.4 Marketing Hub
**Purpose**: Generate marketing content and optimize posting strategy

**AI Model**: `gpt-5-mini-2025-08-07`

**Features**:
- **Content Generator**: Platform-specific posts (Facebook, Instagram, LinkedIn, Twitter)
- **Hashtag Research**: Trending and niche-specific hashtags
- **Posting Schedule**: Optimal times based on social media analytics
- **Visual Assets**: Marketing graphics creation
- Platform-specific character limits and formatting

**Social Media Analytics**:
- Facebook/Instagram: Page insights, post reach, engagement via Meta Graph API
- Twitter/X: Tweet analytics, impressions via Twitter API
- LinkedIn: Company page analytics, post performance via LinkedIn API

---

### 3.5 Suppliers Module
**Purpose**: Discover and connect with local suppliers

**Google Maps Integration**:
- **Interactive Maps**: Display suppliers with pins and routes
- **Geocoding**: Convert addresses to coordinates
- **Distance Matrix**: Calculate travel distance and time
- **Directions**: Turn-by-turn navigation
- **Places Details**: Business info, reviews, ratings
- **Get Directions**: Deep link to Google Maps app

**Features**:
- Search by category, city, or material
- Supplier profiles (contact, specialties, ratings)
- Distance and delivery time display
- Verified supplier badges
- List and map views

---

## 4. Database Schema

### 4.1 Core Tables

**users** (Supabase Auth)
- id (uuid, PK)
- email (text, unique)
- created_at (timestamp)

**business_ideas**
- id (uuid, PK)
- user_id (uuid, FK → users)
- content (text)
- original_language (text)
- business_type (text)
- created_at (timestamp)

**business_plans**
- id (uuid, PK)
- user_id (uuid, FK → users)
- idea_id (uuid, FK → business_ideas)
- executive_summary (text)
- market_analysis (text)
- business_model (text)
- marketing_strategy (text)
- operations_planning (text)
- financial_projections (jsonb)
- created_at (timestamp)

**design_assets**
- id (uuid, PK)
- user_id (uuid, FK → users)
- asset_type (text) - 'logo', 'scene', 'mockup'
- file_url (text)
- prompt (text)
- created_at (timestamp)

**marketing_content**
- id (uuid, PK)
- user_id (uuid, FK → users)
- platform (text)
- content (text)
- created_at (timestamp)

**suppliers**
- id (uuid, PK)
- name (text)
- category (text)
- city (text)
- address (text)
- coordinates (geography, PostGIS)
- phone (text)
- email (text)
- rating (numeric)
- verified (boolean)

---

## 5. Edge Functions

### 5.1 generate-business-plan
**Path**: `/functions/v1/generate-business-plan`  
**Model**: `gpt-5-2025-08-07`  
**Input**: Business idea, type, language  
**Output**: Structured business plan JSON

### 5.2 generate-marketing-content
**Path**: `/functions/v1/generate-marketing-content`  
**Model**: `gpt-5-mini-2025-08-07`  
**Input**: Campaign focus, platform, audience  
**Output**: Platform-optimized content with hashtags

### 5.3 generate-logo
**Path**: `/functions/v1/generate-logo`  
**Model**: `gpt-image-1`  
**Input**: Brand description, style preferences  
**Output**: Base64 image data

### 5.4 generate-scene
**Path**: `/functions/v1/generate-scene`  
**Model**: `gpt-image-1`  
**Input**: Scene description, style, aspect ratio  
**Output**: Base64 image data

### 5.5 generate-mockup
**Path**: `/functions/v1/generate-mockup`  
**Model**: `gpt-image-1`  
**Input**: Logo file, product template type  
**Output**: Composite mockup image

### 5.6 process-document
**Path**: `/functions/v1/process-document`  
**Model**: `gpt-5-mini-2025-08-07` (translation), `gpt-5-nano-2025-08-07` (detection)  
**Input**: Document file (TXT/DOCX/PDF)  
**Processing**:
1. Text extraction (mammoth/pdfjs)
2. Language detection
3. Translation to English
4. NLP refinement
**Output**: Original and refined English content

### 5.7 detect-language
**Path**: `/functions/v1/detect-language`  
**Model**: `gpt-5-nano-2025-08-07`  
**Input**: Text content  
**Output**: ISO 639-1 language code

### 5.8 translate-text
**Path**: `/functions/v1/translate-text`  
**Model**: `gpt-5-mini-2025-08-07`  
**Input**: Text, source language, target language  
**Output**: Translated text

### 5.9 geocode-address
**Path**: `/functions/v1/geocode-address`  
**API**: Google Maps Geocoding API  
**Input**: Supplier address  
**Output**: Latitude, longitude coordinates

### 5.10 get-supplier-distance
**Path**: `/functions/v1/get-supplier-distance`  
**API**: Google Maps Distance Matrix API  
**Input**: User location, supplier location  
**Output**: Distance, travel time

### 5.11 get-directions
**Path**: `/functions/v1/get-directions`  
**API**: Google Maps Directions API  
**Input**: Origin, destination  
**Output**: Turn-by-turn route

### 5.12 get-supplier-details
**Path**: `/functions/v1/get-supplier-details`  
**API**: Google Places API  
**Input**: Place ID or business name  
**Output**: Business details, reviews, ratings

### 5.13 get-social-analytics
**Path**: `/functions/v1/get-social-analytics`  
**APIs**: Meta Graph, Twitter, LinkedIn  
**Input**: Platform, access token  
**Output**: Optimal posting times, engagement metrics

---

## 6. Environment Variables

```bash
# Supabase
VITE_SUPABASE_URL=https://[project-ref].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# OpenAI (Server-side only - Supabase Secrets)
OPENAI_API_KEY=sk-proj-...

# Google Maps (Frontend: VITE_, Backend: Secrets)
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...
GOOGLE_MAPS_API_KEY=AIzaSy...

# Social Media (Server-side only - Supabase Secrets)
META_ACCESS_TOKEN=EAABsb...
TWITTER_BEARER_TOKEN=AAAAAAAAAAAAA...
LINKEDIN_ACCESS_TOKEN=AQV...
```

---

## 7. Security

### 7.1 Row Level Security (RLS)
- All tables have RLS enabled
- Users can only access their own data
- Service role used for admin operations

### 7.2 API Key Management
- **Public keys**: Stored in `VITE_` environment variables (frontend)
- **Secret keys**: Stored in Supabase Secrets (backend)
- Never expose OpenAI, social media API keys in frontend

### 7.3 Input Validation
- All user inputs validated with Zod schemas
- File upload limits (10MB max)
- Allowed file types: TXT, DOCX, PDF, PNG, JPG

---

## 8. Performance Optimization

### 8.1 AI Model Selection
- **Simple tasks**: Use `gpt-5-nano` (fastest, cheapest)
- **Default**: Use `gpt-5-mini` (balanced)
- **Complex**: Use `gpt-5` (highest quality)

### 8.2 Caching
- Cache API responses where applicable
- Use Supabase realtime for live updates

### 8.3 Image Optimization
- Compress images before storage
- Use WebP format when supported
- Lazy load images

---

## 9. Deployment

### 9.1 Frontend
- **Platform**: Lovable (lovable.app)
- **Build**: Vite production build
- **CDN**: Automatic

### 9.2 Backend
- **Platform**: Supabase
- **Functions**: Deployed via Supabase CLI
- **Database**: PostgreSQL managed by Supabase

---

## 10. Future Enhancements

- Real-time collaboration on business plans
- Mobile app (React Native)
- WhatsApp Business API integration
- Payment gateway for supplier orders
- Multi-language UI (i18n)
- Advanced analytics dashboard
- AI chatbot for business advice
