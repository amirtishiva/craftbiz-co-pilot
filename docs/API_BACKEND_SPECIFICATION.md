# CraftBiz - API & Backend Specification

## Table of Contents
1. [Overview](#1-overview)
2. [Authentication API](#2-authentication-api)
3. [Business Ideas API](#3-business-ideas-api)
4. [Business Plans API](#4-business-plans-api)
5. [Design Studio API](#5-design-studio-api)
6. [Marketing Hub API](#6-marketing-hub-api)
7. [Suppliers API](#7-suppliers-api)
8. [File Upload API](#8-file-upload-api)
9. [Edge Functions](#9-edge-functions)
10. [Database Functions](#10-database-functions)
11. [Webhooks](#11-webhooks)
12. [Error Handling](#12-error-handling)

---

## 1. Overview

### 1.1 Base URL
```
Production: https://[project-ref].supabase.co
Edge Functions: https://[project-ref].supabase.co/functions/v1
Storage: https://[project-ref].supabase.co/storage/v1
```

### 1.2 Authentication
All API requests (except auth endpoints) require authentication via JWT token:

```http
Authorization: Bearer <JWT_TOKEN>
```

### 1.3 Standard Response Format

#### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { ... }
  }
}
```

### 1.4 HTTP Status Codes
- `200 OK`: Successful GET/PUT/PATCH
- `201 Created`: Successful POST
- `204 No Content`: Successful DELETE
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Missing or invalid auth
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation error
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

## 2. Authentication API

### 2.1 User Registration

**Endpoint**: `POST /auth/v1/signup`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "options": {
    "emailRedirectTo": "https://app.craftbiz.com/",
    "data": {
      "full_name": "John Doe"
    }
  }
}
```

**Response**: `201 Created`
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2025-10-03T10:00:00Z"
  }
}
```

**Database Trigger**: Automatically creates profile record
```sql
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  
  insert into public.user_roles (user_id, role)
  values (new.id, 'user');
  
  return new;
end;
$$ language plpgsql security definer;
```

### 2.2 User Login

**Endpoint**: `POST /auth/v1/token?grant_type=password`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response**: `200 OK`
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "...",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

### 2.3 Token Refresh

**Endpoint**: `POST /auth/v1/token?grant_type=refresh_token`

**Request Body**:
```json
{
  "refresh_token": "..."
}
```

**Response**: `200 OK`
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "..."
}
```

### 2.4 Logout

**Endpoint**: `POST /auth/v1/logout`

**Headers**: `Authorization: Bearer <token>`

**Response**: `204 No Content`

### 2.5 Get Current User

**Endpoint**: `GET /auth/v1/user`

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "user_metadata": {
    "full_name": "John Doe"
  }
}
```

---

## 3. Business Ideas API

### 3.1 Create Business Idea

**Endpoint**: `POST /rest/v1/business_ideas`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
Prefer: return=representation
```

**Request Body**:
```json
{
  "original_content": "मैं अपने शहर में हस्तशिल्प के लिए एक ऑनलाइन मार्केटप्लेस शुरू करना चाहता हूं",
  "original_language": "hi",
  "english_content": "I want to start an online marketplace for handicrafts in my city",
  "business_type": "E-commerce",
  "input_method": "text",
  "is_from_document": false
}
```

**Response**: `201 Created`
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "original_content": "...",
  "original_language": "hi",
  "english_content": "...",
  "business_type": "E-commerce",
  "input_method": "text",
  "is_from_document": false,
  "created_at": "2025-10-03T10:00:00Z",
  "updated_at": "2025-10-03T10:00:00Z"
}
```

### 3.2 Get User's Business Ideas

**Endpoint**: `GET /rest/v1/business_ideas`

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `select`: Columns to return (default: `*`)
- `order`: Sort order (e.g., `created_at.desc`)
- `limit`: Number of results (default: 50)
- `offset`: Pagination offset

**Example Request**:
```
GET /rest/v1/business_ideas?select=*&order=created_at.desc&limit=10
```

**Response**: `200 OK`
```json
[
  {
    "id": "uuid",
    "original_content": "...",
    "english_content": "...",
    "business_type": "E-commerce",
    "created_at": "2025-10-03T10:00:00Z"
  }
]
```

### 3.3 Get Single Business Idea

**Endpoint**: `GET /rest/v1/business_ideas?id=eq.{id}`

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```json
[
  {
    "id": "uuid",
    "original_content": "...",
    "english_content": "...",
    "business_type": "E-commerce",
    "created_at": "2025-10-03T10:00:00Z"
  }
]
```

### 3.4 Update Business Idea

**Endpoint**: `PATCH /rest/v1/business_ideas?id=eq.{id}`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
Prefer: return=representation
```

**Request Body**:
```json
{
  "english_content": "Updated business idea description"
}
```

**Response**: `200 OK`

### 3.5 Delete Business Idea

**Endpoint**: `DELETE /rest/v1/business_ideas?id=eq.{id}`

**Headers**: `Authorization: Bearer <token>`

**Response**: `204 No Content`

---

## 4. Business Plans API

### 4.1 Create Business Plan

**Endpoint**: `POST /functions/v1/generate-business-plan`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "idea_id": "uuid",
  "business_idea": "Online marketplace for handicrafts",
  "business_type": "E-commerce",
  "language": "en"
}
```

**Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "executive_summary": "...",
    "business_description": "...",
    "market_analysis": {
      "target_market": "...",
      "competition": "...",
      "market_size": "..."
    },
    "business_model": "...",
    "financial_projections": {
      "startup_costs": 50000,
      "monthly_expenses": 10000,
      "revenue_projections": [5000, 8000, 12000, ...],
      "break_even_point": 12
    },
    "marketing_strategy": "...",
    "operations": "..."
  }
}
```

**Edge Function Implementation**:
```typescript
import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { business_idea, business_type, language } = await req.json();
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const systemPrompt = `You are a business consultant creating comprehensive business plans.`;
    
    const userPrompt = `Generate a detailed business plan for:
Business Idea: ${business_idea}
Business Type: ${business_type}

Create a complete business plan with:
1. Executive Summary
2. Business Description
3. Market Analysis (target market, competition, market size)
4. Business Model
5. Financial Projections (startup costs, monthly expenses, revenue projections for 24 months, break-even point)
6. Marketing Strategy
7. Operations Plan

Return the response as a JSON object with these fields.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 4000,
        tools: [{
          type: "function",
          function: {
            name: "generate_business_plan",
            description: "Generate a structured business plan",
            parameters: {
              type: "object",
              properties: {
                executive_summary: { type: "string" },
                business_description: { type: "string" },
                market_analysis: {
                  type: "object",
                  properties: {
                    target_market: { type: "string" },
                    competition: { type: "string" },
                    market_size: { type: "string" }
                  }
                },
                business_model: { type: "string" },
                financial_projections: {
                  type: "object",
                  properties: {
                    startup_costs: { type: "number" },
                    monthly_expenses: { type: "number" },
                    revenue_projections: {
                      type: "array",
                      items: { type: "number" }
                    },
                    break_even_point: { type: "number" }
                  }
                },
                marketing_strategy: { type: "string" },
                operations: { type: "string" }
              },
              required: [
                "executive_summary",
                "business_description",
                "market_analysis",
                "business_model",
                "financial_projections",
                "marketing_strategy",
                "operations"
              ]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_business_plan" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add funds to your OpenAI account." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const planData = JSON.parse(
      data.choices[0].message.tool_calls[0].function.arguments
    );

    return new Response(
      JSON.stringify({ success: true, data: planData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating business plan:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: { message: error.message } 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

### 4.2 Get Business Plans

**Endpoint**: `GET /rest/v1/business_plans`

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `select`: Columns (default: `*`)
- `order`: Sort order
- `limit`: Results per page
- `offset`: Pagination

**Response**: `200 OK`
```json
[
  {
    "id": "uuid",
    "idea_id": "uuid",
    "executive_summary": "...",
    "status": "completed",
    "created_at": "2025-10-03T10:00:00Z"
  }
]
```

### 4.3 Update Business Plan

**Endpoint**: `PATCH /rest/v1/business_plans?id=eq.{id}`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "executive_summary": "Updated summary",
  "marketing_strategy": "Updated strategy"
}
```

**Response**: `200 OK`

### 4.4 Export Business Plan to PDF

**Endpoint**: `POST /functions/v1/export-business-plan-pdf`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "plan_id": "uuid"
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "pdf_url": "https://[project].supabase.co/storage/v1/object/public/business-documents/..."
}
```

---

## 5. Design Studio API

### 5.1 Generate Logo

**Endpoint**: `POST /functions/v1/generate-logo`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "business_plan_id": "uuid",
  "prompt": "Modern, minimalist logo for handicraft marketplace with vibrant colors",
  "style": "modern",
  "colors": ["#FF6B35", "#004E89"]
}
```

**Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "asset_type": "logo",
    "file_url": "https://...",
    "file_path": "user-id/logos/logo-uuid.png",
    "image_base64": "data:image/png;base64,...",
    "created_at": "2025-10-03T10:00:00Z"
  }
}
```

**Edge Function Implementation (OpenAI DALL-E)**:
```typescript
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { business_plan_id, prompt, style } = await req.json();
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const enhancedPrompt = `Create a professional ${style || 'modern'} logo: ${prompt}. High quality, vector style, transparent background, suitable for business branding.`;

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: enhancedPrompt,
        n: 1,
        size: '1024x1024',
        background: 'transparent',
        output_format: 'png',
        quality: 'high'
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const imageBase64 = data.data[0].b64_json;

    // Upload to Supabase Storage
    const fileName = `${crypto.randomUUID()}.png`;
    const filePath = `${userId}/logos/${fileName}`;
    
    // Store in design_assets table
    // Return response with file URL and base64

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: { 
          image_base64: `data:image/png;base64,${imageBase64}`,
          file_path: filePath 
        } 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating logo:', error);
    return new Response(
      JSON.stringify({ success: false, error: { message: error.message } }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

### 5.2 Generate Scene/Background

**Endpoint**: `POST /functions/v1/generate-scene`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "business_plan_id": "uuid",
  "template": "office-workspace",
  "custom_prompt": "Cozy artisan workshop with natural lighting and handmade products",
  "aspect_ratio": "16:9",
  "style": "realistic"
}
```

**Templates**:
- `office-workspace`
- `retail-store`
- `restaurant-interior`
- `workshop-studio`
- `custom` (requires custom_prompt)

**Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "asset_type": "scene",
    "file_url": "https://...",
    "image_base64": "data:image/png;base64,...",
    "template": "office-workspace"
  }
}
```

**Edge Function Implementation (OpenAI DALL-E)**:
```typescript
serve(async (req) => {
  try {
    const { template, custom_prompt, aspect_ratio, style } = await req.json();
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    const templatePrompts = {
      'office-workspace': 'Modern professional office workspace with natural lighting',
      'retail-store': 'Attractive retail store interior with product displays',
      'restaurant-interior': 'Elegant restaurant interior with ambient lighting',
      'workshop-studio': 'Creative workshop studio with artisan tools and materials'
    };
    
    const basePrompt = custom_prompt || templatePrompts[template];
    const finalPrompt = `${basePrompt}. ${style || 'Photorealistic'} style, high quality, professional photography.`;
    
    const sizeMap = {
      '16:9': '1792x1024',
      '1:1': '1024x1024',
      '9:16': '1024x1792'
    };

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: finalPrompt,
        n: 1,
        size: sizeMap[aspect_ratio] || '1024x1024',
        output_format: 'png',
        quality: 'high'
      }),
    });

    const data = await response.json();
    const imageBase64 = data.data[0].b64_json;

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: { image_base64: `data:image/png;base64,${imageBase64}` } 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: { message: error.message } }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

### 5.3 Generate Product Mockup

**Endpoint**: `POST /functions/v1/generate-mockup`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "business_plan_id": "uuid",
  "product_type": "packaging",
  "brand_name": "CraftMarket",
  "description": "Eco-friendly packaging for handmade products",
  "mockup_style": "t-shirt" 
}
```

**Product Types / Mockup Styles**:
- `t-shirt`
- `mug`
- `phone-case`
- `tote-bag`
- `packaging`
- `business-card`
- `poster`

**Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "asset_type": "mockup",
    "file_url": "https://...",
    "image_base64": "data:image/png;base64,...",
    "mockup_style": "t-shirt"
  }
}
```

**Edge Function Implementation (OpenAI DALL-E)**:
```typescript
serve(async (req) => {
  try {
    const { product_type, brand_name, description, mockup_style } = await req.json();
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    const prompt = `Professional product mockup of a ${mockup_style || product_type} featuring "${brand_name}" branding. ${description}. High quality, realistic product photography, clean background, professional lighting.`;

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        output_format: 'png',
        quality: 'high'
      }),
    });

    const data = await response.json();
    const imageBase64 = data.data[0].b64_json;

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: { image_base64: `data:image/png;base64,${imageBase64}` } 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: { message: error.message } }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

### 5.4 Get Design Assets

**Endpoint**: `GET /rest/v1/design_assets`

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `business_plan_id`: Filter by business plan
- `asset_type`: Filter by type (logo, scene, mockup)

**Response**: `200 OK`
```json
[
  {
    "id": "uuid",
    "asset_type": "logo",
    "file_url": "https://...",
    "created_at": "2025-10-03T10:00:00Z"
  }
]
```

### 5.5 Delete Design Asset

**Endpoint**: `DELETE /rest/v1/design_assets?id=eq.{id}`

**Headers**: `Authorization: Bearer <token>`

**Response**: `204 No Content`

**Storage Cleanup**: Trigger deletes file from storage
```sql
create function public.delete_design_asset_file()
returns trigger as $$
begin
  perform storage.delete_object('design-assets', old.file_path);
  return old;
end;
$$ language plpgsql security definer;
```

---

## 6. Marketing Hub API

### 6.1 Generate Marketing Content

**Endpoint**: `POST /functions/v1/generate-marketing-content`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "business_plan_id": "uuid",
  "platform": "instagram",
  "content_type": "post",
  "business_name": "CraftMarket",
  "business_description": "Online marketplace for handmade crafts",
  "tone": "friendly",
  "target_audience": "craft enthusiasts aged 25-45"
}
```

**Platforms**:
- `facebook`
- `instagram`
- `twitter`
- `linkedin`
- `email`

**Content Types**:
- `post`
- `ad`
- `email`
- `blog`

**Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "platform": "instagram",
    "content": "Discover unique handmade crafts...",
    "hashtags": [
      "#handmade",
      "#crafts",
      "#artisan",
      "#supportlocal",
      "#shopsmall"
    ],
    "character_count": 145,
    "created_at": "2025-10-03T10:00:00Z"
  }
}
```

**Edge Function Implementation (OpenAI GPT)**:
```typescript
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { platform, content_type, business_name, business_description, tone, target_audience } = await req.json();
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }
    
    const platformLimits = {
      instagram: 2200,
      twitter: 280,
      facebook: 63206,
      linkedin: 3000
    };
    
    const characterLimit = platformLimits[platform] || 500;
    
    const prompt = `Create ${content_type} content for ${platform}:
Business: ${business_name}
Description: ${business_description}
Tone: ${tone}
Target Audience: ${target_audience}
Character Limit: ${characterLimit}

Generate:
1. Engaging content (within character limit)
2. 5-10 relevant hashtags
3. Clear call-to-action

Return as JSON with fields: content, hashtags (array)`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { role: 'system', content: 'You are a social media marketing expert creating engaging content.' },
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: 1000,
        tools: [{
          type: "function",
          function: {
            name: "generate_marketing_content",
            parameters: {
              type: "object",
              properties: {
                content: { type: "string" },
                hashtags: { type: "array", items: { type: "string" } }
              },
              required: ["content", "hashtags"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_marketing_content" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded" }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.tool_calls[0].function.arguments);

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating marketing content:', error);
    return new Response(
      JSON.stringify({ success: false, error: { message: error.message } }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

### 6.2 Get Marketing Content

**Endpoint**: `GET /rest/v1/marketing_content`

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `business_plan_id`: Filter by business plan
- `platform`: Filter by platform
- `status`: Filter by status

**Response**: `200 OK`

### 6.3 Update Marketing Content

**Endpoint**: `PATCH /rest/v1/marketing_content?id=eq.{id}`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "content": "Updated content",
  "scheduled_at": "2025-10-10T14:00:00Z",
  "status": "scheduled"
}
```

**Response**: `200 OK`

### 6.4 Delete Marketing Content

**Endpoint**: `DELETE /rest/v1/marketing_content?id=eq.{id}`

**Headers**: `Authorization: Bearer <token>`

**Response**: `204 No Content`

---

## 7. Suppliers API

### 7.1 Search Suppliers

**Endpoint**: `GET /rest/v1/suppliers`

**Headers**: `Authorization: Bearer <token>` (optional - public access allowed)

**Query Parameters**:
- `category`: Filter by category (e.g., `eq.Packaging Materials`)
- `location`: Filter by location (e.g., `ilike.%Mumbai%`)
- `verified`: Filter verified suppliers (e.g., `eq.true`)
- `limit`: Results per page
- `offset`: Pagination

**Example Request**:
```
GET /rest/v1/suppliers?category=eq.Packaging Materials&location=ilike.%Mumbai%&verified=eq.true&limit=20
```

**Response**: `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "EcoPack India",
    "category": "Packaging Materials",
    "description": "Sustainable packaging solutions",
    "location": "Mumbai, Maharashtra",
    "coordinates": {
      "type": "Point",
      "coordinates": [72.8777, 19.0760]
    },
    "contact_email": "info@ecopack.in",
    "contact_phone": "+91-22-12345678",
    "website": "https://ecopack.in",
    "rating": 4.5,
    "verified": true
  }
]
```

### 7.2 Get Supplier Details

**Endpoint**: `GET /rest/v1/suppliers?id=eq.{id}`

**Response**: `200 OK`

### 7.3 Get Suppliers by Location (Geospatial)

**Endpoint**: `POST /rest/v1/rpc/suppliers_near_location`

**Request Body**:
```json
{
  "lat": 19.0760,
  "lng": 72.8777,
  "radius_km": 50,
  "category": "Packaging Materials"
}
```

**Database Function**:
```sql
create or replace function suppliers_near_location(
  lat double precision,
  lng double precision,
  radius_km double precision,
  category text default null
)
returns setof suppliers
language sql
stable
as $$
  select *
  from suppliers
  where 
    st_dwithin(
      coordinates::geography,
      st_makepoint(lng, lat)::geography,
      radius_km * 1000
    )
    and (category is null or suppliers.category = category)
  order by 
    st_distance(
      coordinates::geography,
      st_makepoint(lng, lat)::geography
    );
$$;
```

**Response**: `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "EcoPack India",
    "category": "Packaging Materials",
    "location": "Mumbai, Maharashtra",
    "distance_km": 5.2
  }
]
```

### 7.4 Create Supplier (Admin Only)

**Endpoint**: `POST /rest/v1/suppliers`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "EcoPack India",
  "category": "Packaging Materials",
  "description": "Sustainable packaging solutions",
  "location": "Mumbai, Maharashtra",
  "coordinates": "POINT(72.8777 19.0760)",
  "contact_email": "info@ecopack.in",
  "contact_phone": "+91-22-12345678",
  "website": "https://ecopack.in",
  "verified": true
}
```

**RLS Policy**: Only admins can insert
```sql
create policy "Admins can insert suppliers"
  on suppliers for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'admin'));
```

**Response**: `201 Created`

### 7.5 Google Maps Integration APIs

#### 7.5.1 Initialize Interactive Map (Google Maps JavaScript API)

**Purpose**: Embed interactive maps displaying suppliers, user location, routes, and custom markers.

**Frontend Implementation**:
```typescript
// Load Google Maps JavaScript API
const initMap = (containerId: string, center: { lat: number; lng: number }) => {
  const map = new google.maps.Map(document.getElementById(containerId), {
    center: center,
    zoom: 12,
    mapId: 'YOUR_MAP_ID'
  });
  
  return map;
};

// Add supplier markers
const addSupplierMarker = (map: google.maps.Map, supplier: Supplier) => {
  const marker = new google.maps.Marker({
    position: { lat: supplier.lat, lng: supplier.lng },
    map: map,
    title: supplier.name,
    icon: {
      url: '/supplier-pin.png',
      scaledSize: new google.maps.Size(40, 40)
    }
  });
  
  const infoWindow = new google.maps.InfoWindow({
    content: `
      <div>
        <h3>${supplier.name}</h3>
        <p>${supplier.category}</p>
        <p>Rating: ${supplier.rating} ⭐</p>
      </div>
    `
  });
  
  marker.addListener('click', () => {
    infoWindow.open(map, marker);
  });
};
```

**Environment Variable Required**: `VITE_GOOGLE_MAPS_API_KEY`

---

#### 7.5.2 Geocode Supplier Address (Geocoding API)

**Endpoint**: `POST /functions/v1/geocode-address`

**Purpose**: Convert supplier addresses to latitude/longitude coordinates.

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "address": "123 Main Street, Mumbai, Maharashtra, India"
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "latitude": 19.0760,
    "longitude": 72.8777,
    "formatted_address": "123 Main St, Mumbai, Maharashtra 400001, India",
    "place_id": "ChIJ..."
  }
}
```

**Edge Function Implementation**:
```typescript
serve(async (req) => {
  try {
    const { address } = await req.json();
    const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');
    
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            latitude: result.geometry.location.lat,
            longitude: result.geometry.location.lng,
            formatted_address: result.formatted_address,
            place_id: result.place_id
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    throw new Error('Geocoding failed');
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: { message: error.message } }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

---

#### 7.5.3 Calculate Distance & Travel Time (Distance Matrix API)

**Endpoint**: `POST /functions/v1/calculate-distance`

**Purpose**: Calculate travel distance and estimated time between user and supplier.

**Request Body**:
```json
{
  "origins": "19.0760,72.8777",
  "destinations": "18.5204,73.8567",
  "mode": "driving"
}
```

**Modes**: `driving`, `walking`, `bicycling`, `transit`

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "distance": {
      "text": "150 km",
      "value": 150000
    },
    "duration": {
      "text": "2 hours 30 mins",
      "value": 9000
    },
    "status": "OK"
  }
}
```

**Edge Function Implementation**:
```typescript
serve(async (req) => {
  try {
    const { origins, destinations, mode } = await req.json();
    const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');
    
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&mode=${mode || 'driving'}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.rows[0].elements[0].status === 'OK') {
      const element = data.rows[0].elements[0];
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            distance: element.distance,
            duration: element.duration,
            status: 'OK'
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    throw new Error('Distance calculation failed');
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: { message: error.message } }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

---

#### 7.5.4 Get Turn-by-Turn Directions (Directions API)

**Endpoint**: `POST /functions/v1/get-directions`

**Purpose**: Retrieve detailed route with step-by-step navigation instructions.

**Request Body**:
```json
{
  "origin": "19.0760,72.8777",
  "destination": "18.5204,73.8567",
  "mode": "driving",
  "alternatives": true
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "routes": [
      {
        "summary": "NH 48",
        "distance": "150 km",
        "duration": "2 hours 30 mins",
        "steps": [
          {
            "instruction": "Head north on Main St",
            "distance": "500 m",
            "duration": "2 mins"
          }
        ],
        "polyline": "encoded_polyline_string"
      }
    ]
  }
}
```

**Edge Function Implementation**:
```typescript
serve(async (req) => {
  try {
    const { origin, destination, mode, alternatives } = await req.json();
    const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');
    
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=${mode || 'driving'}&alternatives=${alternatives || false}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.routes.length > 0) {
      const routes = data.routes.map(route => ({
        summary: route.summary,
        distance: route.legs[0].distance.text,
        duration: route.legs[0].duration.text,
        steps: route.legs[0].steps.map(step => ({
          instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
          distance: step.distance.text,
          duration: step.duration.text
        })),
        polyline: route.overview_polyline.points
      }));
      
      return new Response(
        JSON.stringify({ success: true, data: { routes } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    throw new Error('Directions not found');
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: { message: error.message } }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

---

#### 7.5.5 Get Supplier Business Details (Places API)

**Endpoint**: `POST /functions/v1/get-place-details`

**Purpose**: Fetch supplier info, reviews, ratings, and photos from Google Places.

**Request Body**:
```json
{
  "place_id": "ChIJ...",
  "fields": ["name", "rating", "reviews", "formatted_phone_number", "website", "photos"]
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "name": "EcoPack India",
    "rating": 4.5,
    "user_ratings_total": 127,
    "formatted_phone_number": "+91-22-12345678",
    "website": "https://ecopack.in",
    "reviews": [
      {
        "author_name": "John Doe",
        "rating": 5,
        "text": "Excellent service and quality!",
        "time": 1234567890
      }
    ],
    "photos": [
      {
        "photo_reference": "photo_ref_string",
        "width": 4032,
        "height": 3024
      }
    ]
  }
}
```

**Edge Function Implementation**:
```typescript
serve(async (req) => {
  try {
    const { place_id, fields } = await req.json();
    const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');
    
    const fieldsParam = fields.join(',');
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=${fieldsParam}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK') {
      return new Response(
        JSON.stringify({ success: true, data: data.result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    throw new Error('Place details not found');
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: { message: error.message } }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

---

#### 7.5.6 Generate Static Map Image (Static Maps API)

**Endpoint**: `GET /functions/v1/static-map`

**Purpose**: Generate static map images for previews.

**Query Parameters**:
- `center`: Center coordinates (e.g., `19.0760,72.8777`)
- `zoom`: Zoom level (1-20)
- `size`: Image size (e.g., `600x400`)
- `markers`: Marker positions

**Example**:
```
GET /functions/v1/static-map?center=19.0760,72.8777&zoom=12&size=600x400&markers=19.0760,72.8777
```

**Response**: Returns PNG image

**Implementation**:
```typescript
serve(async (req) => {
  const url = new URL(req.url);
  const center = url.searchParams.get('center');
  const zoom = url.searchParams.get('zoom') || '12';
  const size = url.searchParams.get('size') || '600x400';
  const markers = url.searchParams.get('markers');
  
  const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');
  
  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=${zoom}&size=${size}&markers=${markers}&key=${GOOGLE_MAPS_API_KEY}`;
  
  const response = await fetch(mapUrl);
  const imageBuffer = await response.arrayBuffer();
  
  return new Response(imageBuffer, {
    headers: { 'Content-Type': 'image/png' }
  });
});
```

---

#### 7.5.7 Open Google Maps with Directions (URL Scheme)

**Frontend Implementation**:
```typescript
const openGoogleMaps = (destination: string) => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  if (isMobile) {
    // Open Google Maps app
    window.location.href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
  } else {
    // Open in new tab
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`,
      '_blank'
    );
  }
};

// Usage
<Button onClick={() => openGoogleMaps('EcoPack India, Mumbai')}>
  Get Directions
</Button>
```

---

### 7.6 Social Media Analytics APIs (Marketing Hub)

#### 7.6.1 Get Facebook Page Insights (Meta Graph API)

**Endpoint**: `POST /functions/v1/facebook-insights`

**Purpose**: Fetch Facebook page analytics for optimal posting schedule.

**Request Body**:
```json
{
  "page_id": "123456789",
  "metrics": ["page_impressions", "page_engaged_users", "page_fans_online_per_day"],
  "period": "day",
  "date_range": {
    "since": "2025-10-01",
    "until": "2025-10-31"
  }
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "optimal_posting_times": [
      { "day": "Monday", "hour": 10, "engagement_rate": 8.5 },
      { "day": "Wednesday", "hour": 14, "engagement_rate": 9.2 },
      { "day": "Friday", "hour": 18, "engagement_rate": 10.1 }
    ],
    "best_days": ["Wednesday", "Friday", "Sunday"],
    "peak_hours": [10, 14, 18, 20]
  }
}
```

**Edge Function Implementation**:
```typescript
serve(async (req) => {
  try {
    const { page_id, metrics, period, date_range } = await req.json();
    const META_ACCESS_TOKEN = Deno.env.get('META_ACCESS_TOKEN');
    
    const metricsParam = metrics.join(',');
    const url = `https://graph.facebook.com/v18.0/${page_id}/insights?metric=${metricsParam}&period=${period}&since=${date_range.since}&until=${date_range.until}&access_token=${META_ACCESS_TOKEN}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    // Process data to find optimal posting times
    const optimalTimes = analyzeEngagementData(data);
    
    return new Response(
      JSON.stringify({ success: true, data: optimalTimes }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: { message: error.message } }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

---

#### 7.6.2 Get Instagram Insights (Meta Graph API)

**Endpoint**: `POST /functions/v1/instagram-insights`

**Request Body**:
```json
{
  "instagram_business_account_id": "123456789",
  "metrics": ["reach", "impressions", "engagement"],
  "period": "day"
}
```

**Response**: Similar to Facebook insights with Instagram-specific metrics.

---

#### 7.6.3 Get Twitter/X Analytics (Twitter API)

**Endpoint**: `POST /functions/v1/twitter-analytics`

**Purpose**: Fetch Tweet engagement and audience activity for optimal posting.

**Request Body**:
```json
{
  "user_id": "12345",
  "metrics": ["impressions", "engagements", "engagement_rate"],
  "start_date": "2025-10-01",
  "end_date": "2025-10-31"
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "optimal_posting_times": [
      { "day": "Tuesday", "hour": 9, "engagement_rate": 7.8 },
      { "day": "Thursday", "hour": 12, "engagement_rate": 8.5 }
    ],
    "best_days": ["Tuesday", "Thursday", "Saturday"],
    "peak_hours": [9, 12, 17]
  }
}
```

**Edge Function Implementation**:
```typescript
serve(async (req) => {
  try {
    const { user_id, metrics, start_date, end_date } = await req.json();
    const TWITTER_BEARER_TOKEN = Deno.env.get('TWITTER_BEARER_TOKEN');
    
    const url = `https://api.twitter.com/2/users/${user_id}/tweets?tweet.fields=public_metrics&start_time=${start_date}&end_time=${end_date}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`
      }
    });
    
    const data = await response.json();
    
    // Analyze tweet performance by day and hour
    const optimalTimes = analyzeTweetEngagement(data);
    
    return new Response(
      JSON.stringify({ success: true, data: optimalTimes }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: { message: error.message } }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

---

#### 7.6.4 Get LinkedIn Analytics (LinkedIn API)

**Endpoint**: `POST /functions/v1/linkedin-analytics`

**Request Body**:
```json
{
  "organization_id": "12345678",
  "time_range": {
    "start": 1633046400000,
    "end": 1635724800000
  }
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "optimal_posting_times": [
      { "day": "Tuesday", "hour": 8, "engagement_rate": 9.5 },
      { "day": "Wednesday", "hour": 11, "engagement_rate": 10.2 }
    ],
    "best_days": ["Tuesday", "Wednesday", "Thursday"],
    "peak_hours": [8, 11, 15]
  }
}
```

**Edge Function Implementation**:
```typescript
serve(async (req) => {
  try {
    const { organization_id, time_range } = await req.json();
    const LINKEDIN_ACCESS_TOKEN = Deno.env.get('LINKEDIN_ACCESS_TOKEN');
    
    const url = `https://api.linkedin.com/v2/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=urn:li:organization:${organization_id}&timeIntervals.timeRange.start=${time_range.start}&timeIntervals.timeRange.end=${time_range.end}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });
    
    const data = await response.json();
    
    // Analyze post performance
    const optimalTimes = analyzeLinkedInEngagement(data);
    
    return new Response(
      JSON.stringify({ success: true, data: optimalTimes }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: { message: error.message } }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

---

## 8. File Upload API

### 8.1 Upload Business Document

**Endpoint**: `POST /storage/v1/object/business-documents/{user_id}/{filename}`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request**: Multipart form with file

**Response**: `200 OK`
```json
{
  "Key": "business-documents/user-id/document.pdf",
  "Id": "uuid"
}
```

### 8.2 Process Uploaded Document

**Endpoint**: `POST /functions/v1/process-document`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "file_path": "business-documents/user-id/document.pdf",
  "file_type": "pdf"
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "original_content": "...",
    "original_language": "hi",
    "english_content": "...",
    "word_count": 523,
    "character_count": 3421
  }
}
```

**Edge Function Implementation**:
```typescript
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { file_content, file_type } = await req.json();
    
    // Extract text based on file type
    let extractedText = '';
    
    if (file_type === 'txt') {
      extractedText = file_content;
    } else if (file_type === 'pdf') {
      // PDF parsing logic
      extractedText = await parsePDF(file_content);
    } else if (file_type === 'docx') {
      // DOCX parsing logic
      extractedText = await parseDOCX(file_content);
    }
    
    // Normalize content
    const normalized = normalizeText(extractedText);
    
    // Detect language using AI
    const languageDetection = await detectLanguage(normalized);
    
    // Translate if needed
    let englishContent = normalized;
    if (languageDetection.language !== 'en') {
      englishContent = await translateToEnglish(normalized, languageDetection.language);
    }
    
    // Refine content using AI
    const refined = await refineBusinessIdea(englishContent);
    
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          original_content: normalized,
          original_language: languageDetection.language,
          english_content: refined,
          word_count: refined.split(/\s+/).length,
          character_count: refined.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: { message: error.message } }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

### 8.3 Upload Design Asset

**Endpoint**: `POST /storage/v1/object/design-assets/{user_id}/{asset_type}/{filename}`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: image/png
```

**Response**: `200 OK`

### 8.4 Get File URL

**Endpoint**: `GET /storage/v1/object/public/{bucket}/{path}`

**For Public Buckets**: No auth required

**For Private Buckets**:
```
GET /storage/v1/object/authenticated/{bucket}/{path}
Authorization: Bearer <token>
```

**Response**: File content with appropriate Content-Type

### 8.5 Delete File

**Endpoint**: `DELETE /storage/v1/object/{bucket}/{path}`

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`

---

## 9. Edge Functions

### 9.1 Function: generate-business-plan

**Path**: `supabase/functions/generate-business-plan/index.ts`

**Purpose**: Generate comprehensive business plan using AI

**Input**:
```typescript
{
  idea_id: string;
  business_idea: string;
  business_type: string;
  language: string;
}
```

**Output**: Business plan JSON structure

**AI Model**: google/gemini-2.5-flash

**Implementation**: See section 4.1

### 9.2 Function: process-document

**Path**: `supabase/functions/process-document/index.ts`

**Purpose**: Extract, normalize, translate, and refine document content

**Input**:
```typescript
{
  file_content: string;
  file_type: 'txt' | 'pdf' | 'docx';
}
```

**Output**:
```typescript
{
  original_content: string;
  original_language: string;
  english_content: string;
  word_count: number;
  character_count: number;
}
```

**Processing Steps**:
1. Text extraction
2. Normalization
3. Language detection
4. Translation (if needed)
5. AI refinement

### 9.3 Function: generate-marketing-content

**Path**: `supabase/functions/generate-marketing-content/index.ts`

**Purpose**: Generate platform-specific marketing content

**Input**:
```typescript
{
  business_plan_id: string;
  platform: string;
  content_type: string;
  business_name: string;
  business_description: string;
  tone: string;
  target_audience: string;
}
```

**Output**: Marketing content with hashtags

**Implementation**: See section 6.1

### 9.4 Function: detect-language

**Path**: `supabase/functions/detect-language/index.ts`

**Purpose**: Detect language of text using AI

**Input**:
```typescript
{
  text: string;
}
```

**Output**:
```typescript
{
  language: string; // ISO 639-1 code
  confidence: number;
  language_name: string;
}
```

**Implementation**:
```typescript
serve(async (req) => {
  try {
    const { text } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: `Detect the language of this text: "${text.substring(0, 500)}". Return only the ISO 639-1 language code (e.g., 'en', 'hi', 'te').`
          }
        ]
      }),
    });

    const data = await response.json();
    const languageCode = data.choices[0].message.content.trim().toLowerCase();
    
    const languageNames = {
      en: 'English',
      hi: 'Hindi',
      bn: 'Bengali',
      te: 'Telugu',
      mr: 'Marathi',
      ta: 'Tamil',
      gu: 'Gujarati',
      kn: 'Kannada'
    };

    return new Response(
      JSON.stringify({
        language: languageCode,
        confidence: 0.95,
        language_name: languageNames[languageCode] || 'Unknown'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

### 9.5 Function: translate-text

**Path**: `supabase/functions/translate-text/index.ts`

**Purpose**: Translate text to English using AI

**Input**:
```typescript
{
  text: string;
  source_language: string;
  target_language: string;
}
```

**Output**:
```typescript
{
  translated_text: string;
  source_language: string;
  target_language: string;
}
```

---

## 10. Database Functions

### 10.1 Function: has_role

**Purpose**: Check if user has specific role (security definer)

**Definition**:
```sql
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;
```

**Usage in RLS**:
```sql
create policy "Admins can delete suppliers"
  on suppliers for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));
