# CraftBiz - API Backend Specification

**Version**: 2.0  
**Last Updated**: January 2025

---

## Table of Contents
1. [Overview](#1-overview)
2. [Authentication](#2-authentication)
3. [Business Ideas API](#3-business-ideas-api)
4. [Business Plans API](#4-business-plans-api)
5. [Design Studio API](#5-design-studio-api)
6. [Marketing Hub API](#6-marketing-hub-api)
7. [Suppliers API](#7-suppliers-api)
8. [Edge Functions](#8-edge-functions)
9. [Error Handling](#9-error-handling)

---

## 1. Overview

### 1.1 Base URLs
```
API: https://[project-ref].supabase.co/rest/v1
Edge Functions: https://[project-ref].supabase.co/functions/v1
Storage: https://[project-ref].supabase.co/storage/v1
OpenAI: https://api.openai.com/v1
Google Maps: https://maps.googleapis.com/maps/api
```

### 1.2 Authentication
All API requests require JWT token in header:
```http
Authorization: Bearer <JWT_TOKEN>
apikey: <SUPABASE_ANON_KEY>
```

### 1.3 Standard Response Format

**Success**:
```json
{
  "success": true,
  "data": { ... }
}
```

**Error**:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

### 1.4 HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limit Exceeded
- `500` - Server Error

---

## 2. Authentication

### 2.1 Sign Up
**Endpoint**: `POST /auth/v1/signup`

**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "options": {
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
  "refresh_token": "...",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

### 2.2 Sign In
**Endpoint**: `POST /auth/v1/token?grant_type=password`

**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**: `200 OK`
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "...",
  "expires_in": 3600
}
```

### 2.3 Sign Out
**Endpoint**: `POST /auth/v1/logout`

**Headers**:
```http
Authorization: Bearer <JWT_TOKEN>
```

**Response**: `204 No Content`

---

## 3. Business Ideas API

### 3.1 Create Business Idea
**Endpoint**: `POST /rest/v1/business_ideas`

**Request**:
```json
{
  "content": "I want to start a handmade crafts marketplace...",
  "business_type": "E-commerce",
  "input_method": "text | voice | image",
  "product_analysis": {
    "product_type": "Handwoven Textile",
    "materials": ["Natural Cotton", "Traditional Dyes"],
    "style": "Traditional Indian Handloom",
    "colors": ["Natural Beige", "Indigo Blue"],
    "target_audience": "Urban eco-conscious customers",
    "business_context": "Sustainable Fashion"
  }
}
```

**Response**: `201 Created`
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "content": "...",
  "business_type": "E-commerce",
  "input_method": "image",
  "product_analysis": {},
  "created_at": "2025-01-15T10:00:00Z"
}
```

### 3.2 Get User's Business Ideas
**Endpoint**: `GET /rest/v1/business_ideas?user_id=eq.<user_id>`

**Response**: `200 OK`
```json
[
  {
    "id": "uuid",
    "content": "...",
    "business_type": "E-commerce",
    "created_at": "2025-01-15T10:00:00Z"
  }
]
```

---

## 4. Business Plans API

### 4.1 Generate Business Plan (Edge Function)
**Endpoint**: `POST /functions/v1/generate-business-plan`

**Request**:
```json
{
  "idea_id": "uuid",
  "business_idea": "Handmade crafts marketplace...",
  "business_type": "E-commerce"
}
```

**Edge Function Implementation**:
```typescript
const response = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${OPENAI_API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "gpt-5-2025-08-07",
    messages: [
      {
        role: "system",
        content: "You are a business plan expert..."
      },
      {
        role: "user",
        content: `Create a business plan for: ${business_idea}`
      }
    ],
    max_completion_tokens: 4000,
    tools: [
      {
        type: "function",
        function: {
          name: "generate_business_plan",
          description: "Generate structured business plan",
          parameters: {
            type: "object",
            properties: {
              executive_summary: { type: "string" },
              market_analysis: { type: "string" },
              business_model: { type: "string" },
              marketing_strategy: { type: "string" },
              operations_planning: { type: "string" },
              financial_projections: { type: "string" }
            },
            required: ["executive_summary", "market_analysis", "business_model"]
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

const data = await response.json();
const planData = JSON.parse(data.choices[0].message.tool_calls[0].function.arguments);
```

**Response**: `200 OK`
```json
{
  "id": "uuid",
  "idea_id": "uuid",
  "executive_summary": "...",
  "market_analysis": "...",
  "business_model": "...",
  "marketing_strategy": "...",
  "operations_planning": "...",
  "financial_projections": "..."
}
```

### 4.2 Get Business Plan
**Endpoint**: `GET /rest/v1/business_plans?id=eq.<plan_id>`

**Response**: `200 OK`
```json
{
  "id": "uuid",
  "executive_summary": "...",
  "market_analysis": "...",
  "created_at": "2025-01-15T11:00:00Z"
}
```

### 4.3 Update Business Plan
**Endpoint**: `PATCH /rest/v1/business_plans?id=eq.<plan_id>`

**Request**:
```json
{
  "executive_summary": "Updated summary..."
}
```

**Response**: `200 OK`

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
  "colors": ["orange", "brown"]
}
```

**Edge Function Implementation**:
```typescript
const response = await fetch("https://api.openai.com/v1/images/generations", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${OPENAI_API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "gpt-image-1",
    prompt: `Professional logo for ${business_name}: ${description}. Style: ${style}. Colors: ${colors.join(", ")}`,
    n: 1,
    size: "1024x1024",
    response_format: "b64_json"
  })
});

const data = await response.json();
const imageBase64 = data.data[0].b64_json;

// Upload to Supabase Storage
const { data: uploadData, error } = await supabaseClient.storage
  .from('design-assets')
  .upload(`logos/${userId}/${Date.now()}.png`, 
    decode(imageBase64), 
    { contentType: 'image/png' }
  );
```

**Response**: `200 OK`
```json
{
  "id": "uuid",
  "asset_type": "logo",
  "file_url": "https://[project-ref].supabase.co/storage/v1/object/public/design-assets/logos/...",
  "prompt": "Modern minimalist logo..."
}
```

### 5.2 Generate Scene (Edge Function)
**Endpoint**: `POST /functions/v1/generate-scene`

**Request**:
```json
{
  "description": "Lifestyle scene with customers using handmade crafts",
  "style": "Photographic",
  "aspect_ratio": "16:9"
}
```

**Edge Function Implementation**:
```typescript
const sizeMap = {
  "16:9": "1792x1024",
  "1:1": "1024x1024",
  "9:16": "1024x1792"
};

const response = await fetch("https://api.openai.com/v1/images/generations", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${OPENAI_API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "gpt-image-1",
    prompt: `${style} style: ${description}. High quality, professional marketing photo.`,
    size: sizeMap[aspect_ratio],
    response_format: "b64_json"
  })
});
```

**Response**: `200 OK`
```json
{
  "id": "uuid",
  "asset_type": "scene",
  "file_url": "https://...",
  "description": "Lifestyle scene..."
}
```

### 5.3 Generate Mockup (Edge Function)
**Endpoint**: `POST /functions/v1/generate-mockup`

**Request**:
```json
{
  "logo_id": "uuid",
  "product_type": "tshirt",
  "color": "white"
}
```

**Edge Function Implementation**:
```typescript
// Get logo from storage
const { data: logoData } = await supabaseClient.storage
  .from('design-assets')
  .download(logoPath);

const logoBase64 = await fileToBase64(logoData);

const response = await fetch("https://api.openai.com/v1/images/generations", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${OPENAI_API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "gpt-image-1",
    prompt: `Professional product mockup: ${color} ${product_type} with custom logo printed on the center. Realistic, high quality, studio lighting.`,
    size: "1024x1024",
    response_format: "b64_json"
  })
});
```

**Response**: `200 OK`
```json
{
  "id": "uuid",
  "asset_type": "mockup",
  "file_url": "https://...",
  "product_type": "tshirt"
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
  "campaign_focus": "Supporting local artisans"
}
```

**Edge Function Implementation**:
```typescript
const platformLimits = {
  facebook: 63206,
  instagram: 2200,
  twitter: 280,
  linkedin: 3000
};

const response = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${OPENAI_API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "gpt-5-mini-2025-08-07",
    messages: [
      {
        role: "system",
        content: `Generate ${platform} post for ${audience} audience about ${campaign_focus}. Max ${platformLimits[platform]} characters. Include relevant hashtags.`
      },
      {
        role: "user",
        content: campaign_focus
      }
    ],
    max_completion_tokens: 500
  })
});

