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

// The lead API's `interestedIn` enum (WEBSITE_INTEGRATION_CONTRACT §4.1). The
// form renders a <select> bound to this, so it must be part of the schema —
// z.object() strips keys it doesn't know about. `referenceId` is still set by
// the page, not the user.
const interestedIn = z
  .enum(['bootcamp', 'project', 'quarky', 'general'])
  .optional()
  .default('general');

/**
 * Enroll form → POST /api/public/leads (spec §4.5).
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
  interestedIn,
  message: z.string().trim().max(1000).optional().or(z.literal('')),
  ...honeypot,
});

/**
 * Store enquiry variant of the Enroll form → same POST /api/public/leads.
 * A product/project enquiry ("I'd like to buy a Quarky for my class") isn't
 * always about one named child, so learner name is optional and learner age is
 * optional (empty allowed). Everything else — and the endpoint — is identical.
 */
export const storeEnquirySchema = z.object({
  parentName: z.string().trim().min(2, 'Please enter your name').max(120),
  parentEmail: z.string().trim().email('Enter a valid email address').max(160),
  parentPhone: phone,
  learnerName: z.string().trim().max(120).optional().or(z.literal('')),
  learnerAge: z
    .union([
      z.literal(''),
      z.coerce
        .number({ invalid_type_error: 'Enter an age' })
        .int('Enter a whole number')
        .min(3, 'Age looks too low')
        .max(19, 'This programme is for under-19s'),
    ])
    .optional(),
  interestedIn,
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

/**
 * Public diagnostic — age gate step. Mirrors the age range every diagnostic
 * question set is offered within (WEBSITE_INTEGRATION_CONTRACT.md §3.8). This is
 * the ONLY form the diagnostic asks — after answering the questions the visitor
 * submits and sees the report; no name/email is collected anywhere in the flow.
 */
export const diagnosticAgeSchema = z.object({
  age: z.coerce
    .number({ invalid_type_error: 'Enter an age' })
    .int('Enter a whole number')
    .min(3, 'Age looks too low')
    .max(19, 'This diagnostic is for under-19s'),
});
