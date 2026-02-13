"use client";

import { useState, useEffect, useCallback } from "react";
import { ScheduleEvent } from "@/types";

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export default function ScheduleView() {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(
    null
  );

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/schedule");
      if (!res.ok) throw new Error("取得失敗");
      const data = await res.json();
      setEvents(data);
      setError(null);
    } catch {
      setError("スケジュールの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const goToday = () => {
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
  };

  // Map events by date
  const eventsByDate: Record<string, ScheduleEvent[]> = {};
  events.forEach((evt) => {
    if (evt.date) {
      const key = evt.date.slice(0, 10);
      if (!eventsByDate[key]) eventsByDate[key] = [];
      eventsByDate[key].push(evt);
    }
  });

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);
  const todayKey = formatDateKey(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  // Upcoming events (from today)
  const upcoming = events
    .filter((e) => e.date && e.date >= todayKey)
    .sort((a, b) => (a.date! > b.date! ? 1 : -1))
    .slice(0, 10);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => {
            setLoading(true);
            fetchEvents();
          }}
          className="bg-amber-500 text-white px-4 py-2 rounded-lg"
        >
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 text-xl rounded-lg active:bg-gray-100"
        >
          ◀
        </button>
        <div className="text-center">
          <h2 className="text-lg font-bold">
            {viewYear}年{viewMonth + 1}月
          </h2>
          <button
            onClick={goToday}
            className="text-xs text-amber-600 underline"
          >
            今月に戻る
          </button>
        </div>
        <button
          onClick={nextMonth}
          className="p-2 text-xl rounded-lg active:bg-gray-100"
        >
          ▶
        </button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0 mb-6">
        {/* Weekday headers */}
        {WEEKDAYS.map((wd, i) => (
          <div
            key={wd}
            className={`text-center text-xs font-bold py-1 ${
              i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-400"
            }`}
          >
            {wd}
          </div>
        ))}

        {/* Empty cells for first week */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="p-1" />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateKey = formatDateKey(viewYear, viewMonth, day);
          const dayEvents = eventsByDate[dateKey] || [];
          const isToday = dateKey === todayKey;
          const dayOfWeek = (firstDay + i) % 7;

          return (
            <button
              key={day}
              onClick={() => {
                if (dayEvents.length > 0) {
                  setSelectedEvent(dayEvents[0]);
                }
              }}
              className={`p-1 min-h-[48px] border border-gray-50 rounded text-left relative ${
                isToday ? "bg-amber-50 border-amber-300" : ""
              } ${dayEvents.length > 0 ? "active:bg-gray-100" : ""}`}
            >
              <span
                className={`text-xs ${
                  isToday
                    ? "bg-amber-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                    : dayOfWeek === 0
                    ? "text-red-400"
                    : dayOfWeek === 6
                    ? "text-blue-400"
                    : "text-gray-600"
                }`}
              >
                {day}
              </span>
              {dayEvents.length > 0 && (
                <div className="mt-0.5">
                  {dayEvents.slice(0, 2).map((evt) => (
                    <div
                      key={evt.id}
                      className="text-[9px] leading-tight text-amber-700 bg-amber-100 rounded px-0.5 mb-0.5 truncate"
                    >
                      {evt.name}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-[9px] text-gray-400">
                      +{dayEvents.length - 2}
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Event detail modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/30 z-20 flex items-end justify-center"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-white rounded-t-2xl w-full max-w-lg p-6 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">{selectedEvent.name}</h3>
            <div className="space-y-2 text-sm text-gray-600">
              {selectedEvent.date && (
                <p>
                  📅{" "}
                  {new Date(selectedEvent.date).toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    weekday: "short",
                  })}
                </p>
              )}
              {selectedEvent.time && <p>🕐 {selectedEvent.time}</p>}
              {selectedEvent.location && <p>📍 {selectedEvent.location}</p>}
              {selectedEvent.project && <p>📁 {selectedEvent.project}</p>}
              {selectedEvent.memo && (
                <p className="mt-2 text-gray-500">{selectedEvent.memo}</p>
              )}
            </div>
            <button
              onClick={() => setSelectedEvent(null)}
              className="mt-6 w-full bg-gray-100 text-gray-600 py-3 rounded-xl font-semibold"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* Upcoming events */}
      <h3 className="text-sm font-bold text-gray-500 mb-2">
        今後のイベント
      </h3>
      {upcoming.length === 0 ? (
        <p className="text-center text-gray-400 py-6">
          今後のイベントはありません
        </p>
      ) : (
        <div className="space-y-2">
          {upcoming.map((evt) => (
            <button
              key={evt.id}
              onClick={() => setSelectedEvent(evt)}
              className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-left active:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 text-amber-700 rounded-lg px-2 py-1 text-center min-w-[50px]">
                  <div className="text-xs">
                    {evt.date
                      ? new Date(evt.date).toLocaleDateString("ja-JP", {
                          month: "short",
                        })
                      : ""}
                  </div>
                  <div className="text-lg font-bold">
                    {evt.date ? new Date(evt.date).getDate() : "?"}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">{evt.name}</h4>
                  {evt.time && (
                    <p className="text-xs text-gray-400">{evt.time}</p>
                  )}
                  {evt.location && (
                    <p className="text-xs text-gray-400">{evt.location}</p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