```

### 10.2 Function: suppliers_near_location

**Purpose**: Find suppliers within radius of coordinates

**Definition**: See section 7.3

### 10.3 Function: calculate_financial_metrics

**Purpose**: Calculate business plan financial metrics

**Definition**:
```sql
create or replace function calculate_financial_metrics(
  startup_costs numeric,
  monthly_expenses numeric,
  revenue_projections numeric[]
)
returns json
language plpgsql
as $$
declare
  result json;
  break_even_month int;
  cumulative_revenue numeric := 0;
  cumulative_expenses numeric := startup_costs;
  i int;
begin
  -- Calculate break-even point
  for i in 1..array_length(revenue_projections, 1) loop
    cumulative_revenue := cumulative_revenue + revenue_projections[i];
    cumulative_expenses := cumulative_expenses + monthly_expenses;
    
    if cumulative_revenue >= cumulative_expenses then
      break_even_month := i;
      exit;
    end if;
  end loop;
  
  result := json_build_object(
    'break_even_month', break_even_month,
    'total_revenue_year_1', (
      select sum(val) from unnest(revenue_projections[1:12]) as val
    ),
    'total_expenses_year_1', startup_costs + (monthly_expenses * 12),
    'profit_year_1', (
      select sum(val) from unnest(revenue_projections[1:12]) as val
    ) - (startup_costs + (monthly_expenses * 12))
  );
  
  return result;
