import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../services/api.js';

/**
 * General events (showcases, open days, talks) — GET /api/public/events (server:
 * modules/general-events/). Each event:
 *   { id, slug, title, kind, kindLabel, tagline, description (HTML), descriptionText, coverImage,
 *     images[], startDate, startTime, endDate, endTime, when, startsAt, endsAt, format,
 *     formatLabel, where, venueName, venueAddress, mapUrl, state, free,
 *     registration: { open, reason, full, waitlist, seatsLeft, maxPartySize },
 *     askAboutYou, questions: { personTypes, interests, heardFrom }, cancelReason }
 */
export function usePublicEvents({ past = false } = {}) {
  return useQuery({
    queryKey: ['public-events', past ? 'past' : 'upcoming'],
    queryFn: () => publicApi.listEvents({ past }),
    staleTime: 60 * 1000,
  });
}

export function usePublicEvent(slug) {
  return useQuery({
    queryKey: ['public-event', slug],
    queryFn: () => publicApi.getEvent(slug),
    enabled: Boolean(slug),
    staleTime: 30 * 1000,
    retry: (count, err) => err?.status !== 404 && count < 2,
  });
}

/** The pop-up's event (the soonest with one showing today), or null. Never retried or shown on error. */
export function useEventPopup({ enabled = true } = {}) {
  return useQuery({
    queryKey: ['public-event-popup'],
    queryFn: publicApi.getEventPopup,
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useEventRegistration(token) {
  return useQuery({
    queryKey: ['public-event-registration', token],
    queryFn: () => publicApi.getEventRegistration(token),
    enabled: Boolean(token),
    retry: (count, err) => err?.status !== 404 && count < 2,
  });
}
