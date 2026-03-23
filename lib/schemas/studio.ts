/**
 * lib/schemas/studio.ts
 *
 * Schéma Zod pour le formulaire de création / édition d'un studio.
 */
import { z } from "zod";

export type StudioFormMessages = {
  nameRequired:     string;
  cityRequired:     string;
  countryRequired:  string;
  timezoneRequired: string;
};

export function makeStudioSchema(msg: StudioFormMessages) {
  return z.object({
    name:           z.string().min(1, msg.nameRequired),
    address_line1:  z.string().optional(),
    address_line2:  z.string().optional(),
    zipcode:        z.string().optional(),
    city:           z.string().min(1, msg.cityRequired),
    code_country:   z.string().min(1, msg.countryRequired),
    code_timezone:  z.string().min(1, msg.timezoneRequired),
  });
}

export type StudioFormData = z.infer<ReturnType<typeof makeStudioSchema>>;
