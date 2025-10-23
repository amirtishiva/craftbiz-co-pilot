# CraftBiz - API Backend Specification

**Version**: 3.0  
**Last Updated**: January 2025  
**Status**: Production Ready

---

## Table of Contents
1. [Overview](#1-overview)
2. [Authentication](#2-authentication)
3. [Business Ideas API](#3-business-ideas-api)
4. [Business Plans API](#4-business-plans-api)
5. [Design Studio API](#5-design-studio-api)
6. [Marketing Hub API](#6-marketing-hub-api)
7. [Suppliers API](#7-suppliers-api)
8. [AI Integration Layer](#8-ai-integration-layer)
9. [Error Handling](#9-error-handling)
10. [Rate Limits & Quotas](#10-rate-limits--quotas)

---

## 1. Overview

### 1.1 Base URLs

```
API Base:           https://[project-ref].supabase.co/rest/v1
Edge Functions:     https://[project-ref].supabase.co/functions/v1
Storage:            https://[project-ref].supabase.co/storage/v1
OpenAI API:         https://api.openai.com/v1
Google Maps API:    https://maps.googleapis.com/maps/api
```

### 1.2 Authentication

All API requests require JWT token authentication:

```http
Authorization: Bearer <JWT_TOKEN>
apikey: <SUPABASE_ANON_KEY>
Content-Type: application/json
```

### 1.3 Standard Response Format

**Success Response**:
```json
{
  "success": true,
  "data": { ... },
  "metadata": {
    "timestamp": "2025-01-23T10:00:00Z",
    "request_id": "uuid"
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  },
  "metadata": {
    "timestamp": "2025-01-23T10:00:00Z",
    "request_id": "uuid"
  }
}
```

### 1.4 HTTP Status Codes

| Code | Meaning | Use Case |
|------|---------|----------|
| `200` | OK | Successful request |
| `201` | Created | Resource created successfully |
| `400` | Bad Request | Invalid input parameters |
| `401` | Unauthorized | Missing or invalid authentication |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `422` | Unprocessable Entity | Validation errors |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server-side error |
| `503` | Service Unavailable | External service unavailable |

---

## 2. Authentication

### 2.1 Sign Up

**Endpoint**: `POST /auth/v1/signup`

**Request**:
```json
{
  "email": "artisan@example.com",
  "password": "SecurePassword123!",
  "options": {
    "data": {
      "full_name": "Rajesh Kumar",
      "business_type": "Handicrafts",
      "language": "en"
    }
  }
}
```

**Response**: `201 Created`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "v1.refresh_token...",
  "expires_in": 3600,
  "token_type": "bearer",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "artisan@example.com",
    "email_confirmed_at": null,
    "created_at": "2025-01-23T10:00:00Z",
    "user_metadata": {
      "full_name": "Rajesh Kumar",
      "business_type": "Handicrafts"
    }
  }
}
```

### 2.2 Sign In

**Endpoint**: `POST /auth/v1/token?grant_type=password`

**Request**:
```json
{
  "email": "artisan@example.com",
  "password": "SecurePassword123!"
}
```

**Response**: `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "v1.refresh_token...",
  "expires_in": 3600,
  "token_type": "bearer",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "artisan@example.com"
  }
}
```

### 2.3 Sign Out

**Endpoint**: `POST /auth/v1/logout`

**Headers**:
```http
Authorization: Bearer <JWT_TOKEN>
```

**Response**: `204 No Content`

### 2.4 Refresh Token

**Endpoint**: `POST /auth/v1/token?grant_type=refresh_token`

**Request**:
```json
{
  "refresh_token": "v1.refresh_token..."
}
```

**Response**: `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "v1.refresh_token...",
  "expires_in": 3600
}
```

---

## 3. Business Ideas API

### 3.1 Create Business Idea

**Endpoint**: `POST /rest/v1/business_ideas`

**Request**:
```json
{
  "content": "I want to create a marketplace for handmade pottery and ceramics, connecting local artisans with urban customers who value authentic craftsmanship.",
  "business_type": "E-commerce",
  "input_method": "text",
  "original_language": "en",
  "product_analysis": null
}
```

**Response**: `201 Created`
```json
{
  "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "content": "I want to create a marketplace for handmade pottery...",
  "business_type": "E-commerce",
  "input_method": "text",
  "original_language": "en",
  "product_analysis": null,
  "created_at": "2025-01-23T10:00:00Z",
  "updated_at": "2025-01-23T10:00:00Z"
}
```

### 3.2 Get User's Business Ideas

**Endpoint**: `GET /rest/v1/business_ideas?user_id=eq.<user_id>&order=created_at.desc`

**Response**: `200 OK`
```json
[
  {
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "content": "Marketplace for handmade pottery...",
    "business_type": "E-commerce",
    "input_method": "text",
    "created_at": "2025-01-23T10:00:00Z"
  },
  {
    "id": "8d7f5680-8536-51fe-b15g-f18gd2g01bf8",
    "content": "Online platform for sustainable textiles...",
    "business_type": "Retail",
    "input_method": "voice",
    "created_at": "2025-01-22T15:30:00Z"
  }
]
```

### 3.3 Get Single Business Idea

**Endpoint**: `GET /rest/v1/business_ideas?id=eq.<idea_id>`

**Response**: `200 OK`
```json
{
  "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "content": "Marketplace for handmade pottery...",
  "business_type": "E-commerce",
  "input_method": "text",
  "original_language": "en",
  "product_analysis": null,
  "created_at": "2025-01-23T10:00:00Z"
}
```

### 3.4 Delete Business Idea

**Endpoint**: `DELETE /rest/v1/business_ideas?id=eq.<idea_id>`

**Response**: `204 No Content`

---

## 4. Business Plans API

### 4.1 Generate Business Plan (Edge Function)

**Endpoint**: `POST /functions/v1/generate-business-plan`

**Request**:
```json
{
  "business_idea": "Marketplace for handmade pottery connecting local artisans with urban customers",
  "business_type": "E-commerce",
  "input_method": "text",
  "product_analysis": null
}
```

**AI Prompt Template**:

```markdown
**Role**: You are an expert business consultant specializing in Indian small businesses and artisan entrepreneurship.

**Context**: 
- The user is an entrepreneur in India looking to start a new business
- Business Type: {{business_type}}
- Input Method: {{input_method}}
- Business Idea: {{business_idea}}
{{#if product_analysis}}
- Product Analysis: {{product_analysis}}
{{/if}}

**Instruction**: Generate a comprehensive, actionable business plan with the following sections:

1. **Executive Summary**: 150-200 words overview
2. **Market Analysis**: Indian market size, trends, target demographics
3. **Business Model**: Revenue streams, pricing, cost structure
4. **Marketing Strategy**: Customer acquisition, digital marketing, local outreach
5. **Operations Planning**: Supply chain, logistics, technology requirements
6. **Financial Projections**: Startup costs, revenue projections (12-36 months)

**Output Format**: Structured JSON with detailed, India-specific insights
```

**Edge Function Implementation**:

```typescript
// supabase/functions/generate-business-plan/index.ts
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { business_idea, business_type, input_method, product_analysis } = await req.json();
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    // Build system prompt
    const systemPrompt = `You are an expert business consultant specializing in Indian small businesses and artisan entrepreneurship. Generate comprehensive, actionable business plans with India-specific market insights.`;

    // Build user prompt
    const userPrompt = `Create a detailed business plan for this ${business_type} business:

Business Idea: ${business_idea}
${product_analysis ? `Product Analysis: ${JSON.stringify(product_analysis)}` : ''}

Generate a comprehensive business plan with these sections:
1. Executive Summary (150-200 words)
2. Market Analysis (Indian market, trends, demographics)
3. Business Model (revenue streams, pricing, costs)
4. Marketing Strategy (customer acquisition, digital & local)
5. Operations Planning (supply chain, logistics, tech)
6. Financial Projections (startup costs, 12-36 month projections)`;

    // Call OpenAI API with function calling for structured output
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5-2025-08-07",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_completion_tokens: 4000,
        tools: [
          {
            type: "function",
            function: {
              name: "generate_business_plan",
              description: "Generate a structured business plan",
              parameters: {
                type: "object",
                properties: {
                  executive_summary: { 
                    type: "string",
                    description: "150-200 word overview of the business"
                  },
                  market_analysis: { 
                    type: "string",
                    description: "Indian market analysis with size, trends, and demographics"
                  },
                  business_model: { 
                    type: "string",
                    description: "Revenue streams, pricing strategy, and cost structure"
                  },
                  marketing_strategy: { 
                    type: "string",
                    description: "Customer acquisition and marketing approach"
                  },
                  operations_planning: { 
                    type: "string",
                    description: "Supply chain, logistics, and operational requirements"
                  },
                  financial_projections: { 
                    type: "string",
                    description: "Startup costs and revenue projections"
                  }
                },
                required: ["executive_summary", "market_analysis", "business_model", "marketing_strategy", "operations_planning", "financial_projections"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: {
          type: "function",
          function: { name: "generate_business_plan" }
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract structured data from function call
    const toolCall = data.choices[0].message.tool_calls[0];
    const planData = JSON.parse(toolCall.function.arguments);

    // Save to Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data: insertedPlan, error: insertError } = await supabaseClient
      .from('business_plans')
      .insert({
        user_id: user.id,
        executive_summary: planData.executive_summary,
        market_analysis: planData.market_analysis,
        business_model: planData.business_model,
        marketing_strategy: planData.marketing_strategy,
        operations_planning: planData.operations_planning,
        financial_projections: planData.financial_projections,
        business_type: business_type,
        input_method: input_method
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return new Response(
      JSON.stringify({ success: true, data: insertedPlan }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    );

  } catch (error) {
    console.error('Error generating business plan:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: {
          code: 'GENERATION_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    );
  }
});
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "9e8f7680-9647-62gf-c26h-g29he3h12cg9",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "executive_summary": "CraftBiz Marketplace connects local Indian artisans...",
    "market_analysis": "The Indian handicrafts market is valued at $4.5 billion...",
    "business_model": "Commission-based marketplace earning 8-12% per transaction...",
    "marketing_strategy": "Social media marketing highlighting artisan stories...",
    "operations_planning": "Three-phase launch: onboard artisans, establish logistics...",
    "financial_projections": "Initial investment: ₹5 lakhs. Break-even: 18 months...",
    "business_type": "E-commerce",
    "created_at": "2025-01-23T10:05:00Z"
  }
}
```

### 4.2 Get Business Plans

**Endpoint**: `GET /rest/v1/business_plans?user_id=eq.<user_id>&order=created_at.desc`

**Response**: `200 OK`
```json
[
  {
    "id": "9e8f7680-9647-62gf-c26h-g29he3h12cg9",
    "executive_summary": "CraftBiz Marketplace connects...",
    "business_type": "E-commerce",
    "created_at": "2025-01-23T10:05:00Z"
  }
]
```

### 4.3 Update Business Plan

**Endpoint**: `PATCH /rest/v1/business_plans?id=eq.<plan_id>`

**Request**:
```json
{
  "executive_summary": "Updated executive summary text...",
  "marketing_strategy": "Revised marketing approach..."
}
```

**Response**: `200 OK`
```json
{
  "id": "9e8f7680-9647-62gf-c26h-g29he3h12cg9",
  "executive_summary": "Updated executive summary text...",
  "marketing_strategy": "Revised marketing approach...",
  "updated_at": "2025-01-23T11:00:00Z"
}
```

---

## 5. Design Studio API

### 5.1 Generate Logo (Edge Function)

**Endpoint**: `POST /functions/v1/generate-logo`

**Request**:
```json
{
  "business_name": "CraftBiz",
  "description": "Modern minimalist logo for handmade crafts marketplace",
  "style": "modern",
  "colors": ["orange", "brown"],
  "industry": "E-commerce"
}
```

**AI Prompt Template**:

```markdown
**Role**: You are a professional graphic designer specializing in brand identity and logo design.

**Context**:
- Business Name: {{business_name}}
- Industry: {{industry}}
- Style Preference: {{style}}
- Color Palette: {{colors}}
- Description: {{description}}

**Instruction**: Create a professional logo that:
- Represents the brand identity and values
- Is scalable and works in various sizes
- Uses the specified color palette
- Follows modern design principles
- Is culturally relevant for Indian audience

**Output**: Generate a {{style}} style logo design with clean lines, professional typography, and the specified colors.
```

**Edge Function Implementation**:

```typescript
// supabase/functions/generate-logo/index.ts
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { decode } from "https://deno.land/std@0.177.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { business_name, description, style, colors, industry } = await req.json();
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    // Build detailed prompt
    const prompt = `Professional ${style} logo design for "${business_name}", a ${industry} business. ${description}. Color palette: ${colors.join(', ')}. Modern, scalable, clean design with Indian cultural relevance. High quality, vector-style illustration.`;

    // Call DALL-E API
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        response_format: "b64_json",
        quality: "hd"
      })
    });

    if (!response.ok) {
      throw new Error(`Image generation failed: ${response.status}`);
    }

    const data = await response.json();
    const imageBase64 = data.data[0].b64_json;

    // Upload to Supabase Storage
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error('User not authenticated');
    }

    const fileName = `logos/${user.id}/${Date.now()}.png`;
    const imageBuffer = decode(imageBase64);

    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('design-assets')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        cacheControl: '3600'
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseClient.storage
      .from('design-assets')
      .getPublicUrl(fileName);

    // Save metadata to database
    const { data: assetData, error: insertError } = await supabaseClient
      .from('design_assets')
      .insert({
        user_id: user.id,
        asset_type: 'logo',
        file_url: publicUrl,
        prompt: prompt,
        metadata: {
          business_name,
          style,
          colors,
          industry
        }
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return new Response(
      JSON.stringify({ success: true, data: assetData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    );

  } catch (error) {
    console.error('Error generating logo:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: {
          code: 'LOGO_GENERATION_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    );
  }
});
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "af9g8791-af58-73hg-d37i-h3aif4i23dha",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "asset_type": "logo",
    "file_url": "https://[project-ref].supabase.co/storage/v1/object/public/design-assets/logos/550e8400/1706003400000.png",
    "prompt": "Professional modern logo design for CraftBiz...",
    "metadata": {
      "business_name": "CraftBiz",
      "style": "modern",
      "colors": ["orange", "brown"],
      "industry": "E-commerce"
    },
    "created_at": "2025-01-23T12:00:00Z"
  }
}
```

### 5.2 Generate Scene (Edge Function)

**Endpoint**: `POST /functions/v1/generate-scene`

**Request**:
```json
{
  "description": "Lifestyle scene with customers browsing handmade pottery in a modern boutique",
  "style": "Photographic",
  "aspect_ratio": "16:9",
  "mood": "warm and inviting"
}
```

**AI Prompt Template**:

```markdown
**Role**: You are a professional photographer and visual content creator.

**Context**:
- Scene Description: {{description}}
- Style: {{style}}
- Aspect Ratio: {{aspect_ratio}}
- Mood: {{mood}}

**Instruction**: Create a high-quality marketing photo that:
- Captures the specified scene authentically
- Maintains {{style}} style photography standards
- Evokes {{mood}} emotional response
- Is suitable for marketing and promotional materials
- Features Indian cultural context when relevant

**Output**: Professional {{aspect_ratio}} {{style}} photograph with excellent lighting and composition.
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "bg0h9802-bg69-84ih-e48j-i4bkg5j34eib",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "asset_type": "scene",
    "file_url": "https://[project-ref].supabase.co/storage/v1/object/public/design-assets/scenes/550e8400/1706004000000.png",
    "description": "Lifestyle scene with customers browsing...",
    "metadata": {
      "style": "Photographic",
      "aspect_ratio": "16:9",
      "mood": "warm and inviting"
    },
    "created_at": "2025-01-23T12:10:00Z"
  }
}
```

### 5.3 Generate Mockup (Edge Function)

**Endpoint**: `POST /functions/v1/generate-mockup`

**Request**:
```json
{
  "logo_id": "af9g8791-af58-73hg-d37i-h3aif4i23dha",
  "product_type": "tshirt",
  "color": "white",
  "view": "front"
}
```

**AI Prompt Template**:

```markdown
**Role**: You are a professional product photographer and mockup designer.

**Context**:
- Product Type: {{product_type}}
- Color: {{color}}
- View: {{view}}
- Logo: [Provided Image]

**Instruction**: Create a realistic product mockup showing:
- The logo professionally applied to the {{product_type}}
- Studio-quality lighting and photography
- {{color}} colored product
- {{view}} view angle
- Professional presentation suitable for e-commerce

**Output**: High-quality product mockup with realistic materials and lighting.
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "ch1i0913-ch7a-95ji-f59k-j5clh6k45fjc",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "asset_type": "mockup",
    "file_url": "https://[project-ref].supabase.co/storage/v1/object/public/design-assets/mockups/550e8400/1706004600000.png",
    "metadata": {
      "logo_id": "af9g8791-af58-73hg-d37i-h3aif4i23dha",
      "product_type": "tshirt",
      "color": "white",
      "view": "front"
    },
    "created_at": "2025-01-23T12:20:00Z"
  }
}
```

---

## 6. Marketing Hub API

### 6.1 Generate Marketing Content (Edge Function)

**Endpoint**: `POST /functions/v1/generate-marketing-content`

**Request**:
```json
{
  "platform": "instagram",
  "audience": "millennials",
  "campaign_focus": "Supporting local artisans and sustainable fashion",
  "tone": "inspirational",
  "business_context": "Handmade crafts marketplace"
}
```

**AI Prompt Template**:

```markdown
**Role**: You are an expert social media marketer and copywriter specializing in {{platform}} content.

**Context**:
- Platform: {{platform}}
- Target Audience: {{audience}}
- Campaign Focus: {{campaign_focus}}
- Tone: {{tone}}
- Business: {{business_context}}

**Instruction**: Create engaging {{platform}} content that:
- Resonates with {{audience}} audience
- Communicates {{campaign_focus}} effectively
- Uses {{tone}} tone and voice
- Follows {{platform}} best practices and character limits
- Includes relevant hashtags for discoverability
- Drives engagement and action

**Output Format**:
{
  "content": "Main post content",
  "hashtags": ["#tag1", "#tag2", ...],
  "call_to_action": "CTA text"
}
```

**Edge Function Implementation**:

```typescript
// supabase/functions/generate-marketing-content/index.ts
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Platform character limits
const platformLimits: Record<string, number> = {
  facebook: 63206,
  instagram: 2200,
  twitter: 280,
  linkedin: 3000,
  pinterest: 500
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { platform, audience, campaign_focus, tone, business_context } = await req.json();
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    const characterLimit = platformLimits[platform] || 2000;

    const systemPrompt = `You are an expert social media marketer specializing in ${platform} content creation. Generate engaging, authentic content that drives meaningful engagement.`;

    const userPrompt = `Create ${platform} content for ${audience} audience about "${campaign_focus}".

Business Context: ${business_context}
Tone: ${tone}
Character Limit: ${characterLimit}

Requirements:
- Write compelling copy that resonates with ${audience}
- Include relevant hashtags (5-10 for Instagram, 2-3 for others)
- Add a clear call-to-action
- Stay within character limit
- Use emojis appropriately for the platform`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5-mini-2025-08-07",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_completion_tokens: 800,
        tools: [
          {
            type: "function",
            function: {
              name: "generate_marketing_content",
              description: "Generate platform-optimized marketing content",
              parameters: {
                type: "object",
                properties: {
                  content: { 
                    type: "string",
                    description: "Main post content with emojis and formatting"
                  },
                  hashtags: { 
                    type: "array",
                    items: { type: "string" },
                    description: "Relevant hashtags for the post"
                  },
                  call_to_action: { 
                    type: "string",
                    description: "Clear call-to-action for the audience"
                  }
                },
                required: ["content", "hashtags", "call_to_action"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: {
          type: "function",
          function: { name: "generate_marketing_content" }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices[0].message.tool_calls[0];
    const contentData = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          platform,
          content: contentData.content,
          hashtags: contentData.hashtags,
          call_to_action: contentData.call_to_action,
          character_count: contentData.content.length,
          character_limit: characterLimit
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    );

  } catch (error) {
    console.error('Error generating marketing content:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: {
          code: 'CONTENT_GENERATION_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    );
  }
});
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "platform": "instagram",
    "content": "🎨 Behind every handcrafted piece is an artisan's story ✨\n\nMeet Radha from Rajasthan, whose pottery has been passed down through generations. When you buy from our platform, you're not just getting beautiful ceramics - you're supporting a family tradition and helping preserve ancient techniques.\n\nThis is what authentic craftsmanship looks like 🏺\n\nSwipe to see more of Radha's incredible work →",
    "hashtags": [
      "#HandmadeCrafts",
      "#LocalArtisans",
      "#SupportLocal",
      "#SustainableFashion",
      "#IndianHandicrafts",
      "#ArtisanStories",
      "#CraftBiz",
      "#MakeInIndia"
    ],
    "call_to_action": "Shop authentic. Shop local. Link in bio 🔗",
    "character_count": 387,
    "character_limit": 2200
  }
}
```

---

## 7. Suppliers API

### 7.1 Search Nearby Dealers (Edge Function)

**Endpoint**: `POST /functions/v1/nearby-dealers-search`

**Request**:
```json
{
  "query": "fabric stores",
  "location": {
    "lat": 19.0760,
    "lng": 72.8777
  },
  "radius": 5000,
  "type": "store"
}
```

**Edge Function Implementation**:

```typescript
// supabase/functions/nearby-dealers-search/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, location, radius, type } = await req.json();
    const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');

    // Google Places API Nearby Search
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
      `location=${location.lat},${location.lng}&` +
      `radius=${radius}&` +
      `keyword=${encodeURIComponent(query)}&` +
      `${type ? `type=${type}&` : ''}` +
      `key=${GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(placesUrl);
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API error: ${data.status}`);
    }

    // Calculate distances and transform results
    const dealers = (data.results || []).map((place: any) => {
      const distance = calculateDistance(
        location,
        { lat: place.geometry.location.lat, lng: place.geometry.location.lng }
      );

      return {
        id: place.place_id,
        name: place.name,
        address: place.vicinity,
        coordinates: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng
        },
        rating: place.rating || 0,
        reviews: place.user_ratings_total || 0,
        category: place.types?.[0] || 'general',
        open_now: place.opening_hours?.open_now,
        distance: distance,
        distance_text: `${distance.toFixed(1)} km`,
        photo_reference: place.photos?.[0]?.photo_reference
      };
    });

    // Sort by distance
    dealers.sort((a, b) => a.distance - b.distance);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          dealers,
          total: dealers.length,
          query_location: location,
          search_radius: radius
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    );

  } catch (error) {
    console.error('Error searching nearby dealers:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: {
          code: 'SEARCH_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    );
  }
});

