import { z } from 'zod';

// File validation constants
export const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20MB
export const MAX_AUDIO_SIZE = 25 * 1024 * 1024; // 25MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const ALLOWED_AUDIO_TYPES = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav'];

// Business idea validation schema
export const businessIdeaSchema = z.object({
  ideaText: z.string()
    .trim()
    .min(10, { message: "Business idea must be at least 10 characters" })
    .max(2000, { message: "Business idea must be less than 2000 characters" }),
  businessType: z.string()
    .min(1, { message: "Please select a business type" }),
});

// Image validation
export const validateImage = (file: File): { valid: boolean; error?: string } => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`
    };
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `File size too large. Maximum size: ${MAX_IMAGE_SIZE / 1024 / 1024}MB`
    };
  }

  return { valid: true };
};

// Audio validation
export const validateAudio = (file: Blob): { valid: boolean; error?: string } => {
  if (file.size > MAX_AUDIO_SIZE) {
    return {
      valid: false,
      error: `Audio file too large. Maximum size: ${MAX_AUDIO_SIZE / 1024 / 1024}MB`
    };
  }

  return { valid: true };
};

// Email validation schema
export const emailSchema = z.object({
  email: z.string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
});

// Password validation schema
export const passwordSchema = z.object({
  password: z.string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(100, { message: "Password must be less than 100 characters" }),
});

// Contact form validation schema
export const contactSchema = z.object({
  name: z.string()
    .trim()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name must be less than 100 characters" }),
  email: z.string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  message: z.string()
    .trim()
    .min(10, { message: "Message must be at least 10 characters" })
    .max(1000, { message: "Message must be less than 1000 characters" })
});
