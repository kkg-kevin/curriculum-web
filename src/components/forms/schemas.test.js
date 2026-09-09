import { describe, it, expect } from 'vitest';
import { enrollSchema, contactSchema, storeEnquirySchema } from './schemas.js';
import { HONEYPOT_FIELD } from './Honeypot.jsx';

const validEnroll = {
  parentName: 'Alex Doe',
  parentEmail: 'alex@example.com',
  parentPhone: '0712345678',
  learnerName: 'Kid Doe',
  learnerAge: '9',
  interestedIn: 'bootcamp',
  message: '',
};

describe('enrollSchema', () => {
  it('accepts a valid payload and coerces age to a number', () => {
    const r = enrollSchema.safeParse(validEnroll);
    expect(r.success).toBe(true);
    expect(r.data.learnerAge).toBe(9);
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

  it('rejects an out-of-range age', () => {
    expect(enrollSchema.safeParse({ ...validEnroll, learnerAge: '25' }).success).toBe(false);
    expect(enrollSchema.safeParse({ ...validEnroll, learnerAge: '2' }).success).toBe(false);
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

describe('storeEnquirySchema', () => {
  const base = {
    parentName: 'Alex Doe',
    parentEmail: 'alex@example.com',
    parentPhone: '0712345678',
    interestedIn: 'quarky',
  };

  it('accepts a store enquiry with no learner name or age', () => {
    const r = storeEnquirySchema.safeParse({ ...base, learnerName: '', learnerAge: '' });
    expect(r.success).toBe(true);
  });

  it('still validates a learner age when one is given', () => {
    expect(storeEnquirySchema.safeParse({ ...base, learnerAge: '25' }).success).toBe(false);
    const ok = storeEnquirySchema.safeParse({ ...base, learnerAge: '11' });
    expect(ok.success).toBe(true);
    expect(ok.data.learnerAge).toBe(11);
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
