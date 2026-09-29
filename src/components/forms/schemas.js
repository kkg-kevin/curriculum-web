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
  .enum(['bootcamp', 'project', 'quarky', 'home_schooling', 'general'])
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
 * Enrol via a pathway / the diagnostic — the enrol form plus the "Type of learning hub"
 * picker (required), the chosen hub (optional), and its name (carried for the lead note).
 */
export const pathwayEnrollSchema = enrollSchema.extend({
  hubType: z.string().trim().min(1, 'Choose a type of learning hub'),
  hubId: z.string().trim().optional().or(z.literal('')),
  hubName: z.string().trim().max(200).optional().or(z.literal('')),
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
 * question set is offered within (WEBSITE_INTEGRATION_CONTRACT.md §3.8).
 */
export const diagnosticAgeSchema = z.object({
  age: z.coerce
    .number({ invalid_type_error: 'Enter an age' })
    .int('Enter a whole number')
    .min(3, 'Age looks too low')
    .max(19, 'This diagnostic is for under-19s'),
});

/**
 * Public diagnostic — contact details, collected on the questions step before
 * the visitor can submit. Name + phone are required (they become a
 * `source: "diagnostic"` lead — WEBSITE_INTEGRATION_CONTRACT.md §4.3); the
 * learner's first name is optional context for how the report reads.
 */
export const diagnosticContactSchema = z.object({
  parentName: z.string().trim().min(2, 'Please enter your name').max(120),
  parentPhone: phone,
  childName: z.string().trim().max(120).optional().or(z.literal('')),
});

// Same username shape as the admin client's learner form (learnerPassword/username fields) and
// the server's submitBootcampEnrollmentSchema — kept in sync by hand across the two apps since
// client/ and digifunzi-landing/ don't share code (see CLAUDE.md).
const username = z
  .string()
  .trim()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be at most 30 characters')
  .regex(/^[a-zA-Z0-9._-]+$/, 'Only letters, numbers, dots, underscores, and hyphens are allowed');

/**
 * Bootcamp enrollment (auto-provisioned account) → POST /api/public/bootcamp-enrollments.
 * Shown on the bootcamp diagnostic report's "Enroll now" step. Unlike enrollSchema, phone is
 * REQUIRED (not just email) — this parent becomes the account's real contact, not an optional
 * follow-up channel, and there's no hub picker (the bootcamp already knows where it runs).
 *
 * username/password are the LEARNER'S OWN login, chosen right here on the form — the account is
 * ready to use the moment this submits, no separate "here's your password" reveal step needed.
 */
export const bootcampEnrollmentSchema = z
  .object({
    parentName: z.string().trim().min(2, 'Please enter your name').max(120),
    parentEmail: z.string().trim().email('Enter a valid email address').max(160),
    parentPhone: phone,
    learnerName: z.string().trim().min(2, 'Please enter the learner’s name').max(120),
    learnerAge: z.coerce
      .number({ invalid_type_error: 'Enter an age' })
      .int('Enter a whole number')
      .min(3, 'Age looks too low')
      .max(19, 'This programme is for under-19s'),
    username,
    password: z.string().min(6, 'Password must be at least 6 characters').max(72),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    ...honeypot,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords don’t match',
    path: ['confirmPassword'],
  });

/**
 * Home Schooling sign-up → POST /api/public/home-learning/signups. Mirrors the server's
 * signupSchema (home-learning.validation.js): the parent's email + password become their portal
 * login, each child gets their own username + password, and the home details tell the educator
 * where to go. Our team places each child (curriculum, grade, educator) after sign-up, so the
 * form only asks for the child's current school/grade to help with that.
 */
const loginPassword = z.string().min(8, 'Use at least 8 characters').max(72, 'Use at most 72 characters');
const requiredText = (max, message) => z.string().trim().min(1, message).max(max);
const optionalText = (max) => z.string().trim().max(max).optional().or(z.literal(''));

// Same rule as the server: a Google Maps share link or a google.<tld>/maps URL, or nothing.
export function isGoogleMapsUrl(value) {
  let url;
  try { url = new URL(value); } catch { return false; }
  if (!['http:', 'https:'].includes(url.protocol)) return false;
  const host = url.hostname.toLowerCase();
  if (host === 'maps.app.goo.gl') return true;
  if (host === 'goo.gl') return url.pathname.startsWith('/maps');
  if (/^maps\.google\.[a-z.]+$/.test(host)) return true;
  return /^(www\.)?google\.[a-z.]+$/.test(host) && url.pathname.startsWith('/maps');
}

export const signupChildSchema = z.object({
  firstName: requiredText(80, 'Enter their first name'),
  lastName: requiredText(80, 'Enter their last name'),
  gender: z.enum(['female', 'male', 'other'], { errorMap: () => ({ message: 'Choose one' }) }),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter their date of birth').optional().or(z.literal('')),
  currentGrade: optionalText(150),
  username,
  password: loginPassword,
});

export const homeSchoolingSignupSchema = z
  .object({
    packageSlug: z.string().min(1, 'Choose a package'),
    parent: z.object({
      name: requiredText(150, 'Enter your name'),
      email: z.string().trim().email('Enter a valid email address').max(255),
      phone,
      password: loginPassword,
      confirmPassword: z.string().min(1, 'Please confirm your password'),
    }),
    children: z.array(signupChildSchema).min(1, 'Add at least one child').max(20),
    home: z.object({
      county: requiredText(100, 'Enter your county'),
      subCounty: optionalText(100),
      town: requiredText(100, 'Enter your town or area'),
      addressLine: requiredText(255, 'Enter your home address'),
      landmark: optionalText(255),
      mapUrl: z.string().trim().max(2048).refine((v) => !v || isGoogleMapsUrl(v), 'Paste a Google Maps link (e.g. https://maps.app.goo.gl/…)').optional(),
    }),
    consent: z.literal(true, { errorMap: () => ({ message: 'Please agree so we can store your family’s details' }) }),
    ...honeypot,
  })
  .superRefine((data, ctx) => {
    if (data.parent.password !== data.parent.confirmPassword) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['parent', 'confirmPassword'], message: 'Passwords don’t match' });
    }
    const seen = new Set();
    data.children.forEach((child, index) => {
      const key = child.username.toLowerCase();
      if (key && seen.has(key)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['children', index, 'username'], message: 'Each child needs a different username' });
      seen.add(key);
    });
  });