function calculateDistance(point1: any, point2: any): number {
  const R = 6371; // Earth radius in km
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLng = (point2.lng - point1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "dealers": [
      {
        "id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
        "name": "Mumbai Fabric House",
        "address": "123 Kalbadevi Road, Mumbai",
        "coordinates": {
          "lat": 19.0775,
          "lng": 72.8779
        },
        "rating": 4.5,
        "reviews": 234,
        "category": "store",
        "open_now": true,
        "distance": 0.3,
        "distance_text": "0.3 km",
        "photo_reference": "CmRaAAAA..."
      }
    ],
    "total": 15,
    "query_location": {
      "lat": 19.0760,
      "lng": 72.8777
    },
    "search_radius": 5000
  }
}
```

### 7.2 Get Dealer Details (Edge Function)

**Endpoint**: `POST /functions/v1/dealer-details`

**Request**:
```json
{
  "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4"
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
    "name": "Mumbai Fabric House",
    "formatted_address": "123 Kalbadevi Road, Mumbai, Maharashtra 400002",
    "phone": "+91 22 2345 6789",
    "website": "https://mumbaifabrichouse.com",
    "rating": 4.5,
    "reviews": 234,
    "opening_hours": {
      "open_now": true,
      "weekday_text": [
        "Monday: 9:00 AM – 8:00 PM",
        "Tuesday: 9:00 AM – 8:00 PM",
        "..."
      ]
    },
    "photos": ["photo_url_1", "photo_url_2"],
    "reviews_sample": [
      {
        "author_name": "Priya Sharma",
        "rating": 5,
        "text": "Excellent variety of fabrics...",
        "time": "2025-01-20"
      }
    ]
  }
}
```

### 7.3 Get Directions (Edge Function)

**Endpoint**: `POST /functions/v1/get-directions`

**Request**:
```json
{
  "origin": {
    "lat": 19.0760,
    "lng": 72.8777
  },
  "destination": {
    "lat": 19.0775,
    "lng": 72.8779
  },
  "mode": "driving"
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "distance": "0.3 km",
    "duration": "2 mins",
    "steps": [
      {
        "instruction": "Head north on Street Name",
        "distance": "150 m",
        "duration": "1 min"
      }
    ],
    "polyline": "encoded_polyline_string",
    "google_maps_url": "https://www.google.com/maps/dir/?api=1&origin=19.0760,72.8777&destination=19.0775,72.8779"
  }
}
```

---

## 8. AI Integration Layer

### 8.1 AI Prompt Templates

All AI interactions follow a structured prompt format:

#### Template Structure

```markdown
**Role**: [AI's specialized role and expertise]

**Context**: 
- [Key business context]
- [User-specific details]
- [Relevant constraints]

**Instruction**: [Clear, specific task description]

**Output Format**: [Expected structure of response]
```

#### Example: Business Plan Generation

```typescript
const businessPlanPrompt = {
  role: "You are an expert business consultant specializing in Indian small businesses and artisan entrepreneurship with 15 years of experience.",
  
  context: `
    - Business Type: ${businessType}
    - Target Market: Indian consumers
    - Business Idea: ${businessIdea}
    ${productAnalysis ? `- Product Analysis: ${JSON.stringify(productAnalysis)}` : ''}
  `,
  
  instruction: `
    Generate a comprehensive, actionable business plan optimized for the Indian market.
    
    Include:
    1. Executive Summary (150-200 words)
    2. Market Analysis (Indian market size, trends, demographics)
    3. Business Model (revenue streams, pricing, cost structure)
    4. Marketing Strategy (digital + offline channels for India)
    5. Operations Planning (supply chain, logistics, technology)
    6. Financial Projections (startup costs, 12-36 month revenue projections in INR)
    
    Use India-specific insights, cultural context, and local market data.
  `,
  
  outputFormat: "Structured JSON with detailed sections"
};
```

### 8.2 Model Selection Matrix

| Use Case | Model | Reasoning |
|----------|-------|-----------|
| Business Plan Generation | `gpt-5-2025-08-07` | Complex reasoning, long-form content |
| Marketing Content | `gpt-5-mini-2025-08-07` | Balanced quality and speed |
| Language Detection | `gpt-5-nano-2025-08-07` | Simple classification task |
| Translation | `gpt-5-mini-2025-08-07` | Quality translation needed |
| Voice Transcription | `whisper-1` | Specialized audio model |
| Image Analysis | `gpt-4o` | Vision capabilities required |
| Logo Generation | `gpt-image-1` | Image generation |

### 8.3 Token Management

**Text Generation**:
- Business Plans: 4000 max tokens
- Marketing Content: 800 max tokens
- Translations: 500 max tokens

**Image Generation**:
- Logos: 1024x1024 (HD quality)
- Scenes: Variable (1024x1024, 1792x1024, 1024x1792)
- Mockups: 1024x1024

---

## 9. Error Handling

### 9.1 Error Codes

| Code | Description | HTTP Status | Retry Strategy |
|------|-------------|-------------|----------------|
| `AUTH_REQUIRED` | Missing authentication | 401 | Redirect to login |
| `AUTH_INVALID` | Invalid token | 401 | Refresh token |
| `PERMISSION_DENIED` | Insufficient permissions | 403 | Show error message |
| `NOT_FOUND` | Resource doesn't exist | 404 | None |
| `VALIDATION_ERROR` | Input validation failed | 422 | Fix input and retry |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 | Exponential backoff |
| `AI_SERVICE_ERROR` | OpenAI API error | 500 | Retry after delay |
| `STORAGE_ERROR` | Supabase storage error | 500 | Retry once |
| `DATABASE_ERROR` | Database operation failed | 500 | Retry once |
| `EXTERNAL_API_ERROR` | Google Maps API error | 503 | Retry with backoff |

### 9.2 Error Response Examples

**Validation Error**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input validation failed",
    "details": {
      "field": "business_idea",
      "issue": "Must be at least 10 characters"
    }
  }
}
```

**Rate Limit Error**:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again later.",
    "details": {
      "retry_after": 60,
      "limit": 100,
      "window": "1 hour"
    }
  }
}
```

**AI Service Error**:
```json
{
  "success": false,
  "error": {
    "code": "AI_SERVICE_ERROR",
    "message": "Content generation failed",
    "details": {
      "provider": "OpenAI",
      "model": "gpt-5-2025-08-07",
      "reason": "Service temporarily unavailable"
    }
  }
}
```

---

## 10. Rate Limits & Quotas

### 10.1 Supabase Rate Limits

| Resource | Free Tier | Paid Tier |
|----------|-----------|-----------|
| API Requests | 500/min | Unlimited |
| Storage Uploads | 50MB/min | 200MB/min |
| Edge Functions | 500K invocations/month | Unlimited |
| Database Connections | 60 concurrent | 200+ concurrent |

### 10.2 OpenAI Rate Limits

| Model | Requests/min | Tokens/min |
|-------|--------------|------------|
| GPT-5 | 500 | 150,000 |
| GPT-5 Mini | 1000 | 200,000 |
| GPT-5 Nano | 2000 | 400,000 |
| GPT-Image-1 | 50 | N/A |

### 10.3 Google Maps Rate Limits

| API | Requests/day (Free) | Requests/day (Paid) |
|-----|---------------------|---------------------|
| Places API | 0 | 300,000 |
| Geocoding | 40,000 | Unlimited |
| Directions | 40,000 | Unlimited |
| Distance Matrix | 40,000 | Unlimited |

**Note**: Google provides $200 free monthly credit.

---

## 11. Versioning & Changelog

**Current Version**: 3.0  
**API Version**: `v1`

### Changelog

**v3.0** (January 2025)
- Complete API documentation overhaul
- Added structured AI prompt templates
- Comprehensive error handling documentation
- Added Local Dealers search functionality
- Enhanced security and validation

**v2.0** (December 2024)
- Added Design Studio APIs
- Implemented Marketing Hub
- Enhanced input pipeline
- Added voice and image support

**v1.0** (November 2024)
- Initial release
- Basic authentication
- Business plan generation
- Text input support

---

**End of API Backend Specification**