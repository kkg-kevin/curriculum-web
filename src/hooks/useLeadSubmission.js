import { useMutation } from '@tanstack/react-query';
import { publicApi } from '../services/api.js';

/**
 * POST /api/public/leads — shared by the Enroll and Contact forms (spec §4.5).
 * The endpoint is notify-first: it emails the Digifunzi team; the visitor never
 * gets an account from this call.
 */
export function useLeadSubmission() {
  return useMutation({
    mutationFn: (payload) => publicApi.submitLead(payload),
  });
}

/** POST /api/public/contact — simpler general-inquiry variant. */
export function useContactSubmission() {
  return useMutation({
    mutationFn: (payload) => publicApi.submitContact(payload),
  });
}
