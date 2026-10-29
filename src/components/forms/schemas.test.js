import { describe, it, expect } from 'vitest';
import { enrollSchema, pathwayEnrollSchema, contactSchema, storeEnquirySchema } from './schemas.js';
import { HONEYPOT_FIELD } from './Honeypot.jsx';

// A date of birth `years` old today (a day short of the next birthday).
const bornYearsAgo = (years) => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

const validEnroll = {
  parentName: 'Alex Doe',
  parentEmail: 'alex@example.com',
  parentPhone: '0712345678',
  learnerName: 'Kid Doe',
  learnerDateOfBirth: bornYearsAgo(9),
  interestedIn: 'bootcamp',
  message: '',
};

describe('enrollSchema', () => {
  it('accepts a valid payload with the learner’s date of birth', () => {
    const r = enrollSchema.safeParse(validEnroll);
    expect(r.success).toBe(true);
    expect(r.data.learnerDateOfBirth).toBe(validEnroll.learnerDateOfBirth);
  });

  it('keeps interestedIn (it is a real select, not stripped) and rejects an off-enum value', () => {
    const r = enrollSchema.safeParse(validEnroll);
    expect(r.data.interestedIn).toBe('bootcamp');
    expect(enrollSchema.safeParse({ ...validEnroll, interestedIn: 'nonsense' }).success).toBe(false);
    // omitted → defaults to 'general'
    const noInterest = { ...validEnroll };
    delete noInterest.interestedIn;
    expect(enrollSchema.safeParse(noInterest).data.interestedIn).toBe('general');
  });

  it('rejects a bad email', () => {
    expect(enrollSchema.safeParse({ ...validEnroll, parentEmail: 'nope' }).success).toBe(false);
  });

  it('rejects a date of birth outside ages 3–19, in the future, or missing', () => {
    expect(enrollSchema.safeParse({ ...validEnroll, learnerDateOfBirth: bornYearsAgo(25) }).success).toBe(false);
    expect(enrollSchema.safeParse({ ...validEnroll, learnerDateOfBirth: bornYearsAgo(2) }).success).toBe(false);
    expect(enrollSchema.safeParse({ ...validEnroll, learnerDateOfBirth: '2999-01-01' }).success).toBe(false);
    expect(enrollSchema.safeParse({ ...validEnroll, learnerDateOfBirth: '' }).success).toBe(false);
  });

  it('rejects a phone with letters', () => {
    expect(enrollSchema.safeParse({ ...validEnroll, parentPhone: 'call me' }).success).toBe(false);
  });

  it('keeps the honeypot field when present', () => {
    const r = enrollSchema.safeParse({ ...validEnroll, [HONEYPOT_FIELD]: 'http://spam' });
    expect(r.success).toBe(true);
    expect(r.data[HONEYPOT_FIELD]).toBe('http://spam');
  });
});

describe('pathwayEnrollSchema', () => {
  it('requires a hubType and keeps the optional hubId/hubName', () => {
    expect(pathwayEnrollSchema.safeParse(validEnroll).success).toBe(false); // no hubType
    const ok = pathwayEnrollSchema.safeParse({
      ...validEnroll,
      hubType: 'tech_club',
      hubId: 'abc',
      hubName: 'Westlands Tech Club',
    });
    expect(ok.success).toBe(true);
    expect(ok.data.hubType).toBe('tech_club');
    expect(ok.data.hubName).toBe('Westlands Tech Club');
  });

  it('accepts a hubType with no chosen hub', () => {
    const r = pathwayEnrollSchema.safeParse({ ...validEnroll, hubType: 'makerspace' });
    expect(r.success).toBe(true);
  });
});

describe('storeEnquirySchema', () => {
  const base = {
    parentName: 'Alex Doe',
    parentEmail: 'alex@example.com',
    parentPhone: '0712345678',
    interestedIn: 'quarky',
  };

  it('accepts a store enquiry with no learner name or date of birth', () => {
    const r = storeEnquirySchema.safeParse({ ...base, learnerName: '', learnerDateOfBirth: '' });
    expect(r.success).toBe(true);
  });

  it('still validates a date of birth when one is given', () => {
    expect(storeEnquirySchema.safeParse({ ...base, learnerDateOfBirth: bornYearsAgo(25) }).success).toBe(false);
    const ok = storeEnquirySchema.safeParse({ ...base, learnerDateOfBirth: bornYearsAgo(11) });
    expect(ok.success).toBe(true);
  });

  it('still requires a valid parent email and phone', () => {
    expect(storeEnquirySchema.safeParse({ ...base, parentEmail: 'nope' }).success).toBe(false);
    expect(storeEnquirySchema.safeParse({ ...base, parentPhone: 'call me' }).success).toBe(false);
  });
});

describe('contactSchema', () => {
  const validContact = { name: 'Al', email: 'a@b.com', phone: '', message: 'Hello, I have a question.' };

  it('accepts a valid payload with no phone', () => {
    expect(contactSchema.safeParse(validContact).success).toBe(true);
  });

  it('rejects a too-short message', () => {
    expect(contactSchema.safeParse({ ...validContact, message: 'hi' }).success).toBe(false);
  });
});
