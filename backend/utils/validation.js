const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  campus: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

const communitySchema = z.object({
  name: z.string().min(2).max(100),
  tags: z.array(z.string()).min(1).max(10),
  description: z.string().min(10).max(500),
  visibility: z.enum(['local', 'global']),
  location: z.object({
    type: z.literal('Point'),
    coordinates: z.array(z.number()).length(2)
  }).optional(),
  campus: z.string().optional()
});

const podSchema = z.object({
  communityId: z.string(),
  type: z.enum(['chat', 'hangout', 'study', 'game', 'other']),
  title: z.string().max(100).optional(),
  duration: z.number().min(1).max(24).optional(),
  location: z.object({
    type: z.literal('Point'),
    coordinates: z.array(z.number()).length(2)
  }).optional()
});

module.exports = {
  registerSchema,
  loginSchema,
  communitySchema,
  podSchema
};
