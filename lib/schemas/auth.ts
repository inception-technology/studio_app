/**
 * lib/schemas/auth.ts
 *
 * Schémas Zod pour les formulaires d'authentification.
 * Les messages d'erreur sont injectés via des fonctions factory pour rester
 * compatibles avec next-intl (les messages viennent du hook useTranslations).
 *
 * Usage dans un composant :
 *   const t = useTranslations("Login");
 *   const schema = makeLoginSchema(t);
 *   const { register } = useForm({ resolver: zodResolver(schema) });
 */
import { z } from "zod";

// ─── Types pour les messages traduits ────────────────────────────────────────

export type LoginMessages = {
  emailRequired:    string;
  passwordRequired: string;
};

export type SignupMessages = {
  fillRequired:        string;
  emailInvalid:        string;
  passwordMin:         string;
  passwordUpper:       string;
  passwordLower:       string;
  passwordDigit:       string;
  passwordSpecial:     string;
  consentRequired:     string;
  organizationRequired: string;
};

// ─── Schéma Login ─────────────────────────────────────────────────────────────

export function makeLoginSchema(msg: LoginMessages) {
  return z.object({
    username: z.string().min(1, msg.emailRequired),
    password: z.string().min(1, msg.passwordRequired),
  });
}

export type LoginData = z.infer<ReturnType<typeof makeLoginSchema>>;

// ─── Schéma Signup ────────────────────────────────────────────────────────────

/**
 * profile_id est passé en argument pour activer la validation conditionnelle
 * de organization_name (obligatoire uniquement si profile_id === 1).
 */
export function makeSignupSchema(msg: SignupMessages, profile_id: number) {
  return z
    .object({
      firstname:         z.string().min(1, msg.fillRequired),
      lastname:          z.string().min(1, msg.fillRequired),
      email:             z.string().min(1, msg.fillRequired).email(msg.emailInvalid),
      password:          z
        .string()
        .min(10,                              msg.passwordMin)
        .regex(/[A-Z]/,                       msg.passwordUpper)
        .regex(/[a-z]/,                       msg.passwordLower)
        .regex(/\d/,                          msg.passwordDigit)
        .regex(/[^A-Za-z0-9]/,               msg.passwordSpecial),
      consent:           z.boolean().refine((v) => v === true, { message: msg.consentRequired }),
      organization_name: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      // organization_name obligatoire uniquement pour les Owners (profile_id === 1)
      if (profile_id === 1 && !data.organization_name?.trim()) {
        ctx.addIssue({
          code:    z.ZodIssueCode.custom,
          path:    ["organization_name"],
          message: msg.organizationRequired,
        });
      }
    });
}

export type SignupData = z.infer<ReturnType<typeof makeSignupSchema>>;
