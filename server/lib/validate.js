/**
 * Server-side validation for the two public POST bodies. Deliberately mirrors
 * src/components/forms/schemas.js and the curriculum system's contract, so a
 * payload that passes the browser form passes here too.
 *
 * Each validator returns { ok: true, value } or { ok: false, errors: [{field,message}] }.
 */

const PHONE_RE = /^[+0-9()\-\s]+$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(v) {
  return typeof v === 'string' ? v.trim() : '';
}

export function validateLead(body = {}) {
  const errors = [];
  const parentName = str(body.parentName);
  const parentEmail = str(body.parentEmail);
  const parentPhone = str(body.parentPhone);
  const learnerName = str(body.learnerName);
  const note = str(body.note);
  const interestedIn = str(body.interestedIn) || 'general';
  const referenceId = body.referenceId == null ? null : str(body.referenceId);

  if (parentName.length < 2 || parentName.length > 120)
    errors.push({ field: 'parentName', message: 'parentName must be 2–120 characters' });
  if (!EMAIL_RE.test(parentEmail) || parentEmail.length > 160)
    errors.push({ field: 'parentEmail', message: 'parentEmail must be a valid email' });
  if (parentPhone && (parentPhone.length < 7 || parentPhone.length > 20 || !PHONE_RE.test(parentPhone)))
    errors.push({ field: 'parentPhone', message: 'parentPhone is not a valid phone number' });
  if (learnerName.length > 120)
    errors.push({ field: 'learnerName', message: 'learnerName too long' });

  let learnerAge = null;
  if (body.learnerAge !== undefined && body.learnerAge !== null && body.learnerAge !== '') {
    learnerAge = Number(body.learnerAge);
    if (!Number.isInteger(learnerAge) || learnerAge < 3 || learnerAge > 19)
      errors.push({ field: 'learnerAge', message: 'learnerAge must be a whole number 3–19' });
  }

  if (!['bootcamp', 'project', 'quarky', 'general'].includes(interestedIn))
    errors.push({ field: 'interestedIn', message: 'interestedIn is not a recognised value' });
  if (referenceId && referenceId.length > 100)
    errors.push({ field: 'referenceId', message: 'referenceId too long' });
  if (note.length > 1000)
    errors.push({ field: 'note', message: 'note too long (max 1000)' });

  if (errors.length) return { ok: false, errors };
  return {
    ok: true,
    value: {
      source: 'lead',
      parentName,
      parentEmail,
      parentPhone: parentPhone || null,
      learnerName: learnerName || null,
      learnerAge,
      interestedIn,
      referenceId,
      note: note || null,
      status: 'new',
    },
  };
}

export function validateContact(body = {}) {
  const errors = [];
  const name = str(body.name);
  const email = str(body.email);
  const phone = str(body.phone);
  const message = str(body.message);

  if (name.length < 2 || name.length > 120)
    errors.push({ field: 'name', message: 'name must be 2–120 characters' });
  if (!EMAIL_RE.test(email) || email.length > 160)
    errors.push({ field: 'email', message: 'email must be a valid email' });
  if (phone && (phone.length < 7 || phone.length > 20 || !PHONE_RE.test(phone)))
    errors.push({ field: 'phone', message: 'phone is not a valid phone number' });
  if (message.length < 10 || message.length > 2000)
    errors.push({ field: 'message', message: 'message must be 10–2000 characters' });

  if (errors.length) return { ok: false, errors };
  return {
    ok: true,
    value: { source: 'contact', name, email, phone: phone || null, message, status: 'new' },
  };
}
