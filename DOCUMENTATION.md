# CraftBiz - Complete Project Documentation
**Version:** 1.0.0  
**Last Updated:** January 2026  
**Platform:** Web Application (PWA-Ready)

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Design & UI/UX Documentation](#2-design--uiux-documentation)
3. [User Flow & Journey](#3-user-flow--journey)
4. [Features Breakdown](#4-features-breakdown)
5. [System Architecture](#5-system-architecture)
6. [API Documentation](#6-api-documentation)
7. [Data & Storage](#7-data--storage)
8. [Configuration & Environment](#8-configuration--environment)
9. [Security & Permissions](#9-security--permissions)
10. [Error Handling & Edge Cases](#10-error-handling--edge-cases)
11. [Limitations & Known Gaps](#11-limitations--known-gaps)
12. [Future Enhancements](#12-future-enhancements)
13. [How to Use This Project](#13-how-to-use-this-project)

---

## 1. Project Overview

### 1.1 Project Name
**CraftBiz** - An AI-powered platform for Indian artisans and craft entrepreneurs.

### 1.2 Problem Statement
Indian artisans and small craft entrepreneurs face significant barriers in starting and scaling their businesses. They lack access to professional business planning tools, effective marketing resources, quality suppliers, and digital marketplaces. Most available business tools are designed for Western markets and don't address the unique needs of Indian craft businesses, including local market dynamics, regional supplier networks, and cultural considerations.

### 1.3 Goal & Vision
CraftBiz aims to democratize entrepreneurship for Indian artisans by providing:
- **AI-powered business planning** tailored to Indian markets
- **Digital marketplace** connecting artisans directly with buyers
- **Design studio** for creating professional marketing materials
- **Local supplier network** to source quality materials
- **Smart marketing tools** for social media and product promotion

The vision is to empower 10,000+ artisans to transform their craft skills into sustainable businesses.

### 1.4 Target Users

| User Type | Description | Primary Goals |
|-----------|-------------|---------------|
| **Artisans/Sellers** | Skilled craftspeople wanting to start/grow businesses | Create business plans, sell products, find suppliers |
| **Buyers** | Consumers seeking authentic handcrafted products | Browse, compare, purchase artisanal goods |
| **Dual-Role Users** | Sellers who also purchase supplies/materials | Both selling and buying functionalities |

### 1.5 Core Use Cases

1. **Idea to Business Plan**: User describes business idea → AI generates comprehensive plan
2. **Product Marketplace**: Seller lists products → Buyers browse, compare, purchase
3. **Design Creation**: User inputs brand details → AI generates logos, banners, mockups
4. **Marketing Content**: User provides product info → AI creates social media content
5. **Supplier Discovery**: User searches by category/location → System shows nearby dealers
6. **Order Management**: Buyer places order → Seller fulfills → Buyer tracks delivery

### 1.6 Assumptions & Constraints

**Assumptions:**
- Users have basic smartphone/internet access
- Target market is primarily India (INR currency, Indian addresses)
- Users can authenticate via email
- Products are physical handcrafted goods

**Constraints:**
- Frontend-only deployment (no custom backend server)
- Relies on Supabase for backend functionality
- Third-party APIs for AI (Gemini) and maps (Google)
- PWA approach rather than native mobile apps

---

## 2. Design & UI/UX Documentation

### 2.1 Design Philosophy
CraftBiz employs a **warm, professional, and culturally-aware** design philosophy. The aesthetic is inspired by traditional Indian craftsmanship while maintaining modern usability standards. Key principles include:

- **Warmth**: Earthy color palette reflecting natural materials
- **Accessibility**: Mobile-first responsive design
- **Cultural Sensitivity**: Mandala patterns, craft imagery, Indian market focus
- **Clarity**: Clean typography, clear hierarchy, intuitive navigation

### 2.2 Color Scheme & Typography

#### Primary Colors (HSL Format)
```css
/* Light Mode */
--background: 32 20% 95%        /* Warm beige */
--foreground: 20 14% 10%        /* Warm brown/charcoal */
--card: 35 25% 98%              /* Cream white */
--primary: 20 14% 10%           /* Dark brown */
--secondary: 30 15% 85%         /* Light tan */
--accent-orange: 25 85% 60%     /* Vibrant orange */
--muted: 30 12% 88%             /* Soft gray-beige */

/* Brand Colors */
--craft-orange: hsl(16, 75%, 55%)   /* Primary CTA */
--craft-brown: hsl(25, 60%, 45%)    /* Secondary accent */
--craft-gold: hsl(35, 70%, 50%)     /* Highlight */
```

#### Typography
- **Display/Headlines**: System sans-serif, bold (600-700 weight)
- **Body Text**: System sans-serif, regular (400 weight)
- **Accent Text**: Georgia serif (italic) for handwritten feel

### 2.3 Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  HEADER (Navigation Bar)                                │
│  - Logo (left)                                          │
│  - User menu/Logout (right)                             │
├─────────────────────────────────────────────────────────┤
│  SECONDARY NAV (Tab Navigation - Seller Only)           │
│  - Dashboard | Idea | Plan | Design | Marketing | etc.  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  MAIN CONTENT AREA                                      │
│  - Dynamic content based on active tab                  │
│  - Responsive grid layouts                              │
│  - Card-based component design                          │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  MOBILE BOTTOM NAV (Mobile Only)                        │
│  - Browse | Search | Map | Orders | Cart                │
└─────────────────────────────────────────────────────────┘
```

### 2.4 Component Hierarchy

```
App
├── Landing Page (Public)
│   ├── Header (Logo, Nav, Auth buttons)
│   ├── Hero Section (Headline, CTA, Image gallery)
│   ├── Features Section (6 feature cards)
│   ├── Team Section (4 team members)
│   └── Footer
│
├── Auth Page
│   ├── Login Form
│   ├── Signup Form (with role selection)
│   └── Password Reset Links
│
└── Dashboard (Protected)
    ├── Navigation
    ├── SecondaryNav (Seller tabs)
    └── Content Area
        ├── Dashboard (Stats, Quick actions)
        ├── IdeaCapture (Text, Voice, Image input)
        ├── BusinessPlan (Generated plan display)
        ├── DesignStudio (Logo, Banner, Mockup generation)
        ├── MarketingHub (Content generation)
        ├── SuppliersMap (Supplier directory, Local dealers)
        ├── SellerDashboard (Products, Orders, Analytics)
        ├── BuyerMarketplace (Product browsing)
        └── Settings (Profile, Account, Notifications)
```

### 2.5 Screens & Wireframes

#### Screen 1: Landing Page
**Purpose:** Public-facing homepage to attract and convert users  
**UI Elements:**
- Animated hero section with artisan images
- "Get Started" CTA button
- Feature cards (6 features with icons)
- Team section with LinkedIn links
- Decorative mandala SVG background

**User Interactions:**
- Scroll through sections
- Click "Get Started" → Navigate to signup
- Click "Log in" → Navigate to login
- Click feature cards → Smooth scroll to features
- Click team LinkedIn → Opens external profile

#### Screen 2: Authentication
**Purpose:** User registration and login  
**UI Elements:**
- Email input field
- Password input field
- Role selection (Buyer/Seller) - signup only
- Submit button
- Toggle between login/signup
- Forgot password link

**Navigation Flow:**
- Successful login → Dashboard
- Forgot password → Reset password email

#### Screen 3: Seller Dashboard
**Purpose:** Central hub for sellers to manage their business  
**UI Elements:**
- Stats grid (Ideas, Plans, Designs, Marketing)
- Feature cards with progress indicators
- Quick action buttons
- Recent activity

**User Interactions:**
- Click feature card → Navigate to that section
- View progress percentages per feature

#### Screen 4: Idea Capture
**Purpose:** Collect business ideas via multiple input methods  
**UI Elements:**
- Input method tabs (Text, Voice, Image)
- Text area for typing ideas
- Voice recorder button
- Image upload dropzone
- Business type selector
- "Refine with AI" button
- Submit button

**Edge Cases:**
- Empty input → Validation error
- Voice recording fails → Error toast
- Image too large → Size limit error

#### Screen 5: Business Plan
**Purpose:** Display AI-generated business plan  
**UI Elements:**
- Business name header
- 10 expandable sections (Executive Summary, Market Analysis, etc.)
- Translation selector (8 Indian languages)
- Financial analysis button
- Download/Export options

**User Interactions:**
- Click section → Expand/collapse
- Select language → Translate content
- Click "Analyze Finances" → AI financial insights

#### Screen 6: Design Studio
**Purpose:** AI-powered design asset generation  
**UI Elements:**
- Tabs (Logos, Banners, Mockups, Scenes)
- Prompt input area
- Style/theme selectors
- Color pickers
- Generated asset gallery
- Download buttons

**User Interactions:**
- Enter prompt → Generate designs
- Click generated image → Full preview
- Download as PNG

#### Screen 7: Marketing Hub
**Purpose:** Generate marketing content  
**UI Elements:**
- Input type toggle (Text/Image)
- Content type selector
- Platform selector (Instagram, Facebook, etc.)
- Audience type selector
- Generated content display
- Refine with AI button
- Copy to clipboard

#### Screen 8: Suppliers & Materials
**Purpose:** Connect with suppliers and local dealers  
**UI Elements:**
- Tab navigation (Directory, Local Dealers)
- Search input
- Category filter
- City filter
- Supplier cards with ratings
- Google Maps integration
- Distance indicators

**Edge Cases:**
- Location permission denied → Manual search fallback
- No results → Empty state with suggestions

#### Screen 9: Buyer Marketplace
**Purpose:** Browse and purchase artisan products  
**UI Elements:**
- Category chips (horizontal scroll)
- Search autocomplete
- Filter panel (Price, Rating, Materials)
- Product grid
- Quick view modal
- Wishlist button
- Compare button
- Cart drawer

**User Interactions:**
- Search products → Filter results
- Click product → Quick view modal
- Add to cart → Cart drawer opens
- Add to wishlist → Heart icon fills
- Compare products → Comparison modal

#### Screen 10: Seller Product Management
**Purpose:** Manage product listings  
**UI Elements:**
- Add product button
- Product list/grid
- Status badges (Active, Draft)
- Edit/Delete actions
- Stock quantity editor
- AI-generated description button

---

## 3. User Flow & Journey

### 3.1 Complete User Journey Map

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER JOURNEY                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. DISCOVERY                                                   │
│     └─→ User visits landing page                                │
│         └─→ Views features & team                               │
│             └─→ Clicks "Get Started"                            │
│                                                                 │
│  2. REGISTRATION                                                │
│     └─→ Selects role (Buyer/Seller)                            │
│         └─→ Enters email & password                            │
│             └─→ Submits → Email auto-confirmed                 │
│                                                                 │
│  3. ONBOARDING (Role-Specific)                                 │
│     ├─→ SELLER PATH:                                           │
│     │   └─→ Dashboard → Idea Capture → Business Plan           │
│     │       └─→ Design Studio → Marketing → Launch             │
│     │                                                          │
│     └─→ BUYER PATH:                                            │
│         └─→ Marketplace → Browse → Cart → Checkout             │
│                                                                 │
│  4. CORE ACTIVITIES                                            │
│     ├─→ Seller: Add products, manage orders, analyze sales     │
│     └─→ Buyer: Browse, compare, wishlist, order                │
│                                                                 │
│  5. GROWTH (Seller)                                            │
│     └─→ Marketing content → Supplier connections → Scale       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Entry Points
1. **Direct URL**: User navigates to craftbiz domain
2. **Search Engine**: User finds via Google search
3. **Shared Link**: User receives product/store link
4. **Social Media**: User clicks marketing content link

### 3.3 Happy Path - Seller
1. Land on homepage → Click "Get Started"
2. Select "Seller" role → Enter credentials → Submit
3. Redirected to Dashboard → View stats and features
4. Click "Share Your Idea" → Describe business idea
5. Submit idea → AI generates business plan
6. Review 10-section plan → Translate if needed
7. Navigate to Design Studio → Generate logo
8. Navigate to Marketing Hub → Create social content
9. Navigate to Seller Dashboard → Add first product
10. Product goes live → Receives first order

### 3.4 Happy Path - Buyer
1. Land on homepage → Click "Get Started"
2. Select "Buyer" role → Enter credentials → Submit
3. Redirected to Marketplace → Browse categories
4. Search for product → Apply filters
5. View product → Add to cart
6. Open cart drawer → Proceed to checkout
7. Enter shipping address → Complete order
8. Track order → Receive delivery

### 3.5 Alternate Paths

**Voice Input Path:**
- User selects Voice tab → Clicks record
- Speaks idea → Audio transcribed
- Review transcription → Refine with AI

**Image Upload Path:**
- User selects Image tab → Uploads product photo
- AI analyzes image → Extracts product details
- Auto-generates business idea from analysis

**Custom Order Path:**
- Buyer views customizable product
- Clicks "Request Custom" → Submits requirements
- Seller receives request → Sends quote
- Buyer accepts → Order created

### 3.6 Error States

| Error | User Message | Recovery |
|-------|--------------|----------|
| Authentication failed | "Invalid credentials" | Re-enter or reset password |
| Network offline | "You're offline" | Use cached data, sync later |
| API rate limit | "Please wait and try again" | Auto-retry after delay |
| Payment failed | "Payment unsuccessful" | Retry with different method |
| Image upload failed | "File too large" | Compress and retry |

### 3.7 Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐      ┌──────────┐      ┌──────────────────┐  │
│  │ Landing  │──────│   Auth   │──────│   Dashboard      │  │
│  │  Page    │      │  Page    │      │  (Protected)     │  │
│  └──────────┘      └──────────┘      └──────────────────┘  │
│       │                 │                     │            │
│       │                 │                     │            │
│       ▼                 ▼                     ▼            │
│  Check session    Email/Password         Role check       │
│  If exists,       Supabase Auth          Fetch user_roles │
│  redirect ───────────────────────────────────────────────►│
│                                                             │
│  Password Reset Flow:                                       │
│  Auth → Forgot Password → Email sent → Reset link          │
│  → New password → Success → Redirect to login              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Features Breakdown

### 4.1 AI-Powered Business Plan Generation

**Feature Name:** AI Business Plan Generator  
**Description:** Transforms user's business idea into a comprehensive 10-section business plan tailored for Indian markets.

**Why It Exists:** Small business owners and artisans lack access to professional business planning services. This feature democratizes business planning by using AI to generate actionable, market-specific plans.

**How It Works Internally:**
1. User submits idea via text, voice, or image
2. Idea is refined using AI (Gemini API)
3. Refined idea is saved to `business_ideas` table
4. User provides optional business name
5. Edge function `generate-business-plan` is invoked
6. Gemini AI generates structured JSON with 10 sections
7. Plan is saved to `business_plans` table
8. Frontend displays expandable sections

**User Interaction Steps:**
1. Navigate to "Share Your Idea" tab
2. Choose input method (text/voice/image)
3. Enter/record/upload idea
4. Click "Refine with AI" (optional)
5. Click "Submit Idea"
6. Enter business name
7. Click "Generate Business Plan"
8. Wait for generation (10-20 seconds)
9. Review generated plan sections

**Dependencies:**
- Supabase Edge Functions
- Gemini API (GEMINI_API_KEY)
- business_ideas table
- business_plans table

**Limitations:**
- Maximum idea length: 5000 characters
- Generation time: 10-30 seconds
- English input produces best results
- No real-time market data integration

### 4.2 Voice Recording & Transcription

**Feature Name:** Voice Idea Capture  
**Description:** Allows users to record business ideas in their native language, automatically transcribed.

**Why It Exists:** Many artisans are more comfortable speaking than typing, especially in regional languages. This feature removes literacy barriers.

**How It Works Internally:**
1. User clicks "Record" button
2. MediaRecorder API captures audio
3. Audio blob is converted to base64
4. Sent to `transcribe-voice` edge function
5. OpenAI Whisper (via ElevenLabs) transcribes
6. Transcription returned and displayed

**User Interaction Steps:**
1. Select "Voice" tab in Idea Capture
2. Click microphone button to start
3. Speak idea clearly
4. Click stop when finished
5. Wait for transcription
6. Review and edit if needed

**Dependencies:**
- Browser MediaRecorder API
- ElevenLabs API (ELEVENLABS_API_KEY)
- transcribe-voice edge function

**Limitations:**
- Requires microphone permission
- Background noise affects accuracy
- Maximum recording: 2 minutes
- Some regional languages may have lower accuracy

### 4.3 Product Image Analysis

**Feature Name:** AI Product Image Analyzer  
**Description:** Analyzes uploaded product images to extract details for business plan generation.

**Why It Exists:** Artisans can simply photograph their products and let AI understand the business potential without needing to describe it manually.

**How It Works Internally:**
1. User uploads product image
2. Image converted to base64
3. Sent to `analyze-product-image` edge function
4. Gemini Vision API analyzes image
5. Extracts: product type, materials, style, colors, target audience
6. Returns structured analysis
7. Auto-populates business idea fields

**User Interaction Steps:**
1. Select "Image" tab in Idea Capture
2. Click upload area or drag-drop image
3. Wait for analysis (5-10 seconds)
4. Review extracted details
5. Click "Generate Business Plan"

**Dependencies:**
- Gemini Vision API
- analyze-product-image edge function
- File handling (max 10MB)

**Limitations:**
- Max file size: 10MB
- Supported formats: JPEG, PNG, WebP
- Works best with clear product photos
- May misidentify complex products

### 4.4 Design Studio

**Feature Name:** AI Design Studio  
**Description:** Generates logos, banners, product mockups, and contextual scenes using AI.

**Why It Exists:** Professional design services are expensive. This feature enables artisans to create marketing materials without design skills.

**How It Works Internally:**

**Logo Generation:**
1. User enters business name and style preferences
2. Prompt constructed with style guidelines
3. Gemini image generation creates logo
4. 3 variants generated
5. Saved to design_assets table

**Banner Generation:**
1. User selects banner size (10+ presets)
2. Enters headline, subheadline, CTA
3. Selects style theme and color scheme
4. Optional: uploads reference image
5. Generates 3 banner variants
6. Saved to banner_designs table

**Mockup Generation:**
1. User uploads logo
2. Selects product type (t-shirt, mug, etc.)
3. AI creates realistic product mockup
4. Returns mockup image

**Scene Generation:**
1. User describes scene
2. Selects aspect ratio
3. AI generates contextual product scene
4. Returns scene image

**User Interaction Steps:**
1. Navigate to Design Studio
2. Select tab (Logos, Banners, Mockups, Scenes)
3. Fill in required fields
4. Click "Generate"
5. Wait for generation (15-45 seconds)
6. Browse variants
7. Download preferred design

**Dependencies:**
- Gemini Image Generation API
- generate-logo edge function
- generate-banner edge function
- generate-mockup edge function
- generate-scene edge function
- design_assets table
- banner_designs table

**Limitations:**
- Generation time: 15-60 seconds
- Text in images may be imperfect
- Complex logos may need refinement
- Rate limits apply

### 4.5 Marketing Hub

**Feature Name:** AI Marketing Content Generator  
**Description:** Creates platform-specific marketing content for social media and product listings.

**Why It Exists:** Consistent, engaging marketing is crucial for online success but time-consuming to create manually.

**How It Works Internally:**
1. User enters text prompt or uploads product image
2. Selects content type (post, story, description, etc.)
3. Selects platform (Instagram, Facebook, etc.)
4. Selects target audience
5. AI generates tailored content with hashtags
6. Content saved to marketing_content table
7. User can refine with AI for improvements

**User Interaction Steps:**
1. Navigate to Marketing Hub
2. Choose input type (text/image)
3. Enter product details or upload image
4. Select content type and platform
5. Select audience type
6. Click "Generate Content"
7. Review generated content
8. Click "Refine" if needed
9. Copy or save content

**Dependencies:**
- Gemini API
- generate-marketing-content edge function
- refine-marketing-content edge function
- marketing_content table

**Limitations:**
- Generated hashtags may need local optimization
- Platform-specific formatting may need adjustment
- Image-based input requires clear product photos

### 4.6 Craft Stories Marketplace

**Feature Name:** Buyer Marketplace  
**Description:** E-commerce platform for browsing and purchasing handcrafted products.

**Why It Exists:** Provides artisans with a dedicated platform to sell their products directly to conscious consumers.

**How It Works Internally:**
1. Products fetched via search-products edge function
2. Supports filtering by category, price, materials, rating
3. Supports sorting by date, price, popularity
4. Products displayed in responsive grid
5. Quick view modal for product details
6. Cart managed in cart_items table
7. Orders placed in orders table

**User Interaction Steps:**
1. Browse categories or search
2. Apply filters (price, rating, etc.)
3. Click product for quick view
4. Add to cart or wishlist
5. Open cart drawer
6. Adjust quantities
7. Proceed to checkout
8. Enter shipping address
9. Complete order

**Dependencies:**
- search-products edge function
- products table
- product_images table
- cart_items table
- orders table
- order_items table
- wishlists table

**Limitations:**
- Payment integration not fully implemented
- No real-time inventory sync
- Shipping calculation is basic
- No multi-vendor cart splitting

### 4.7 Supplier Discovery

**Feature Name:** Suppliers & Materials Network  
**Description:** Helps artisans find suppliers and local dealers for raw materials.

**Why It Exists:** Sourcing quality materials at good prices is a major challenge for artisans. This feature connects them with verified suppliers.

**How It Works Internally:**
1. User searches by keyword, category, or city
2. Optional: share location for nearby results
3. search-suppliers edge function queries Google Places API
4. Results transformed to supplier format
5. Distance calculated if location shared
6. Results sorted by distance or rating

**User Interaction Steps:**
1. Navigate to Suppliers & Materials
2. Select Directory or Local Dealers tab
3. Enter search query
4. Select category filter
5. Select city or share location
6. View supplier cards
7. Click for details/directions

**Dependencies:**
- Google Places API (Google_Map_API_Key)
- Google Geocoding API
- search-suppliers edge function
- geocode-address edge function
- @react-google-maps/api

**Limitations:**
- Requires backend API key without referrer restrictions
- Limited to 15 results per search
- Google Places data may be incomplete
- Real-time availability not shown

### 4.8 Product Comparison

**Feature Name:** Product Comparison Tool  
**Description:** Allows buyers to compare up to 4 products side-by-side.

**Why It Exists:** Helps buyers make informed decisions when choosing between similar products.

**How It Works Internally:**
1. User clicks compare icon on products
2. Products stored in local state (useProductComparison hook)
3. Comparison bar appears at bottom
4. Click compare button opens modal
5. Products displayed in comparison table
6. Features compared: price, materials, rating, customization

**User Interaction Steps:**
1. Browse products
2. Click compare icon on desired products (max 4)
3. Comparison bar appears at bottom
4. Click "Compare" button
5. Review side-by-side comparison
6. Remove products or clear all

**Dependencies:**
- useProductComparison hook
- ProductComparisonModal component
- ComparisonBar component

**Limitations:**
- Maximum 4 products
- Session-only (not persisted)
- Limited comparison attributes

### 4.9 Wishlist

**Feature Name:** Product Wishlist  
**Description:** Allows buyers to save products for later.

**Why It Exists:** Buyers often browse before purchasing. Wishlist helps them save and return to items of interest.

**How It Works Internally:**
1. User clicks heart icon on product
2. Product added to wishlists table via useWishlist hook
3. Wishlist count updates in header
4. User can view all wishlisted items
5. Items can be added to cart or removed

**User Interaction Steps:**
1. Browse products
2. Click heart icon to add to wishlist
3. Navigate to Wishlist view
4. Browse saved items
5. Add to cart or remove

**Dependencies:**
- wishlists table
- useWishlist hook
- WishlistView component

**Limitations:**
- Requires authentication
- No wishlist sharing
- No price drop alerts

### 4.10 Order Management (Seller)

**Feature Name:** Seller Order Management  
**Description:** Dashboard for sellers to manage incoming orders.

**Why It Exists:** Sellers need a centralized place to view, process, and fulfill orders.

**How It Works Internally:**
1. Orders fetched from orders table
2. Filtered by seller_id
3. Includes order items and buyer info
4. Status can be updated (pending, confirmed, shipped, delivered)
5. Tracking number can be added

**User Interaction Steps:**
1. Navigate to Seller Dashboard
2. Click "Orders" tab
3. View order list
4. Click order for details
5. Update status
6. Add tracking number
7. Mark as shipped/delivered

**Dependencies:**
- orders table
- order_items table
- OrderManagement component

**Limitations:**
- No bulk order actions
- No automated shipping integration
- No refund processing

---

## 5. System Architecture

### 5.1 High-Level Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                           │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                    React Application                      │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │ │
│  │  │   Pages     │  │ Components  │  │     Hooks       │  │ │
│  │  │ - Landing   │  │ - UI        │  │ - useMarketplace│  │ │
│  │  │ - Auth      │  │ - Layout    │  │ - useWishlist   │  │ │
│  │  │ - Index     │  │ - Features  │  │ - useUserRoles  │  │ │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  │ │
│  └──────────────────────────────────────────────────────────┘ │
│                              │                                 │
│                              ▼                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                  Supabase Client SDK                      │ │
│  │  - Authentication  - Database Queries  - Storage          │ │
│  │  - Realtime        - Edge Function Invocation             │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌────────────────────────────────────────────────────────────────┐
│                       BACKEND LAYER                            │
│                    (Supabase Cloud)                            │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                   Edge Functions                          │ │
│  │  ┌────────────────┐  ┌────────────────┐                  │ │
│  │  │ Business Logic │  │ AI Integration │                  │ │
│  │  │ - search-prods │  │ - generate-plan│                  │ │
│  │  │ - search-suppl │  │ - generate-logo│                  │ │
│  │  │ - geocode-addr │  │ - gen-marketing│                  │ │
│  │  └────────────────┘  └────────────────┘                  │ │
│  └──────────────────────────────────────────────────────────┘ │
│                              │                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                    PostgreSQL Database                    │ │
│  │  - 18 Tables with RLS Policies                           │ │
│  │  - User Management  - Products  - Orders                 │ │
│  └──────────────────────────────────────────────────────────┘ │
│                              │                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                    Storage Buckets                        │ │
│  │  - avatars (public)  - product-images (public)           │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │  Google AI   │  │ Google Maps  │  │     ElevenLabs       │ │
│  │  Gemini API  │  │ Places API   │  │  Transcription API   │ │
│  └──────────────┘  └──────────────┘  └──────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

### 5.2 Folder Structure

```
craftbiz/
├── public/                     # Static assets
│   ├── apple-touch-icon.png    # PWA icons
│   ├── pwa-192x192.png
│   ├── pwa-512x512.png
│   ├── robots.txt
│   └── favicon.ico
│
├── src/
│   ├── assets/                 # Image assets
│   │   ├── artisan-*.jpg       # Hero section images
│   │   └── team-*.jpg          # Team member photos
│   │
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ... (20+ UI components)
│   │   │
│   │   ├── auth/               # Authentication components
│   │   │   └── RoleGuard.tsx
│   │   │
│   │   ├── layout/             # Layout components
│   │   │   ├── Navigation.tsx
│   │   │   ├── BuyerNavigation.tsx
│   │   │   └── SecondaryNav.tsx
│   │   │
│   │   ├── dashboard/          # Dashboard components
│   │   │   └── Dashboard.tsx
│   │   │
│   │   ├── idea/               # Idea capture components
│   │   │   ├── IdeaCapture.tsx
│   │   │   ├── VoiceRecorder.tsx
│   │   │   └── ImageUpload.tsx
│   │   │
│   │   ├── business/           # Business plan components
│   │   │   └── BusinessPlan.tsx
│   │   │
│   │   ├── design/             # Design studio components
│   │   │   ├── DesignStudio.tsx
│   │   │   └── ImageEnhancer.tsx
│   │   │
│   │   ├── marketing/          # Marketing components
│   │   │   └── MarketingHub.tsx
│   │   │
│   │   ├── marketplace/        # Marketplace components (20+)
│   │   │   ├── BuyerMarketplace.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ShoppingCartDrawer.tsx
│   │   │   └── ...
│   │   │
│   │   ├── seller/             # Seller components
│   │   │   ├── SellerDashboard.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   ├── OrderManagement.tsx
│   │   │   └── ...
│   │   │
│   │   ├── suppliers/          # Supplier components
│   │   │   ├── SuppliersMap.tsx
│   │   │   ├── SuppliersList.tsx
│   │   │   └── LocalDealersMap.tsx
│   │   │
│   │   └── profile/            # Profile components
│   │       ├── ProfileSettings.tsx
│   │       ├── AccountSettings.tsx
│   │       └── NotificationSettings.tsx
│   │
│   ├── hooks/                  # Custom React hooks (25+)
│   │   ├── useUserRoles.ts
│   │   ├── useMarketplace.ts
│   │   ├── useWishlist.ts
│   │   ├── useProductComparison.ts
│   │   └── ...
│   │
│   ├── pages/                  # Route pages
│   │   ├── Landing.tsx
│   │   ├── Auth.tsx
│   │   ├── Index.tsx           # Main dashboard
│   │   ├── ForgotPassword.tsx
│   │   ├── ResetPassword.tsx
│   │   └── NotFound.tsx
│   │
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts       # Supabase client (auto-generated)
│   │       └── types.ts        # TypeScript types (auto-generated)
│   │
│   ├── lib/
│   │   ├── utils.ts            # Utility functions
│   │   └── validation.ts       # Zod schemas
│   │
│   ├── utils/                  # Utility modules
│   │   ├── backgroundSync.ts
│   │   ├── cache.ts
│   │   ├── conflictResolution.ts
│   │   ├── haptics.ts
│   │   ├── offlineStorage.ts
│   │   └── pushNotifications.ts
│   │
│   ├── App.tsx                 # Main app component
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles & design system
│
├── supabase/
│   ├── config.toml             # Supabase configuration
│   └── functions/              # Edge functions
│       ├── analyze-financial-strategy/
│       ├── analyze-product-image/
│       ├── delete-account/
│       ├── enhance-image/
│       ├── generate-banner/
│       ├── generate-business-plan/
│       ├── generate-contextual-scene/
│       ├── generate-logo/
│       ├── generate-marketing-content/
│       ├── generate-mockup/
│       ├── generate-product-listing/
│       ├── geocode-address/
│       ├── refine-idea/
│       ├── refine-marketing-content/
│       ├── refine-prompt/
│       ├── search-products/
│       ├── search-suppliers/
│       ├── transcribe-voice/
│       └── translate-business-plan/
│
├── index.html                  # HTML entry point
├── vite.config.ts              # Vite configuration
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies
```

### 5.3 State Management Approach

CraftBiz uses a **hook-based state management** approach rather than a centralized store like Redux:

1. **React Query** (`@tanstack/react-query`):
   - Server state management
   - Automatic caching and refetching
   - Used for API calls to Supabase

2. **Local State** (`useState`):
   - Component-level UI state
   - Form inputs
   - Modal visibility

3. **Custom Hooks**:
   - `useUserRoles`: User role management
   - `useMarketplace`: Product and cart operations
   - `useWishlist`: Wishlist management
   - `useProductComparison`: Comparison state
   - `useRecentlyViewed`: Recently viewed products

4. **URL State** (`react-router-dom`):
   - Route parameters
   - Query strings for filters

### 5.4 Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         DATA FLOW                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  USER ACTION                                                    │
│      │                                                          │
│      ▼                                                          │
│  ┌────────────────────┐                                        │
│  │  React Component   │                                        │
│  │  (e.g., ProductForm)│                                        │
│  └─────────┬──────────┘                                        │
│            │                                                    │
│            ▼                                                    │
│  ┌────────────────────┐                                        │
│  │   Custom Hook      │                                        │
│  │  (e.g., useMarket) │                                        │
│  └─────────┬──────────┘                                        │
│            │                                                    │
│            ▼                                                    │
│  ┌────────────────────────────────────────────────────────┐   │
│  │              Supabase Client                            │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   │
│  │  │   Database   │  │   Storage    │  │  Functions   │  │   │
│  │  │    Query     │  │   Upload     │  │   Invoke     │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │   │
│  └────────────────────────────────────────────────────────┘   │
│            │                                                    │
│            ▼                                                    │
│  ┌────────────────────────────────────────────────────────┐   │
│  │                  Supabase Backend                       │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   │
│  │  │  PostgreSQL  │  │   Storage    │  │    Edge      │  │   │
│  │  │   + RLS      │  │   Buckets    │  │  Functions   │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │   │
│  └────────────────────────────────────────────────────────┘   │
│            │                                                    │
│            ▼                                                    │
│  RESPONSE → Hook updates state → Component re-renders          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. API Documentation

### 6.1 Edge Functions Overview

| Function Name | Auth Required | Purpose |
|--------------|---------------|---------|
| generate-business-plan | Yes | Generate AI business plan |
| refine-idea | Yes | Refine business idea text |
| transcribe-voice | Yes | Transcribe audio to text |
| analyze-product-image | Yes | Analyze product photo |
| generate-logo | Yes | Generate logo designs |
| generate-banner | Yes | Generate marketing banners |
| generate-mockup | Yes | Generate product mockups |
| generate-scene | Yes | Generate contextual scenes |
| generate-marketing-content | Yes | Generate marketing content |
| refine-marketing-content | Yes | Refine generated content |
| generate-product-listing | No | Generate product descriptions |
| translate-business-plan | Yes | Translate plan to Indian languages |
| analyze-financial-strategy | Yes | Financial analysis |
| search-products | No | Search marketplace products |
| search-suppliers | No | Search suppliers via Google Places |
| geocode-address | No | Geocode addresses |
| enhance-image | Yes | Enhance product images |
| delete-account | Yes | Delete user account |
| refine-prompt | Yes | Refine AI prompts |

### 6.2 Detailed API Documentation

#### generate-business-plan

**Endpoint:** `/functions/v1/generate-business-plan`  
**Method:** POST  
**Authentication:** Required (Bearer token)

**Request Body:**
```typescript
{
  ideaId: string;           // UUID of the business idea
  businessName?: string;    // Optional business name (max 200 chars)
}
```

**Success Response (200):**
```typescript
{
  businessPlan: {
    id: string;
    user_id: string;
    idea_id: string;
    business_name: string;
    executive_summary: string;
    market_analysis: string;
    target_customers: string;
    competitive_advantage: string;
    revenue_model: string;
    marketing_strategy: string;
    operations_plan: string;
    financial_projections: string;
    risk_analysis: string;
    implementation_timeline: string;
    status: string;
    created_at: string;
  }
}
```

**Error Responses:**
- 400: Invalid input data
- 401: Authentication required
- 404: Business idea not found
- 500: Server error

---

#### generate-banner

**Endpoint:** `/functions/v1/generate-banner`  
**Method:** POST  
**Authentication:** Required

**Request Body:**
```typescript
{
  bannerSize: string;              // e.g., 'instagram-post', 'facebook-cover'
  customWidth?: number;            // 100-5000, required if bannerSize is 'custom'
  customHeight?: number;           // 100-5000, required if bannerSize is 'custom'
  inputType?: 'text' | 'image';
  headline: string;                // 1-200 chars
  subheadline?: string;            // max 300 chars
  ctaText?: string;                // max 100 chars
  styleTheme: string;              // e.g., 'modern', 'traditional'
  colorScheme: string;             // e.g., 'warm', 'cool'
  primaryColor?: string;           // Hex format #RRGGBB
  secondaryColor?: string;         // Hex format #RRGGBB
  textDescription?: string;        // max 1000 chars
  referenceImageData?: string;     // Base64 image data
  planId?: string;                 // Optional UUID
}
```

**Success Response (200):**
```typescript
{
  success: true;
  banners: string[];      // Array of 3 base64 image URLs
  bannerId: string;       // UUID of saved banner
}
```

**Supported Banner Sizes:**
| Size Name | Dimensions |
|-----------|------------|
| instagram-post | 1080×1080 |
| instagram-story | 1080×1920 |
| facebook-cover | 820×312 |
| facebook-post | 1200×630 |
| linkedin-banner | 1584×396 |
| twitter-header | 1500×500 |
| youtube-thumbnail | 1280×720 |
| website-hero | 1920×600 |
| email-header | 600×200 |
| leaderboard-ad | 728×90 |
| custom | User-defined |

---

#### search-products

**Endpoint:** `/functions/v1/search-products`  
**Method:** POST  
**Authentication:** Not required

**Request Body:**
```typescript
{
  query?: string;              // Search text
  category?: string;           // Product category
  minPrice?: number;           // Minimum price filter
  maxPrice?: number;           // Maximum price filter
  sellerId?: string;           // Filter by seller
  sortBy?: string;             // 'price', 'created_at', 'rating', 'popularity'
  sortOrder?: 'asc' | 'desc';
  materials?: string[];        // Filter by materials
  minRating?: number;          // Minimum seller rating
  customizableOnly?: boolean;  // Only customizable products
  verifiedOnly?: boolean;      // Only verified sellers
  location?: { lat: number; lng: number };
  maxDistance?: number;        // In kilometers
  limit?: number;              // Max results (default 20)
  offset?: number;             // Pagination offset
}
```

**Success Response (200):**
```typescript
{
  products: Array<{
    id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    seller_id: string;
    stock_quantity: number;
    is_customizable: boolean;
    materials_used: string[];
    images: Array<{ image_url: string; is_primary: boolean }>;
    seller: { shop_name: string; rating: number; is_verified: boolean };
    distance?: number;
  }>;
  total: number;
  hasMore: boolean;
}
```

---

#### search-suppliers

**Endpoint:** `/functions/v1/search-suppliers`  
**Method:** POST  
**Authentication:** Not required

**Request Body:**
```typescript
{
  searchQuery?: string;        // Search text (max 200 chars)
  category?: string;           // Supplier category (max 100 chars)
  city?: string;               // City filter (max 100 chars)
  userLocation?: {
    lat: number;               // -90 to 90
    lng: number;               // -180 to 180
  };
  maxDistance?: number;        // Max km (1-500)
}
```

**Success Response (200):**
```typescript
{
  success: true;
  data: Array<{
    id: string;
    name: string;
    category: string;
    city: string;
    address: string;
    contact_phone: string;
    contact_email: string;
    rating: number;
    latitude: number;
    longitude: number;
    description: string;
    website_url: string;
    distance: number | null;
  }>;
  count: number;
}
```

**Error Responses:**
- 400: Invalid input (Zod validation error)
- 500: API error or configuration issue

---

### 6.3 Third-Party APIs

#### Google Gemini API

**Used For:** All AI text and image generation  
**Integration:** Via edge functions  
**Rate Limits:** 15 RPM (requests per minute) for image generation  
**Key Configuration:** `GEMINI_API_KEY` in Supabase secrets

**Endpoints Used:**
- `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent` (text)
- `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent` (images)

#### Google Maps/Places API

**Used For:** Supplier search and geocoding  
**Integration:** Via edge functions (server-side) and Maps JavaScript API (client-side)  
**Key Configuration:** `Google_Map_API_Key` (backend), `VITE_GOOGLE_MAPS_API_KEY` (frontend)

**Endpoints Used:**
- Places Text Search: `https://maps.googleapis.com/maps/api/place/textsearch/json`
- Geocoding: `https://maps.googleapis.com/maps/api/geocode/json`

**Important:** Backend API key must NOT have HTTP referrer restrictions.

#### ElevenLabs API (Whisper Transcription)

**Used For:** Voice recording transcription  
**Integration:** Via transcribe-voice edge function  
**Key Configuration:** `ELEVENLABS_API_KEY`

---

## 7. Data & Storage

### 7.1 Database Schema

#### Core Tables

**users** (Supabase Auth - managed)
- Stores authentication data
- Managed by Supabase Auth

**profiles**
| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | No | Primary key |
| user_id | uuid | No | References auth.users |
| bio | text | Yes | User biography |
| avatar_url | text | Yes | Profile picture URL |
| business_name | text | Yes | Business name |
| business_type | text | Yes | Type of business |
| phone | text | Yes | Phone number |
| location | text | Yes | Location string |
| created_at | timestamp | No | Creation timestamp |
| updated_at | timestamp | No | Last update timestamp |

**user_roles**
| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | No | Primary key |
| user_id | uuid | No | References auth.users |
| role | app_role | No | 'buyer' | 'seller' | 'admin' |
| created_at | timestamp | Yes | Creation timestamp |

**seller_profiles**
| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | No | Primary key |
| user_id | uuid | No | References auth.users |
| shop_name | text | No | Shop display name |
| shop_tagline | text | Yes | Shop tagline |
| artisan_story | text | Yes | Artisan's story |
| craft_specialty | text[] | Yes | Array of specialties |
| years_of_experience | integer | Yes | Experience in years |
| social_links | jsonb | Yes | Social media links |
| is_verified | boolean | Yes | Verification status |
| rating | numeric | Yes | Average rating |
| total_sales | integer | Yes | Total sales count |
| latitude | numeric | Yes | Location latitude |
| longitude | numeric | Yes | Location longitude |

#### Business Planning Tables

**business_ideas**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Owner |
| input_method | text | 'text', 'voice', 'image' |
| original_text | text | Raw input |
| refined_idea | text | AI-refined version |
| product_image_url | text | Uploaded image URL |
| voice_recording_url | text | Audio URL |
| detected_language | text | Detected language code |

**business_plans**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Owner |
| idea_id | uuid | References business_ideas |
| business_name | text | Business name |
| tagline | text | Business tagline |
| executive_summary | text | Executive summary |
| market_analysis | text | Market analysis |
| target_customers | text | Target customers |
| competitive_advantage | text | Competitive advantage |
| revenue_model | text | Revenue model |
| marketing_strategy | text | Marketing strategy |
| operations_plan | text | Operations plan |
| financial_projections | text | Financial projections |
| risk_analysis | text | Risk analysis |
| implementation_timeline | text | Timeline |
| status | text | 'draft', 'completed' |

#### E-Commerce Tables

**products**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| seller_id | uuid | References profiles |
| title | text | Product title |
| description | text | Description |
| story | text | Product story |
| craft_heritage | text | Cultural significance |
| category | text | Category |
| price | numeric | Price in INR |
| currency | text | Default 'INR' |
| stock_quantity | integer | Available stock |
| is_customizable | boolean | Accepts custom orders |
| customization_options | jsonb | Customization config |
| materials_used | text[] | Materials list |
| creation_time_hours | integer | Time to create |
| status | text | 'draft', 'active' |
| latitude | numeric | Product location |
| longitude | numeric | Product location |

**product_images**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| product_id | uuid | References products |
| image_url | text | Image URL |
| is_primary | boolean | Primary image flag |
| display_order | integer | Sort order |

**orders**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| buyer_id | uuid | References auth.users |
| seller_id | uuid | References profiles |
| status | text | Order status |
| total_amount | numeric | Total price |
| shipping_address | jsonb | Address details |
| tracking_number | text | Shipping tracking |
| stripe_payment_intent_id | text | Stripe reference |
| stripe_payment_status | text | Payment status |
| notes | text | Order notes |

**order_items**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| order_id | uuid | References orders |
| product_id | uuid | References products |
| quantity | integer | Item quantity |
| unit_price | numeric | Price per unit |
| customization_notes | text | Custom requirements |

**cart_items**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | References auth.users |
| product_id | uuid | References products |
| quantity | integer | Quantity |
| customization_notes | text | Custom notes |

**wishlists**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | References auth.users |
| product_id | uuid | References products |

**reviews**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| product_id | uuid | References products |
| buyer_id | uuid | Reviewer |
| order_id | uuid | References orders |
| rating | integer | 1-5 rating |
| comment | text | Review text |
| images | text[] | Review images |

**custom_requests**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| buyer_id | uuid | Requester |
| seller_id | uuid | Target seller |
| description | text | Request details |
| reference_images | text[] | Reference images |
| proposed_budget | numeric | Buyer's budget |
| seller_quote | numeric | Seller's quote |
| seller_notes | text | Seller response |
| estimated_delivery_days | integer | Delivery estimate |
| status | text | Request status |

#### Design & Marketing Tables

**design_assets**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Owner |
| plan_id | uuid | References business_plans |
| asset_type | text | 'logo', 'scene', 'mockup' |
| asset_url | text | Asset URL/data |
| prompt_used | text | Generation prompt |

**banner_designs**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Owner |
| plan_id | uuid | References business_plans |
| banner_size | text | Size preset |
| custom_width | integer | Custom width |
| custom_height | integer | Custom height |
| input_type | text | 'text' or 'image' |
| headline | text | Banner headline |
| subheadline | text | Subheadline |
| cta_text | text | Call to action |
| style_theme | text | Design style |
| color_scheme | text | Color scheme |
| primary_color | text | Hex color |
| secondary_color | text | Hex color |
| text_description | text | Description |
| reference_image_data | text | Reference image |
| banner_url_png_1 | text | Generated banner 1 |
| banner_url_png_2 | text | Generated banner 2 |
| banner_url_png_3 | text | Generated banner 3 |
| prompt_used | text | Generation prompt |

**marketing_content**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Owner |
| plan_id | uuid | References business_plans |
| platform | text | Target platform |
| content_type | text | Content type |
| content_text | text | Generated content |
| hashtags | text[] | Generated hashtags |
| input_type | text | Input method |
| image_data | text | Input image |

#### Other Tables

**suppliers**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | text | Supplier name |
| category | text | Category |
| description | text | Description |
| address | text | Address |
| city | text | City |
| state | text | State |
| contact_phone | text | Phone |
| contact_email | text | Email |
| website_url | text | Website |
| rating | numeric | Rating |
| latitude | numeric | Location |
| longitude | numeric | Location |

**notifications**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Recipient |
| type | text | Notification type |
| title | text | Title |
| message | text | Message body |
| data | jsonb | Additional data |
| read | boolean | Read status |

### 7.2 Storage Buckets

| Bucket | Public | Purpose |
|--------|--------|---------|
| avatars | Yes | User profile pictures |
| product-images | Yes | Product photos |

### 7.3 Caching Strategy

**Client-Side Caching:**
- React Query caches API responses with configurable stale time
- Offline products cached in localStorage (useOfflineProducts hook)
- Recently viewed products stored in localStorage

**No Server-Side Caching:** All caching is client-side via React Query and localStorage.

### 7.4 File Handling

**Image Uploads:**
1. User selects image file
2. File validated for size (max 10MB) and type
3. File uploaded to Supabase Storage
4. Public URL returned and stored in database

**Supported Formats:** JPEG, PNG, WebP, GIF

---

## 8. Configuration & Environment

### 8.1 Environment Variables

**Frontend (Vite - Public):**
```env
VITE_SUPABASE_URL=https://soynuxsibdlgikbpjipr.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIs...
VITE_SUPABASE_PROJECT_ID=soynuxsibdlgikbpjipr
VITE_GOOGLE_MAPS_API_KEY=AIza... (optional, for Maps JavaScript API)
```

**Backend (Supabase Secrets):**
```
GEMINI_API_KEY         - Google AI API key
Google_Map_API_Key     - Google Places/Geocoding (NO referrer restrictions)
ELEVENLABS_API_KEY     - Voice transcription
LOVABLE_API_KEY        - Lovable AI Gateway
SUPABASE_URL           - Auto-configured
SUPABASE_SERVICE_ROLE_KEY - Auto-configured
SUPABASE_ANON_KEY      - Auto-configured
```

### 8.2 Build Setup

**Development:**
```bash
npm install
npm run dev
```

**Production Build:**
```bash
npm run build
npm run preview
```

### 8.3 Required Dependencies

**Core:**
- react ^18.3.1
- react-dom ^18.3.1
- react-router-dom ^6.30.1
- @supabase/supabase-js ^2.76.1
- @tanstack/react-query ^5.83.0

**UI:**
- tailwindcss-animate ^1.0.7
- class-variance-authority ^0.7.1
- lucide-react ^0.462.0
- sonner ^1.7.4
- @radix-ui/* (multiple packages)

**Maps:**
- @react-google-maps/api ^2.20.7

**Utilities:**
- zod ^3.25.76
- date-fns ^4.1.0
- react-hook-form ^7.61.1

### 8.4 Setup Instructions

1. **Clone Repository:**
   ```bash
   git clone <repository-url>
   cd craftbiz
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   - Create `.env` file (auto-generated by Lovable)
   - Add required Supabase secrets via Cloud dashboard

4. **Run Development Server:**
   ```bash
   npm run dev
   ```

5. **Access Application:**
   - Open http://localhost:5173

---

## 9. Security & Permissions

### 9.1 Authentication Flow

```
1. User enters email/password
2. Supabase Auth validates credentials
3. JWT token issued and stored in localStorage
4. Token included in all API requests via Authorization header
5. RLS policies validate token and user permissions
6. Session auto-refreshes before expiry
```

### 9.2 Authorization (Role-Based Access)

**Roles:**
- `buyer`: Can browse, purchase, review products
- `seller`: Can list products, manage orders, access business tools
- `admin`: Full system access (not fully implemented)

**Role Assignment:**
- Role selected during signup
- Stored in `user_roles` table
- Fetched via `useUserRoles` hook
- Components conditionally render based on roles

### 9.3 Row Level Security (RLS) Policies

All tables have RLS enabled with appropriate policies:

**Example Policies:**

**products:**
- Anyone can view active products
- Sellers can only manage their own products

**orders:**
- Buyers can view their own orders
- Sellers can view orders for their products
- Sellers can update order status

**wishlists:**
- Users can only access their own wishlist items

### 9.4 Data Protection Measures

1. **Password Hashing:** Handled by Supabase Auth (bcrypt)
2. **JWT Tokens:** Short-lived, automatically refreshed
3. **HTTPS:** All API calls encrypted in transit
4. **RLS:** Database-level access control
5. **Input Validation:** Zod schemas on all edge functions
6. **CORS Headers:** Configured on all edge functions

### 9.5 Known Security Considerations

1. **API Keys in Edge Functions:** All sensitive keys stored in Supabase secrets
2. **Image Uploads:** No virus scanning implemented
3. **Rate Limiting:** Relies on Supabase default limits
4. **Payment Processing:** Stripe integration partially implemented

---

## 10. Error Handling & Edge Cases

### 10.1 Validation Logic

**Frontend Validation:**
- React Hook Form with Zod schemas
- Real-time validation feedback
- Type-safe form handling

**Backend Validation:**
- Zod schemas on all edge functions
- Validation errors return 400 status
- Specific error messages for each field

### 10.2 Error Messages

| Scenario | Message |
|----------|---------|
| Invalid email | "Please enter a valid email address" |
| Weak password | "Password must be at least 6 characters" |
| Network error | "Network error. Please check your connection." |
| API failure | "Something went wrong. Please try again." |
| Rate limit | "Too many requests. Please wait a moment." |
| Unauthorized | "Please log in to continue" |
| Not found | "The requested resource was not found" |

### 10.3 Failure States

**Network Offline:**
- OfflineIndicator component displays status
- Cached products shown from localStorage
- Pending actions queued for sync

**API Timeout:**
- 30-second timeout
- Error toast displayed
- Retry option provided

**Image Upload Failure:**
- Size limit exceeded: "File too large. Max 10MB"
- Invalid format: "Please upload a valid image"
- Storage error: "Upload failed. Please try again."

### 10.4 Recovery Mechanisms

1. **Auto-Retry:** Failed API calls retry with exponential backoff
2. **Background Sync:** Pending actions synced when online
3. **Session Recovery:** Token auto-refreshes on expiry
4. **Cache Fallback:** Offline mode uses cached data

---

## 11. Limitations & Known Gaps

### 11.1 Intentionally Not Implemented

1. **Native Mobile Apps:** PWA approach only
2. **Multi-language UI:** Interface is English-only (content translation available)
3. **Real-time Chat:** No buyer-seller messaging
4. **Inventory Sync:** No real-time stock updates across sellers

### 11.2 Partially Implemented

1. **Payment Processing:**
   - Stripe integration started but not complete
   - No actual payment flow
   - Order placement works without payment

2. **Shipping Integration:**
   - Manual tracking number entry only
   - No carrier API integration
   - No automated shipping labels

3. **Admin Dashboard:**
   - Admin role exists but no admin interface
   - No moderation tools
   - No analytics dashboard

4. **Email Notifications:**
   - Auth emails work (via Supabase)
   - No transactional emails for orders
   - No marketing emails

5. **Reviews System:**
   - Database structure exists
   - Basic review submission works
   - No review moderation

### 11.3 Requires Future Work

1. **Performance Optimization:**
   - Image lazy loading needs improvement
   - Large product lists need virtualization
   - Bundle size optimization needed

2. **Accessibility:**
   - ARIA labels incomplete
   - Keyboard navigation needs work
   - Screen reader testing needed

3. **Internationalization:**
   - UI strings not externalized
   - RTL languages not supported
   - Currency formatting is basic

4. **Testing:**
   - No unit tests
   - No integration tests
   - No E2E tests

---

## 12. Future Enhancements

### 12.1 Scalability Improvements

1. **Image CDN:** Implement Cloudflare or similar for image delivery
2. **Database Indexing:** Add indexes for common queries
3. **Edge Caching:** Cache static assets at edge locations
4. **Connection Pooling:** Implement PgBouncer for database connections

### 12.2 Feature Expansions

1. **Seller Verification System:**
   - ID verification
   - Craft certification
   - Trust badges

2. **Advanced Analytics:**
   - Sales trends
   - Customer insights
   - Revenue forecasting

3. **Social Features:**
   - Seller following
   - Product sharing
   - Community forums

4. **Logistics Integration:**
   - Shiprocket/Delhivery APIs
   - Automated shipping
   - Package tracking

5. **Multi-vendor Cart:**
   - Split checkout by seller
   - Optimized shipping

### 12.3 UX Improvements

1. **Onboarding Tutorial:**
   - Guided tour for new users
   - Feature highlights
   - Quick-start wizard

2. **Personalization:**
   - Recommended products
   - Saved preferences
   - Custom homepage

3. **Mobile Experience:**
   - Native-like transitions
   - Gesture navigation
   - Haptic feedback

### 12.4 Performance Optimizations

1. **Code Splitting:** Route-based lazy loading
2. **Image Optimization:** WebP format, responsive images
3. **Service Worker:** Enhanced offline capabilities
4. **Preloading:** Critical resource hints

---

## 13. How to Use This Project

### 13.1 Step-by-Step Usage Guide

#### For Sellers (Artisans)

**Step 1: Create Account**
1. Visit the landing page
2. Click "Get Started"
3. Select "Seller" role
4. Enter email and password
5. Click "Sign up"

**Step 2: Create Business Plan**
1. From Dashboard, click "Share Your Idea"
2. Describe your craft business (text, voice, or upload image)
3. Click "Submit Idea"
4. Enter your business name
5. Click "Generate Business Plan"
6. Review your 10-section plan

**Step 3: Create Brand Assets**
1. Navigate to Design Studio
2. Generate logo with your business name
3. Create marketing banners for social media
4. Download and use across platforms

**Step 4: Add Products**
1. Navigate to Seller Dashboard
2. Click "Add Product"
3. Upload product images (up to 5)
4. Enter title, category, price
5. Click "Generate with AI" for description
6. Click "Publish Product"

**Step 5: Manage Orders**
1. View incoming orders in Orders tab
2. Update status as you fulfill
3. Add tracking numbers
4. Mark as delivered

#### For Buyers

**Step 1: Create Account**
1. Visit the landing page
2. Click "Get Started"
3. Select "Buyer" role
4. Complete registration

**Step 2: Browse Products**
1. Explore category chips at top
2. Use search for specific items
3. Apply filters (price, rating)
4. Click products for details

**Step 3: Make Purchase**
1. Add items to cart
2. Open cart drawer
3. Review items and quantities
4. Proceed to checkout
5. Enter shipping address
6. Complete order

**Step 4: Track Orders**
1. Navigate to "My Orders"
2. View order status
3. Track shipment when available

### 13.2 Example Scenarios

**Scenario 1: Potter Launching Online Business**
1. Potter photographs clay products
2. Uploads images to Idea Capture
3. AI analyzes and suggests "Handmade Pottery Business"
4. Generates business plan with Indian market focus
5. Creates logo with traditional motifs
6. Generates Instagram posts for launch
7. Lists products on marketplace
8. Receives first order within a week

**Scenario 2: Buyer Finding Unique Gift**
1. Buyer searches "handmade jewelry for wedding"
2. Filters by price range ₹1000-2500
3. Compares 4 products side-by-side
4. Reads seller stories and reviews
5. Adds chosen item to cart
6. Requests custom engraving via custom order
7. Completes purchase
8. Tracks delivery

**Scenario 3: Artisan Finding Suppliers**
1. Weaver needs quality thread
2. Opens Suppliers & Materials
3. Searches "cotton thread supplier"
4. Enables location sharing
5. Finds nearby dealers sorted by distance
6. Views ratings and contact info
7. Contacts supplier directly

### 13.3 Screens Referenced

| Screen | Route | Purpose |
|--------|-------|---------|
| Landing | / | Public homepage |
| Auth | /auth | Login/Signup |
| Dashboard | /dashboard | Main app interface |
| Forgot Password | /forgot-password | Password reset request |
| Reset Password | /reset-password | Set new password |
| Not Found | * | 404 error page |

---

## Appendix A: Team

| Name | Role | LinkedIn |
|------|------|----------|
| Amirti Shiva | Founder, AI-ML Enthusiast | [Profile](https://www.linkedin.com/in/shiva666/) |
| B. Sandeep Kumar | Co-Founder, AI-ML Enthusiast | [Profile](https://www.linkedin.com/in/b-sandeep-kumar-b56612265/) |
| K. Lathish | Co-Founder, Data Scientist | [Profile](https://www.linkedin.com/in/kotlalathish/) |
| Gottipalli Manoj | Co-Founder, Data Scientist, Frontend Developer | [Profile](https://www.linkedin.com/in/gottipalli-manoj-315a3a260/) |

---

## Appendix B: Technology Stack Summary

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| UI Components | shadcn/ui, Radix UI, Lucide Icons |
| State Management | React Query, React Hooks |
| Routing | React Router v6 |
| Backend | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| AI Services | Google Gemini API |
| Maps | Google Maps/Places API |
| Voice | ElevenLabs API |
| Deployment | Lovable Cloud |

---

## Appendix C: Glossary

| Term | Definition |
|------|------------|
| Artisan | Skilled craftsperson who makes products by hand |
| Edge Function | Serverless function running on Supabase's edge network |
| RLS | Row Level Security - database-level access control |
| PWA | Progressive Web App - web app with native-like features |
| INR | Indian Rupee - currency used throughout the platform |

---

**Document Version:** 1.0.0  
**Last Updated:** January 2026  
**Generated From:** CraftBiz Codebase Analysis
