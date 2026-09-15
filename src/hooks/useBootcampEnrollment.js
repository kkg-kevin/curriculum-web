import { useMutation } from '@tanstack/react-query';
import { publicApi } from '../services/api.js';

/**
 * POST /api/public/bootcamp-enrollments — unlike useLeadSubmission, this immediately
 * provisions a real learner account (see server: bootcamp-enrollment.service.js). The
 * response includes { learnerLoginEmail, learnerTempPassword } shown to the visitor exactly
 * once by BootcampEnrollForm's confirmation state.
 */
export function useSubmitBootcampEnrollment() {
  return useMutation({
    mutationFn: (payload) => publicApi.submitBootcampEnrollment(payload),
  });
}
