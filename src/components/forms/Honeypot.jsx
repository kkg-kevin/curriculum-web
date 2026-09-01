/**
 * Honeypot anti-spam field. Hidden from humans (off-screen, aria-hidden,
 * not tabbable); bots that auto-fill every field populate it.
 *
 * Usage with react-hook-form:
 *   <Honeypot register={register} />                        // in the form JSX
 *   defaultValues: { ...HONEYPOT_DEFAULT }                  // in useForm()
 *   if (isBot(values)) { return fakeSuccess(); }            // in onSubmit
 *
 * Cheap first layer only — the server still rate-limits the /api/public/* POST
 * endpoints (spec §4.6).
 */
export const HONEYPOT_FIELD = 'companyWebsite'; // plausible-looking name to tempt bots
export const HONEYPOT_DEFAULT = { [HONEYPOT_FIELD]: '' };

export function isBot(values) {
  return Boolean(values?.[HONEYPOT_FIELD]);
}

export default function Honeypot({ register }) {
  return (
    <div
      aria-hidden="true"
      style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}
    >
      <label htmlFor={HONEYPOT_FIELD}>Leave this field empty</label>
      <input
        id={HONEYPOT_FIELD}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        {...register(HONEYPOT_FIELD)}
      />
    </div>
  );
}
