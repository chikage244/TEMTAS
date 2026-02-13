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
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState<ScheduleEvent[]>([]);

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
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
    else setViewMonth(viewMonth - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
    else setViewMonth(viewMonth + 1);
  };

  const goToday = () => {
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
  };

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
  const todayKey = formatDateKey(now.getFullYear(), now.getMonth(), now.getDate());

  const upcoming = events
    .filter((e) => e.date && e.date >= todayKey)
    .sort((a, b) => (a.date! > b.date! ? 1 : -1))
    .slice(0, 10);

  const handleDayClick = (dayEvents: ScheduleEvent[]) => {
    if (dayEvents.length === 1) setSelectedEvent(dayEvents[0]);
    else if (dayEvents.length > 1) setSelectedDayEvents(dayEvents);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="animate-spin h-8 w-8 border-[3px] border-[#c28b6e] border-t-transparent rounded-full" />
        <p className="text-sm text-[#c4b89a]">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 mb-4 text-sm">{error}</p>
        <button
          onClick={() => { setLoading(true); fetchEvents(); }}
          className="bg-[#a0845c] text-white px-5 py-2.5 rounded-xl text-sm font-semibold active:bg-[#8b7355]"
        >
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4 bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-sm border border-[#ece2d0]">
        <button onClick={prevMonth} className="w-10 h-10 flex items-center justify-center text-lg rounded-xl active:bg-[#f5ede0] text-[#a0845c]">
          &#9664;
        </button>
        <div className="text-center">
          <h2 className="text-base font-black text-[#3d2e1e]">
            {viewYear}年{viewMonth + 1}月
          </h2>
          <button onClick={goToday} className="text-[10px] text-[#c28b6e] font-medium">
            今月に戻る
          </button>
        </div>
        <button onClick={nextMonth} className="w-10 h-10 flex items-center justify-center text-lg rounded-xl active:bg-[#f5ede0] text-[#a0845c]">
          &#9654;
        </button>
      </div>

      {/* Calendar grid */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-sm border border-[#ece2d0] mb-6">
        <div className="grid grid-cols-7 gap-0">
          {WEEKDAYS.map((wd, i) => (
            <div key={wd} className={`text-center text-[10px] font-bold py-2 ${
              i === 0 ? "text-red-300" : i === 6 ? "text-blue-300" : "text-[#c4b89a]"
            }`}>
              {wd}
            </div>
          ))}

          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="p-0.5" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateKey = formatDateKey(viewYear, viewMonth, day);
            const dayEvents = eventsByDate[dateKey] || [];
            const isToday = dateKey === todayKey;
            const dayOfWeek = (firstDay + i) % 7;
            const hasEvents = dayEvents.length > 0;

            return (
              <button
                key={day}
                onClick={() => handleDayClick(dayEvents)}
                disabled={!hasEvents}
                className={`p-0.5 min-h-[52px] rounded-xl text-left relative transition-all ${
                  isToday ? "bg-[#f5ede0]" : ""
                } ${hasEvents ? "active:bg-[#faf5ec]" : ""}`}
              >
                <span className={`text-[11px] flex items-center justify-center w-6 h-6 mx-auto ${
                  isToday
                    ? "bg-[#a0845c] text-white rounded-full font-bold"
                    : dayOfWeek === 0
                    ? "text-red-400"
                    : dayOfWeek === 6
                    ? "text-blue-400"
                    : "text-[#5a4a38]"
                }`}>
                  {day}
                </span>
                {hasEvents && (
                  <div className="mt-0.5 px-0.5">
                    {dayEvents.slice(0, 2).map((evt) => (
                      <div key={evt.id} className="text-[8px] leading-tight text-[#8b7355] bg-[#f5ede0] rounded px-0.5 mb-0.5 truncate">
                        {evt.name}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[8px] text-[#c4b89a] text-center">
                        +{dayEvents.length - 2}
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day events list modal */}
      {selectedDayEvents.length > 0 && (
        <div className="fixed inset-0 bg-black/25 z-20 flex items-end justify-center" onClick={() => setSelectedDayEvents([])}>
          <div className="bg-[#fdf8f0] rounded-t-3xl w-full max-w-lg p-6 pb-10" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-[#d4c4a8] rounded-full mx-auto mb-5" />
            <h3 className="text-base font-black text-[#3d2e1e] mb-4">
              {selectedDayEvents[0]?.date && new Date(selectedDayEvents[0].date).toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "short" })}
            </h3>
            <div className="space-y-2">
              {selectedDayEvents.map((evt) => (
                <button key={evt.id} onClick={() => { setSelectedDayEvents([]); setSelectedEvent(evt); }}
                  className="w-full text-left bg-white/80 rounded-xl p-3.5 border border-[#ece2d0] active:bg-[#f5ede0]">
                  <h4 className="font-bold text-sm text-[#3d2e1e]">{evt.name}</h4>
                  {evt.time && <p className="text-xs text-[#c4b89a] mt-0.5">{evt.time}</p>}
                </button>
              ))}
            </div>
            <button onClick={() => setSelectedDayEvents([])} className="mt-5 w-full bg-[#f5ede0] text-[#8b7355] py-3 rounded-xl font-semibold text-sm">
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* Event detail modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/25 z-20 flex items-end justify-center" onClick={() => setSelectedEvent(null)}>
          <div className="bg-[#fdf8f0] rounded-t-3xl w-full max-w-lg p-6 pb-10" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-[#d4c4a8] rounded-full mx-auto mb-5" />
            <h3 className="text-lg font-black text-[#3d2e1e] mb-3">{selectedEvent.name}</h3>
            <div className="space-y-2.5 text-sm">
              {selectedEvent.date && (
                <div className="flex items-center gap-3 text-[#5a4a38]">
                  <div className="w-8 h-8 bg-[#f5ede0] rounded-lg flex items-center justify-center text-sm">&#128197;</div>
                  <span>{new Date(selectedEvent.date).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "short" })}</span>
                </div>
              )}
              {selectedEvent.time && (
                <div className="flex items-center gap-3 text-[#5a4a38]">
                  <div className="w-8 h-8 bg-[#f5ede0] rounded-lg flex items-center justify-center text-sm">&#128336;</div>
                  <span>{selectedEvent.time}</span>
                </div>
              )}
              {selectedEvent.location && (
                <div className="flex items-center gap-3 text-[#5a4a38]">
                  <div className="w-8 h-8 bg-[#f5ede0] rounded-lg flex items-center justify-center text-sm">&#128205;</div>
                  <span>{selectedEvent.location}</span>
                </div>
              )}
              {selectedEvent.project && (
                <div className="flex items-center gap-3 text-[#5a4a38]">
                  <div className="w-8 h-8 bg-[#f5ede0] rounded-lg flex items-center justify-center text-sm">&#128193;</div>
                  <span>{selectedEvent.project}</span>
                </div>
              )}
              {selectedEvent.memo && (
                <div className="mt-3 p-3 bg-white/60 rounded-xl text-sm text-[#8b7355]">{selectedEvent.memo}</div>
              )}
            </div>
            <button onClick={() => setSelectedEvent(null)} className="mt-6 w-full bg-[#f5ede0] text-[#8b7355] py-3 rounded-xl font-semibold text-sm">
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* Upcoming events */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[11px] font-bold text-[#8b6b3d] bg-[#f5ede0] px-2.5 py-0.5 rounded-full border border-[#e0d0b8]">
          今後の予定
        </span>
        <div className="flex-1 border-t border-[#e8dcc8]" />
      </div>
      {upcoming.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-3xl mb-2 opacity-20">&#127807;</div>
          <p className="text-[#c4b89a] text-sm">今後のイベントはありません</p>
        </div>
      ) : (
        <div className="space-y-2">
          {upcoming.map((evt) => (
            <button
              key={evt.id}
              onClick={() => setSelectedEvent(evt)}
              className="w-full bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-[#ece2d0] text-left active:bg-[#faf5ec] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-[#f5ede0] to-[#faf5ec] border border-[#e0d0b8] rounded-xl px-2.5 py-1.5 text-center min-w-[52px]">
                  <div className="text-[10px] text-[#a0845c] font-medium">
                    {evt.date ? new Date(evt.date).toLocaleDateString("ja-JP", { month: "short" }) : ""}
                  </div>
                  <div className="text-lg font-black text-[#3d2e1e]">
                    {evt.date ? new Date(evt.date).getDate() : "?"}
                  </div>
                  <div className="text-[9px] text-[#c4b89a]">
                    {evt.date ? ["日", "月", "火", "水", "木", "金", "土"][new Date(evt.date).getDay()] : ""}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-[#3d2e1e] truncate">{evt.name}</h4>
                  {evt.time && <p className="text-[11px] text-[#c4b89a] mt-0.5">{evt.time}</p>}
                  {evt.location && <p className="text-[11px] text-[#c4b89a]">{evt.location}</p>}
                </div>
                <span className="text-[#d4c4a8] text-lg">&#8250;</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