const data = await response.json();
const content = data.choices[0].message.content;
```

**Response**: `200 OK`
```json
{
  "id": "uuid",
  "platform": "instagram",
  "content": "Behind every handcrafted piece is an artisan's story...",
  "hashtags": ["#HandmadeCrafts", "#LocalArtisans", "#SupportLocal"]
}
```


---

## 7. Suppliers API

### 7.1 Search Suppliers
**Endpoint**: `GET /rest/v1/suppliers?category=eq.<category>&city=eq.<city>`

**Response**: `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "Rajesh Textile Mills",
    "category": "Textiles & Fabrics",
    "city": "Mumbai",
    "rating": 4.8,
    "phone": "+91 98765 43210",
    "verified": true
  }
]
```

### 7.2 Geocode Supplier Address (Edge Function)
**Endpoint**: `POST /functions/v1/geocode-address`

**Request**:
```json
{
  "address": "Dadar East, Mumbai, Maharashtra"
}
```

**Edge Function Implementation**:
```typescript
const response = await fetch(
  `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
);

const data = await response.json();
const location = data.results[0].geometry.location;

// Update supplier with coordinates
await supabaseClient
  .from('suppliers')
  .update({
    coordinates: `POINT(${location.lng} ${location.lat})`
  })
  .eq('id', supplier_id);
```

**Response**: `200 OK`
```json
{
  "lat": 19.0176,
  "lng": 72.8561,
  "formatted_address": "Dadar East, Mumbai, Maharashtra 400014, India"
}
```

### 7.3 Get Distance & Travel Time (Edge Function)
**Endpoint**: `POST /functions/v1/get-supplier-distance`

**Request**:
```json
{
  "user_location": "19.0760,72.8777",
  "supplier_id": "uuid"
}
```

**Edge Function Implementation**:
```typescript
const response = await fetch(
  `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${user_location}&destinations=${supplier_location}&key=${GOOGLE_MAPS_API_KEY}`
);

const data = await response.json();
const element = data.rows[0].elements[0];
```

**Response**: `200 OK`
```json
{
  "distance": "2.3 km",
  "duration": "8 mins",
  "status": "OK"
}
```

### 7.4 Get Directions (Edge Function)
**Endpoint**: `POST /functions/v1/get-directions`

**Request**:
```json
{
  "origin": "19.0760,72.8777",
  "destination": "19.0176,72.8561",
  "mode": "driving"
}
```

**Edge Function Implementation**:
```typescript
const response = await fetch(
  `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=${mode}&key=${GOOGLE_MAPS_API_KEY}`
);

const data = await response.json();
const route = data.routes[0];
```

**Response**: `200 OK`
```json
{
  "distance": "5.1 km",
  "duration": "15 mins",
  "steps": [
    {
      "instruction": "Head south on Main St",
      "distance": "0.5 km"
    }
  ]
}
```

### 7.5 Get Supplier Details (Google Places API)
**Endpoint**: `POST /functions/v1/get-supplier-details`

**Request**:
```json
{
  "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4"
}
```

**Edge Function Implementation**:
```typescript
const response = await fetch(
  `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=name,rating,reviews,formatted_phone_number,website,opening_hours&key=${GOOGLE_MAPS_API_KEY}`
);

const data = await response.json();
const details = data.result;
```

**Response**: `200 OK`
```json
{
  "name": "Rajesh Textile Mills",
  "rating": 4.8,
  "reviews": 127,
  "phone": "+91 98765 43210",
  "website": "https://rjmtextiles.com",
  "opening_hours": {
    "monday": "9:00 AM – 6:00 PM",
    "tuesday": "9:00 AM – 6:00 PM"
  }
}
```

---

## 8. AI Refinement & Analysis (Edge Functions)

### 8.1 Refine Business Idea
**Endpoint**: `POST /functions/v1/refine-idea`

**Description**: Refine raw business idea into a professional, descriptive business context suitable for submission.

**Request**:
```json
{
  "raw_idea": "pottery"
}
```

**Edge Function Implementation**:
```typescript
const response = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "gpt-5-mini-2025-08-07",
    messages: [
      {
        role: "system",
        content: "You are a business description expert. Refine raw business ideas into clear, professional, and descriptive business contexts. Output ONLY the refined description as plain text, without any structured sections like Executive Summary, Business Goals, etc. Keep it as a single cohesive paragraph describing the business opportunity."
      },
      {
        role: "user",
        content: `Refine this business idea: ${rawIdea}`
      }
    ],
    max_completion_tokens: 300
  })
});
```

**Response**: `200 OK`
```json
{
  "refined_idea": "A creative artisan-led business specializing in handcrafted pottery, ceramic decor, and functional homeware. The venture focuses on combining traditional craftsmanship with modern aesthetics to produce unique, sustainable, and customizable products for homes, cafes, and gifting markets."
}
```

### 8.2 Analyze Product Image
**Endpoint**: `POST /functions/v1/analyze-product-image`

**Description**: Use AI Vision (GPT-4o) to analyze product images and generate business context.

**Request**: Multipart form-data with image file

**Edge Function Implementation**:
```typescript
// Convert image to base64
const arrayBuffer = await imageFile.arrayBuffer();
const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

const response = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Analyze this handcrafted product. Identify: product type, materials, style, colors, craftsmanship details, regional art style. Suggest business context and target audience for selling this product."
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`
            }
          }
        ]
      }
    ],
    max_tokens: 1000
  })
});
```

**Response**: `200 OK`
```json
{
  "product_type": "Handwoven Textile / Fabric",
  "materials": ["Natural Cotton", "Traditional Dyes", "Hand-spun Thread"],
  "style": "Traditional Indian Handloom",
  "colors": ["Natural Beige", "Indigo Blue", "Earth Tones"],
  "target_audience": "Urban customers who prefer sustainable and eco-friendly products",
  "business_context": "Sustainable Fashion / Ethnic Wear",
  "suggested_business_idea": "A business selling eco-friendly handcrafted traditional textiles..."
}
```

### 8.3 Voice Transcription & Translation
**Endpoint**: `POST /functions/v1/transcribe-voice`

**Description**: Transcribe voice recording, detect language, and translate to English.

**Request**: Multipart form-data with audio file

**Edge Function Implementation**:
```typescript
// Step 1: Transcribe with Whisper
const formData = new FormData();
formData.append('file', audioFile);
formData.append('model', 'whisper-1');

const transcribeResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${Deno.env.get('OPENAI_API_KEY')}`
  },
  body: formData
});

const { text: transcribedText } = await transcribeResponse.json();

// Step 2: Detect language (simple pattern matching or AI)
const detectedLanguage = detectLanguageFromText(transcribedText);

// Step 3: Translate if not English
let englishTranslation = transcribedText;
if (detectedLanguage !== 'en') {
  const translateResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-5-mini-2025-08-07",
      messages: [
        {
          role: "system",
          content: "Translate the following text to English. Preserve business context."
        },
        {
          role: "user",
          content: transcribedText
        }
      ],
      max_completion_tokens: 1000
    })
  });

  const data = await translateResponse.json();
  englishTranslation = data.choices[0].message.content;
}
```

**Response**: `200 OK`
```json
{
  "transcribed_text": "मैं हस्तनिर्मित शिल्प बेचना चाहता हूँ...",
  "detected_language": "hi",
  "english_translation": "I want to sell handmade crafts..."
}
```

### 8.4 Refine Logo Description
**Endpoint**: `POST /functions/v1/refine-logo-description`

**Description**: Enhance brand description before logo generation.

**Request**:
```json
{
  "description": "Modern logo for crafts business"
}
```

**Edge Function Implementation**:
```typescript
const response = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "gpt-5-mini-2025-08-07",
    messages: [
      {
        role: "system",
        content: "Enhance logo descriptions by adding creative details, style suggestions, and color recommendations."
      },
      {
        role: "user",
        content: description
      }
    ],
    max_completion_tokens: 200
  })
});
```

