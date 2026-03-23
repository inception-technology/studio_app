"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import AppHeader from "@/components/shared/AppHeader";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft, ChevronRight, Plus, RefreshCw } from "lucide-react";
import type { CalendarApi, EventClickArg, EventInput } from "@fullcalendar/core";
import { useCalendarSessions } from "@/hooks/useCalendarSessions";
import type { CalendarSession } from "@/types/calendar";

// FullCalendar ne supporte pas le SSR — chargement dynamique obligatoire
const FullCalendarDynamic = dynamic(() => import("./_fullcalendar"), { ssr: false });

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sessionToEvent(s: CalendarSession): EventInput {
  const isFull      = s.capacity !== null && s.booked_count >= s.capacity;
  const isCancelled = s.status === "cancelled";
  const isCompleted = s.status === "completed";

  let backgroundColor = "var(--color-organization)";
  let borderColor     = "var(--color-organization)";
  let opacity         = "1";

  if (isCancelled)            { backgroundColor = "#94a3b8"; borderColor = "#94a3b8"; }
  else if (isCompleted)       { backgroundColor = "#64748b"; borderColor = "#64748b"; opacity = "0.7"; }
  else if (s.course_type === "individual") { backgroundColor = "var(--color-member)"; borderColor = "var(--color-member)"; }
  else if (isFull)            { backgroundColor = "#f59e0b"; borderColor = "#f59e0b"; }

  return {
    id:            String(s.id),
    title:         s.title,
    start:         s.start,
    end:           s.end,
    backgroundColor,
    borderColor,
    textColor:     "#ffffff",
    extendedProps: { session: s, opacity },
  };
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function CalendarPage() {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const calendarRef = useRef<{ getApi: () => CalendarApi } | null>(null);

  const [view, setView]           = useState<"timeGridWeek" | "dayGridMonth" | "timeGridDay" | "listWeek">("timeGridWeek");
  const [title, setTitle]         = useState("");
  const [selectedSession, setSelectedSession] = useState<CalendarSession | null>(null);

  // Plage de dates visible par le calendrier (mise à jour via onDatesSet)
  const [range, setRange] = useState<{ start?: string; end?: string }>({});

  // ── Auth guard ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace("/login");
  }, [authLoading, isAuthenticated, router]);

  // ── React Query ───────────────────────────────────────────────────────────
  const { sessions, isFetching, refetch } = useCalendarSessions({
    start: range.start,
    end:   range.end,
  });

  // ── Callback datesSet (FullCalendar → range state → query key) ────────────
  const handleDatesSet = useCallback((start: string, end: string) => {
    setRange((prev) => {
      if (prev.start === start && prev.end === end) return prev; // évite re-render inutile
      return { start, end };
    });
  }, []);

  // ── Navigation calendrier ─────────────────────────────────────────────────
  function changeView(newView: typeof view) {
    setView(newView);
    calendarRef.current?.getApi().changeView(newView);
  }

  function navigate(dir: "prev" | "next" | "today") {
    const api = calendarRef.current?.getApi();
    if (!api) return;
    if (dir === "today") api.today();
    else if (dir === "prev") api.prev();
    else api.next();
    setTitle(api.view.title);
  }

  // ── Click sur un événement ────────────────────────────────────────────────
  function onEventClick(info: EventClickArg) {
    const session = info.event.extendedProps.session as CalendarSession;
    setSelectedSession(session);
  }

  // ── Loading auth ──────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-organization rounded-full animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) return null;

  const events = sessions.map(sessionToEvent);

  return (
    <div className="flex flex-col w-full p-6">
      <AppHeader title="Calendar" />

      {/* ── Légende ── */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs font-semibold">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-organization inline-block" />
          Cours collectif
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-member inline-block" />
          Cours individuel
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
          Complet
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-slate-400 inline-block" />
          Annulé / Terminé
        </span>
      </div>

      {/* ── Barre de contrôles ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("prev")}
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate("today")}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Today
          </button>
          <button
            onClick={() => navigate("next")}
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-slate-700 ml-2">{title}</span>
        </div>

        {/* Sélecteur de vue */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {(["timeGridDay", "timeGridWeek", "dayGridMonth", "listWeek"] as const).map((v) => {
            const labels: Record<string, string> = {
              timeGridDay:  "Day",
              timeGridWeek: "Week",
              dayGridMonth: "Month",
              listWeek:     "List",
            };
            return (
              <button
                key={v}
                onClick={() => changeView(v)}
                className={`px-3 py-1 rounded-md text-sm font-semibold transition-all cursor-pointer ${
                  view === v
                    ? "bg-white shadow text-organization"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {labels[v]}
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => void refetch()}
            disabled={isFetching}
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-organization hover:bg-organization/90 text-white text-sm font-bold rounded-lg transition-colors cursor-pointer">
            <Plus className="w-4 h-4" />
            New Session
          </button>
        </div>
      </div>

      {/* ── Calendrier ── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden fc-custom">
        <FullCalendarDynamic
          calendarRef={calendarRef}
          events={events}
          view={view}
          onEventClick={onEventClick}
          onTitleChange={setTitle}
          onDatesSet={handleDatesSet}
        />
      </div>

      {/* ── Panneau détail séance ── */}
      {selectedSession && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
          onClick={() => setSelectedSession(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{selectedSession.title}</h2>
                <p className="text-sm text-slate-500">{selectedSession.studio_name}</p>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                selectedSession.status === "scheduled" ? "bg-green-100 text-green-700" :
                selectedSession.status === "cancelled" ? "bg-red-100 text-red-700" :
                "bg-slate-100 text-slate-600"
              }`}>
                {selectedSession.status}
              </span>
            </div>

            {/* Infos */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Date</span>
                <span className="font-semibold">
                  {new Date(selectedSession.start).toLocaleDateString("fr-FR", {
                    weekday: "long", day: "numeric", month: "long",
                  })}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Horaire</span>
                <span className="font-semibold">
                  {new Date(selectedSession.start).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  {" → "}
                  {new Date(selectedSession.end).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Coach</span>
                <span className="font-semibold">{selectedSession.coach_name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Type</span>
                <span className={`font-semibold capitalize ${
                  selectedSession.course_type === "individual" ? "text-member" : "text-organization"
                }`}>
                  {selectedSession.course_type}
                </span>
              </div>
              {selectedSession.capacity !== null && (
                <div className="flex justify-between py-2">
                  <span className="text-slate-500 font-medium">Réservations</span>
                  <span className={`font-bold ${
                    selectedSession.booked_count >= selectedSession.capacity
                      ? "text-amber-500"
                      : "text-green-600"
                  }`}>
                    {selectedSession.booked_count} / {selectedSession.capacity}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelectedSession(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Fermer
              </button>
              <button className="flex-1 py-2.5 rounded-xl bg-organization text-white text-sm font-semibold hover:bg-organization/90 transition-colors cursor-pointer">
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
