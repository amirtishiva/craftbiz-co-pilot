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
  "original_language": "en",
  "business_type": "E-commerce"
}
```

**Response**: `201 Created`
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "content": "...",
  "original_language": "en",
  "business_type": "E-commerce",
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
  "business_type": "E-commerce",
  "language": "en"
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

### 6.2 Get Social Media Analytics (Edge Function)
**Endpoint**: `POST /functions/v1/get-social-analytics`

**Request**:
```json
{
  "platform": "facebook",
  "page_id": "123456789"
}
```

**Edge Function Implementation (Meta Graph API)**:
```typescript
// Facebook/Instagram Insights
const response = await fetch(
  `https://graph.facebook.com/v18.0/${page_id}/insights?metric=page_impressions,page_engaged_users&period=day&access_token=${META_ACCESS_TOKEN}`
);

const data = await response.json();

// Calculate optimal posting times based on engagement patterns
const optimalTimes = analyzeEngagementPatterns(data.data);
```

**Response**: `200 OK`
```json
{
  "platform": "facebook",
  "best_time": "1:00 PM - 3:00 PM",
  "best_days": ["Tuesday", "Wednesday", "Thursday"],
  "avg_engagement": 4.5,
  "reach": 12500
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

## 8. Edge Functions

### 8.1 Document Processing (Edge Function)
**Endpoint**: `POST /functions/v1/process-document`

**Request**: Multipart form-data with file

**Edge Function Flow**:
```typescript
// 1. Extract text
let text = "";
if (file.type === 'application/pdf') {
  text = await extractPdfText(file);
} else if (file.type.includes('wordprocessing')) {
  text = await extractDocxText(file);
} else {
  text = await file.text();
}

// 2. Detect language
const detectResponse = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${OPENAI_API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "gpt-5-nano-2025-08-07",
    messages: [
      {
        role: "user",
        content: `Detect language and return ISO 639-1 code only: ${text.substring(0, 500)}`
      }
    ],
    max_completion_tokens: 10
  })
});

const detectedLanguage = (await detectResponse.json()).choices[0].message.content.trim();

// 3. Translate if not English
let englishText = text;
if (detectedLanguage !== 'en') {
  const translateResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-5-mini-2025-08-07",
      messages: [
        {
          role: "user",
          content: `Translate to English, preserve business context:\n\n${text}`
        }
      ],
      max_completion_tokens: 2000
    })
  });

  englishText = (await translateResponse.json()).choices[0].message.content;
}

// 4. Refine for business use
const refineResponse = await fetch("https://api.openai.com/v1/chat/completions", {
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
        content: "Refine business idea: remove redundancy, fix grammar, simplify complex sentences."
      },
      {
        role: "user",
        content: englishText
      }
    ],
    max_completion_tokens: 1500
  })
});

const refinedText = (await refineResponse.json()).choices[0].message.content;
```

**Response**: `200 OK`
```json
{
  "original_content": "मैं हस्तनिर्मित शिल्प के लिए एक ऑनलाइन बाज़ार शुरू करना चाहता हूँ...",
  "original_language": "hi",
  "english_content": "I want to start an online marketplace for handmade crafts...",
  "refined_content": "An online marketplace connecting local artisans with customers..."
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
- **Social Media APIs**: Platform-specific limits

---

## 11. Environment Variables (Secrets)

Store in Supabase Dashboard → Settings → Edge Functions → Secrets:

```bash
OPENAI_API_KEY=sk-proj-...
GOOGLE_MAPS_API_KEY=AIzaSy...
META_ACCESS_TOKEN=EAABsb...
TWITTER_BEARER_TOKEN=AAAAAAAAAAAAA...
LINKEDIN_ACCESS_TOKEN=AQV...
```

For frontend (public keys only):
```bash
VITE_SUPABASE_URL=https://[project-ref].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...
```

---

**End of API Backend Specification**