end;
$$;
```

### 10.4 Trigger: handle_new_user

**Purpose**: Create profile and assign default role on user signup

**Definition**: See section 2.1

### 10.5 Trigger: update_updated_at

**Purpose**: Automatically update updated_at timestamp

**Definition**:
```sql
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at
  before update on public.business_ideas
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at
  before update on public.business_plans
  for each row
  execute function public.handle_updated_at();
```

---

## 11. Webhooks

### 11.1 Webhook: on_business_plan_created

**Purpose**: Send notification when business plan is generated

**Configuration**:
```sql
create webhook on_business_plan_created
  on insert into business_plans
  to 'https://yourapp.com/webhooks/plan-created';
```

**Payload**:
```json
{
  "type": "INSERT",
  "table": "business_plans",
  "record": {
    "id": "uuid",
    "user_id": "uuid",
    "created_at": "2025-10-03T10:00:00Z"
  }
}
```

### 11.2 Webhook: on_design_asset_created

**Purpose**: Process/optimize newly uploaded design assets

**Configuration**:
```sql
create webhook on_design_asset_created
  on insert into design_assets
  to 'https://yourapp.com/webhooks/asset-created';
```

---

## 12. Error Handling

### 12.1 Error Codes

```typescript
enum ErrorCode {
  // Authentication errors (AUTH_*)
  AUTH_INVALID_CREDENTIALS = 'AUTH_001',
  AUTH_TOKEN_EXPIRED = 'AUTH_002',
  AUTH_INSUFFICIENT_PERMISSIONS = 'AUTH_003',
  
