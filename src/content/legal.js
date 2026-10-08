/**
 * The Privacy Policy (/privacy) and Terms of Use (/terms), as data for pages/LegalPage.jsx.
 *
 * ⚠️ DRAFT WORDING — written from what this site and the curriculum system actually do, not by a
 * lawyer. Have it reviewed before relying on it, and keep it true: when the forms collect
 * something new, a tool such as analytics is added, or payment moves online, update the matching
 * section and `updated`.
 *
 * Shape: { title, description, updated, intro, sections: [{ heading, paragraphs?, bullets?,
 * after? }] } — a section renders its paragraphs, then its bullet list, then `after`.
 * `{email}` in any string is replaced with ORG.email.
 */

const UPDATED = '8 October 2026';

export const privacyPolicy = {
  title: 'Privacy Policy',
  description: 'What personal information Digifunzi collects on this website, why, who sees it, and how to see, correct or delete it.',
  updated: UPDATED,
  intro:
    'This page explains what Digifunzi collects when you use this website, what we do with it, and the choices you have. Most of what we collect is about children, given to us by a parent or guardian, so we try to ask for as little as we need.',
  sections: [
    {
      heading: 'Who we are',
      paragraphs: [
        'Digifunzi is a STEM education company based in Nairobi, Kenya. We decide how the information described here is used. For anything about your information, write to {email}.',
      ],
    },
    {
      heading: 'What we collect',
      paragraphs: ['We collect what you type into a form on this site. Which details depends on the form:'],
      after: [
        'Like most websites, our servers also keep routine technical logs, such as the address your request came from and when, for security and troubleshooting.',
      ],
      bullets: [
        'Contact form: your name, email, phone number if you give one, and your message.',
        'Enroll and enquiry forms: your name, email and phone number; the learner’s name and age; what you are interested in; the kind of learning hub you chose; and any note you add.',
        'Pathway diagnostic: your name and phone number, the child’s age, the child’s first name if you give it, and the answers and results.',
        'Bootcamp enrolment: the details on the Enroll form, plus a username and password that become the learner’s login.',
        'Home Schooling sign-up: your name, email, phone number and password; each child’s name, gender, date of birth if you give it, current school and grade, and a username and password; and your home’s county, town, address and directions, so an educator can reach you.',
      ],
    },
    {
      heading: 'What we do not collect',
      paragraphs: [
        'This website does not use advertising or analytics cookies, and it does not track you across other sites. It keeps one small setting in your own browser: whether you chose the light or dark theme. We do not take card or mobile-money details on this site.',
      ],
    },
    {
      heading: 'How we use it',
      bullets: [
        'To reply to your enquiry and arrange a place for your child.',
        'To create and run the accounts you sign up for, place each child at the right level and assign an educator.',
        'To issue invoices and receipts and record payments.',
        'To send messages about your account, such as password resets, invoices, receipts and notices about your child’s learning.',
      ],
      after: ['We do not sell your information, and we do not use it for anyone else’s marketing.'],
    },
    {
      heading: 'Who sees it',
      bullets: [
        'Digifunzi staff who handle enquiries, enrolment and billing.',
        'The educator and the learning hub your child is placed with, who see what they need to teach and support that child.',
        'The companies that host our systems and deliver our email, who handle the information only to provide that service to us.',
      ],
      after: [
        'A course certificate carries a verification link, printed on it as a QR code. Anyone given that link can see the learner’s name, the course, the learning hub and the date it was awarded, and whether the certificate is still valid. Nothing else about the learner is shown.',
        'A diagnostic report has its own link. Anyone you share that link with can open it. The report shows the child’s first name if you gave one, their age and their results. It never shows your name, phone number or email.',
      ],
    },
    {
      heading: 'Children’s information',
      paragraphs: [
        'Our forms are meant to be filled in by a parent or guardian. If you are under 18, please ask a parent or guardian to fill them in for you. If you believe a child has given us information without a parent’s or guardian’s agreement, tell us and we will remove it.',
      ],
    },
    {
      heading: 'How long we keep it',
      paragraphs: [
        'We keep enquiries for as long as we need to follow them up, and account, learning and billing records for as long as the account is open and for as long afterwards as the law requires us to keep them. You can ask us to delete your information sooner (see below).',
      ],
    },
    {
      heading: 'Your choices and rights',
      paragraphs: [
        'Under Kenya’s Data Protection Act, 2019, you can ask us what information we hold about you and your child, ask us to correct it, ask us to delete it, and object to how we use it. Write to {email} and we will act on your request.',
        'Every notification email has a link at the bottom to choose which emails you receive. Emails you need in order to use your account, such as password resets, are always sent.',
        'If you are not satisfied with how we handle a request, you can complain to the Office of the Data Protection Commissioner of Kenya.',
      ],
    },
    {
      heading: 'Keeping it safe',
      paragraphs: [
        'This site is served over an encrypted connection, and access to the information is limited to the people described above. No system is perfectly secure, so please choose a password you do not use elsewhere and keep your logins to yourself.',
      ],
    },
    {
      heading: 'Changes to this policy',
      paragraphs: [
        'When we change what we collect or how we use it, we will update this page and the date at the top.',
      ],
    },
  ],
};

