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
 *
 * ⚠️ Field naming matters: browser password managers / autofill (LastPass,
 * 1Password, Chrome, Safari) ignore `autocomplete="off"` and WILL fill a field
 * whose name looks like a real one (`website`, `url`, `company`, `companyWebsite`,
 * `email`, `phone`, …). If autofill populates the honeypot, a real human's
 * submission is silently dropped as "spam". So the field name is deliberately
 * meaningless (`hp_field`), it's marked `readonly` until focus (autofill skips
 * readonly inputs), and it sits inside an `autocomplete="off"` + off-screen
 * wrapper. A bot that blindly fills every input still trips it.
 */
export const HONEYPOT_FIELD = 'hp_field';
export const HONEYPOT_DEFAULT = { [HONEYPOT_FIELD]: '' };

export function isBot(values) {
  return Boolean(values?.[HONEYPOT_FIELD]);
}

export default function Honeypot({ register }) {
  return (
    <div
      aria-hidden="true"
      // `autocomplete="off"` on a wrapping element is a stronger hint to Chrome than on the
      // input alone; combined with the meaningless name + readonly-until-focus it keeps
      // password managers out.
      autoComplete="off"
      style={{
        position: 'absolute',
        left: '-9999px',
        top: 0,
        width: 1,
        height: 1,
        overflow: 'hidden',
        opacity: 0,
        pointerEvents: 'none',
      }}
    >
      <label htmlFor={HONEYPOT_FIELD}>Leave this field empty</label>
      <input
        id={HONEYPOT_FIELD}
        name={HONEYPOT_FIELD}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        // A human never focuses this (it's off-screen and not tabbable), so it can stay
        // readonly — and autofill skips readonly inputs entirely. A script that programmatically
        // sets .value still trips isBot().
        readOnly
        {...register(HONEYPOT_FIELD)}
      />
    </div>
  );
}