  // Validation errors (VAL_*)
  VAL_INVALID_INPUT = 'VAL_001',
  VAL_REQUIRED_FIELD = 'VAL_002',
  VAL_FILE_TOO_LARGE = 'VAL_003',
  VAL_UNSUPPORTED_FORMAT = 'VAL_004',
  
  // AI errors (AI_*)
  AI_RATE_LIMIT = 'AI_001',
  AI_PAYMENT_REQUIRED = 'AI_002',
  AI_GENERATION_FAILED = 'AI_003',
  
  // Database errors (DB_*)
  DB_NOT_FOUND = 'DB_001',
  DB_DUPLICATE_ENTRY = 'DB_002',
  DB_FOREIGN_KEY_VIOLATION = 'DB_003',
  
  // Server errors (SRV_*)
  SRV_INTERNAL_ERROR = 'SRV_001',
  SRV_SERVICE_UNAVAILABLE = 'SRV_002'
}
```

### 12.2 Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "AI_001",
    "message": "AI service rate limit exceeded",
    "details": {
      "retry_after": 60,
      "suggestion": "Please try again in 1 minute"
    },
    "timestamp": "2025-10-03T10:00:00Z"
  }
}
```

### 12.3 Error Handling Middleware (Edge Functions)

```typescript
function handleError(error: Error): Response {
  console.error('Error:', error);
  
  let statusCode = 500;
  let errorCode = 'SRV_001';
  let message = 'Internal server error';
  
  if (error.message.includes('rate limit')) {
    statusCode = 429;
    errorCode = 'AI_001';
    message = 'AI service rate limit exceeded';
  } else if (error.message.includes('payment')) {
    statusCode = 402;
    errorCode = 'AI_002';
    message = 'AI credits exhausted';
  } else if (error.message.includes('not found')) {
    statusCode = 404;
    errorCode = 'DB_001';
    message = 'Resource not found';
  }
  
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        code: errorCode,
        message: message,
        timestamp: new Date().toISOString()
      }
    }),
    {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}
```