export const termsOfUse = {
  title: 'Terms of Use',
  description: 'The terms for using the Digifunzi website: enquiries, prices, accounts and payment, and what you can do with our content.',
  updated: UPDATED,
  intro:
    'These terms cover your use of this website. They do not replace anything our team agrees with you about a particular programme.',
  sections: [
    {
      heading: 'About this website',
      paragraphs: [
        'This website describes Digifunzi’s programmes and products and lets you enquire, enrol and sign up. We work to keep it accurate, but dates, places and availability can change. Our team confirms the details with you directly.',
      ],
    },
    {
      heading: 'Enquiries',
      paragraphs: [
        'Sending the Contact, Enroll or enquiry form is a request for us to get in touch. It is not a payment and does not commit you to anything, and it does not by itself guarantee a place.',
      ],
    },
    {
      heading: 'Prices',
      paragraphs: [
        'Where a price is marked as indicative, it is a guide and not an offer. The price you pay is the one our team confirms with you before you pay.',
      ],
    },
    {
      heading: 'Accounts',
      paragraphs: [
        'Bootcamp enrolment and Home Schooling sign-up create logins for you or your child. Give accurate details, keep the usernames and passwords private, and tell us if you think someone else has used them. A parent or guardian is responsible for an account created for a child.',
      ],
    },
    {
      heading: 'Payment',
      paragraphs: [
        'You cannot pay on this website. Payment is arranged with our team. An account you create here may show limited access until we have confirmed your payment.',
      ],
    },
    {
      heading: 'Our content',
      paragraphs: [
        'The text, images, lessons, diagnostics and reports on this site belong to Digifunzi or to those who license them to us. You may view and share them for your own family’s or school’s use. Please do not copy, resell or republish them without our written permission.',
      ],
    },
    {
      heading: 'Using the site fairly',
      paragraphs: [
        'Please do not submit false details or details about someone else without their agreement, try to get into accounts or systems that are not yours, or interfere with how the site works.',
      ],
    },
    {
      heading: 'Links to other websites',
      paragraphs: [
        'Some pages link to websites we do not run, such as a competition organiser’s registration page. We are not responsible for those sites or what they do with your information.',
      ],
    },
    {
      heading: 'Our responsibility',
      paragraphs: [
        'We provide this website as it is. As far as the law allows, we are not liable for loss caused by relying on information on it that later changes, or by the site being unavailable. Nothing here limits any right you have that the law does not allow to be limited.',
      ],
    },
    {
      heading: 'Law',
      paragraphs: ['These terms are governed by the laws of Kenya.'],
    },
    {
      heading: 'Changes and contact',
      paragraphs: [
        'We may update these terms; the date at the top shows the latest version. Questions about them can go to {email}.',
      ],
    },
  ],
};
