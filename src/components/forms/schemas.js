import { z } from 'zod';
import { HONEYPOT_FIELD } from './Honeypot.jsx';

const phone = z
  .string()
  .trim()
  .min(7, 'Enter a valid phone number')
  .max(20, 'Enter a valid phone number')
  .regex(/^[+0-9()\-\s]+$/, 'Enter a valid phone number');

// Honeypot: humans leave it blank, so any string passes validation here — the
// bot check happens in the form's onSubmit (see Honeypot.jsx).
const honeypot = { [HONEYPOT_FIELD]: z.string().optional() };

/**
 * Enroll form → POST /api/public/leads (spec §4.5).
 * `interestedIn` and `referenceId` are set by the page, not the user.
 */
export const enrollSchema = z.object({
  parentName: z.string().trim().min(2, 'Please enter your name').max(120),
  parentEmail: z.string().trim().email('Enter a valid email address').max(160),
  parentPhone: phone,
  learnerName: z.string().trim().min(2, 'Please enter the learner’s name').max(120),
  learnerAge: z.coerce
    .number({ invalid_type_error: 'Enter an age' })
    .int('Enter a whole number')
    .min(3, 'Age looks too low')
    .max(19, 'This programme is for under-19s'),
  message: z.string().trim().max(1000).optional().or(z.literal('')),
  ...honeypot,
});

/**
 * Contact form. Can post to /api/public/leads (interestedIn: 'general')
 * or the simpler /api/public/contact — see ContactForm.
 */
export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(120),
  email: z.string().trim().email('Enter a valid email address').max(160),
  phone: phone.optional().or(z.literal('')),
  message: z.string().trim().min(10, 'Please add a little more detail').max(2000),
  ...honeypot,
});