### 12.4 Client-Side Error Handling

```typescript
async function apiRequest(endpoint: string, options: RequestInit) {
  try {
    const response = await fetch(endpoint, options);
    const data = await response.json();
    
    if (!response.ok) {
      // Handle specific error codes
      switch (data.error?.code) {
        case 'AI_001':
          toast.error('AI service is busy. Please try again in a moment.');
          break;
        case 'AI_002':
          toast.error('AI credits exhausted. Please top up your credits.');
          break;
        case 'AUTH_002':
          // Refresh token and retry
          await refreshAuthToken();
          return apiRequest(endpoint, options);
        default:
          toast.error(data.error?.message || 'An error occurred');
      }
      
      throw new Error(data.error?.message);
    }
    
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}
```

---

## 13. Rate Limiting

### 13.1 API Rate Limits

**Authenticated Requests**:
- 100 requests per minute per user
- 1000 requests per hour per user

**AI Gateway Requests**:
- Depends on workspace plan
- Free tier: Limited monthly usage
- Paid tier: Higher limits

**File Uploads**:
- 10 files per minute per user
- Max 10MB per file

### 13.2 Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1696329600
```

### 13.3 Rate Limit Implementation

```typescript
// Database table for rate limiting
create table public.rate_limits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  endpoint text not null,
  request_count int default 0,
  window_start timestamp with time zone default now(),
  unique(user_id, endpoint)
);