**Response**: `200 OK`
```json
{
  "original_description": "Modern logo for crafts business",
  "refined_description": "Modern, minimalist logo for handmade crafts business. Incorporate warm earth tones (terracotta, ochre, natural beige). Clean sans-serif typography paired with handcrafted icon element. Professional yet artisanal feel."
}
```

---

## 9. Error Handling

### 9.1 Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `AUTH_REQUIRED` | Missing authentication token | 401 |
| `INVALID_TOKEN` | Invalid or expired token | 401 |
| `PERMISSION_DENIED` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `VALIDATION_ERROR` | Invalid request data | 400 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |
| `AI_SERVICE_ERROR` | OpenAI API error | 500 |
| `MAPS_API_ERROR` | Google Maps API error | 500 |
| `DATABASE_ERROR` | Database operation failed | 500 |

### 9.2 Error Response Examples

**Validation Error**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid business type",
    "details": {
      "field": "business_type",
      "allowed_values": ["E-commerce", "Food & Restaurant", "Technology"]
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
    "message": "OpenAI API rate limit exceeded. Please try again later."
  }
}
```

---

## 10. Rate Limits

- **Supabase**: 500 requests/minute per user
- **OpenAI**: Varies by plan
- **Google Maps**: 25,000 requests/day (free tier)

---

## 11. Environment Variables (Secrets)

Store in Supabase Dashboard → Settings → Edge Functions → Secrets:

```bash
OPENAI_API_KEY=sk-proj-...
GOOGLE_MAPS_API_KEY=AIzaSy...
```

For frontend (public keys only):
```bash
VITE_SUPABASE_URL=https://[project-ref].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...
```

---

**End of API Backend Specification**
