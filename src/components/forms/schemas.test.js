import { describe, it, expect } from 'vitest';
import { enrollSchema, contactSchema } from './schemas.js';

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
    const r = enrollSchema.safeParse({ ...validEnroll, companyWebsite: 'http://spam' });
    expect(r.success).toBe(true);
    expect(r.data.companyWebsite).toBe('http://spam');
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