// Function to check rate limit
create or replace function check_rate_limit(
  _user_id uuid,
  _endpoint text,
  _limit int,
  _window_minutes int
)
returns boolean
language plpgsql
as $$
declare
  current_count int;
  window_start timestamp;
begin
  select request_count, rate_limits.window_start
  into current_count, window_start
  from rate_limits
  where user_id = _user_id and endpoint = _endpoint;
  
  if current_count is null then
    insert into rate_limits (user_id, endpoint, request_count)
    values (_user_id, _endpoint, 1);
    return true;
  end if;
  
  if now() - window_start > interval '1 minute' * _window_minutes then
    update rate_limits
    set request_count = 1, window_start = now()
    where user_id = _user_id and endpoint = _endpoint;
    return true;
  end if;
  
  if current_count >= _limit then
    return false;
  end if;
  
  update rate_limits
  set request_count = request_count + 1
  where user_id = _user_id and endpoint = _endpoint;
  
  return true;
end;
$$;
```

---

## 14. Appendices

### 14.1 Environment Variables

**Required Backend Secrets** (Supabase Edge Function Secrets):
```bash
# AI Services
OPENAI_API_KEY=<your-openai-api-key>

# Google Maps APIs (Suppliers Module)
GOOGLE_MAPS_API_KEY=<your-google-maps-api-key>

