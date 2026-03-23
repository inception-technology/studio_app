/**
 * types/calendar.ts
 *
 * Types alignés avec le schéma FastAPI (Module Calendrier).
 * Partagés entre le hook useCalendarSessions et la page /calendar.
 */

export type CalendarSession = {
  id:           number;
  title:        string;
  start:        string;           // ISO 8601
  end:          string;           // ISO 8601
  studio_id:    number;
  studio_name:  string;
  course_type:  "collective" | "individual";
  coach_name:   string;
  capacity:     number | null;
  booked_count: number;
  status:       "scheduled" | "cancelled" | "completed";
  rrule?:       string;           // RRULE string pour les séances récurrentes
};

export type CalendarSessions = CalendarSession[];

// ─── Mock fallback ────────────────────────────────────────────────────────────
// Utilisé uniquement si l'API /calendar/sessions ne répond pas encore.
// À supprimer quand GET /calendar/sessions sera disponible côté FastAPI.

export const MOCK_SESSIONS: CalendarSession[] = [
  {
    id: 1,
    title: "Taekwondo — Débutants",
    start: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
    end:   new Date(new Date().setHours(11, 0, 0, 0)).toISOString(),
    studio_id: 1,
    studio_name: "Downtown Academy",
    course_type: "collective",
    coach_name: "Master Kim",
    capacity: 20,
    booked_count: 14,
    status: "scheduled",
  },
  {
    id: 2,
    title: "Taekwondo — Intermédiaires",
    start: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
    end:   new Date(new Date().setHours(15, 30, 0, 0)).toISOString(),
    studio_id: 1,
    studio_name: "Downtown Academy",
    course_type: "collective",
    coach_name: "Coach Park",
    capacity: 15,
    booked_count: 15,
    status: "scheduled",
  },
  {
    id: 3,
    title: "Cours particulier — Ceinture noire",
    start: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().replace(/T.*/, "T09:00:00"),
    end:   new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().replace(/T.*/, "T10:00:00"),
    studio_id: 2,
    studio_name: "Westside Dojo",
    course_type: "individual",
    coach_name: "Master Kim",
    capacity: 1,
    booked_count: 1,
    status: "scheduled",
  },
  {
    id: 4,
    title: "Poomsae Competition Prep",
    start: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().replace(/T.*/, "T16:00:00"),
    end:   new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().replace(/T.*/, "T17:30:00"),
    studio_id: 1,
    studio_name: "Downtown Academy",
    course_type: "collective",
    coach_name: "Coach Park",
    capacity: 12,
    booked_count: 8,
    status: "scheduled",
  },
  {
    id: 5,
    title: "Taekwondo — Débutants",
    start: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().replace(/T.*/, "T10:00:00"),
    end:   new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().replace(/T.*/, "T11:00:00"),
    studio_id: 1,
    studio_name: "Downtown Academy",
    course_type: "collective",
    coach_name: "Master Kim",
    capacity: 20,
    booked_count: 12,
    status: "completed",
  },
];
