"use client";

// Composant wrapper chargé dynamiquement (no SSR)
// FullCalendar importe des APIs navigateur qui ne fonctionnent pas côté serveur.

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin  from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin     from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import type { CalendarApi, EventClickArg, EventInput } from "@fullcalendar/core";
import { useEffect } from "react";

type Props = {
  calendarRef: React.RefObject<{ getApi: () => CalendarApi } | null>;
  events: EventInput[];
  view: string;
  onEventClick: (info: EventClickArg) => void;
  onTitleChange: (title: string) => void;
  /** Appelé à chaque changement de plage visible (navigation, changement de vue) */
  onDatesSet?: (start: string, end: string) => void;
};

export default function FullCalendarWrapper({
  calendarRef,
  events,
  view,
  onEventClick,
  onTitleChange,
  onDatesSet,
}: Props) {

  // Synchroniser le titre au montage
  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (api) onTitleChange(api.view.title);
  });

  return (
    <FullCalendar
      ref={calendarRef as React.RefObject<FullCalendar>}
      plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
      initialView={view}
      headerToolbar={false}       // On gère la barre de navigation nous-mêmes
      events={events}
      eventClick={onEventClick}
      editable={false}
      selectable={true}
      selectMirror={true}
      dayMaxEvents={3}            // "+X more" si trop d'événements dans une case
      weekends={true}
      nowIndicator={true}         // Ligne rouge "maintenant" dans les vues horaires
      slotMinTime="07:00:00"
      slotMaxTime="22:00:00"
      slotDuration="00:30:00"
      locale="fr"
      firstDay={1}                // Semaine commence lundi
      height="auto"
      expandRows={true}
      businessHours={{
        daysOfWeek: [1, 2, 3, 4, 5, 6],
        startTime: "08:00",
        endTime: "21:00",
      }}
      eventDidMount={(info) => {
        // Appliquer l'opacité pour les événements terminés
        const opacity = info.event.extendedProps.opacity as string | undefined;
        if (opacity) info.el.style.opacity = opacity;
      }}
      datesSet={(dateInfo) => {
        onTitleChange(dateInfo.view.title);
        onDatesSet?.(dateInfo.startStr, dateInfo.endStr);
      }}
    />
  );
}