# Social Media Analytics (Marketing Hub)
META_ACCESS_TOKEN=<your-meta-access-token>           # Facebook & Instagram
TWITTER_BEARER_TOKEN=<your-twitter-bearer-token>     # Twitter/X
LINKEDIN_ACCESS_TOKEN=<your-linkedin-access-token>   # LinkedIn
```

**Client-Side Variables** (Available in frontend):
```bash
VITE_SUPABASE_URL=https://[project-ref].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
VITE_GOOGLE_MAPS_API_KEY=<your-google-maps-api-key>  # For frontend map rendering
```

**API Keys Setup Instructions**:

1. **OpenAI API Key**: 
   - Sign up at https://platform.openai.com/
   - Navigate to API Keys section
   - Create new secret key
   - Add to Supabase Secrets as `OPENAI_API_KEY`

2. **Google Maps API Key**:
   - Go to Google Cloud Console: https://console.cloud.google.com/
   - Create new project or select existing
   - Enable APIs: Maps JavaScript API, Geocoding API, Distance Matrix API, Directions API, Places API, Static Maps API
   - Create credentials (API Key)
   - Add to Supabase Secrets as `GOOGLE_MAPS_API_KEY`
   - Also add to `.env` as `VITE_GOOGLE_MAPS_API_KEY` for frontend

3. **Meta Access Token** (Facebook & Instagram):
   - Go to Meta for Developers: https://developers.facebook.com/
   - Create app and configure Facebook/Instagram Graph API
   - Generate long-lived Page Access Token
   - Add to Supabase Secrets as `META_ACCESS_TOKEN`

4. **Twitter Bearer Token**:
   - Go to Twitter Developer Portal: https://developer.twitter.com/
   - Create project and app
   - Navigate to Keys and Tokens
   - Generate Bearer Token
   - Add to Supabase Secrets as `TWITTER_BEARER_TOKEN`

5. **LinkedIn Access Token**:
   - Go to LinkedIn Developers: https://www.linkedin.com/developers/
   - Create app
   - Request access to Marketing Developer Platform
   - Generate OAuth 2.0 Access Token
   - Add to Supabase Secrets as `LINKEDIN_ACCESS_TOKEN`

### 14.2 API Testing with cURL

**Create Business Idea**:
```bash
curl -X POST https://[project].supabase.co/rest/v1/business_ideas \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "original_content": "Test idea",
    "original_language": "en",
    "english_content": "Test idea",
    "business_type": "E-commerce",
    "input_method": "text"
  }'
```

**Generate Business Plan**:
```bash
curl -X POST https://[project].supabase.co/functions/v1/generate-business-plan \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "business_idea": "Online marketplace for handicrafts",
    "business_type": "E-commerce",
    "language": "en"
  }'
```

### 14.3 Postman Collection

Import this JSON into Postman:
```json
{
  "info": {
    "name": "CraftBiz API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Sign Up",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"user@example.com\",\n  \"password\": \"password123\"\n}",
              "options": { "raw": { "language": "json" } }
            },
            "url": { "raw": "{{baseUrl}}/auth/v1/signup" }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "https://[project].supabase.co"
    },
    {
      "key": "token",
      "value": ""
    }
  ]
}
```

---

**Document Version**: 2.0  
**Last Updated**: 2025-10-14  
**Author**: CraftBiz Development Team  
**Changes**: Migrated from Google Gemini to OpenAI APIs, Added Google Maps integration, Added Social Media Analytics APIs
