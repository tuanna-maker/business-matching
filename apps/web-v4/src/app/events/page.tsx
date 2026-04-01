/* Re-written to avoid TSX structural syntax errors. */
'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Search, Users, Sparkles } from 'lucide-react';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

type EventType = 'meeting' | 'call' | 'presentation' | 'workshop' | 'demo';

type Event = {
  id: string;
  title: string;
  description?: string;
  event_type: EventType | string;
  start_at: string;
  end_at: string;
  location?: string;
  meeting_link?: string;
  cover_image_url?: string | null;
  created_at: string;
  // From events.service.ts mapping (we use these instead of attendees array)
  current_attendees?: number;
  max_attendees?: number;
  view_count?: number;
};

const TYPE_CONFIG: Record<
  string,
  { label: string; badgeBg: string; badgeBorder: string; badgeText: string; pillBg: string }
> = {
  meeting: {
    label: 'Meeting',
    badgeBg: 'bg-blue-500/10',
    badgeBorder: 'border-blue-500/30',
    badgeText: 'text-blue-700',
    pillBg: 'bg-blue-500/20',
  },
  call: {
    label: 'Call',
    badgeBg: 'bg-purple-500/10',
    badgeBorder: 'border-purple-500/30',
    badgeText: 'text-purple-700',
    pillBg: 'bg-purple-500/20',
  },
  presentation: {
    label: 'Presentation',
    badgeBg: 'bg-amber-500/10',
    badgeBorder: 'border-amber-500/30',
    badgeText: 'text-amber-700',
    pillBg: 'bg-amber-500/20',
  },
  workshop: {
    label: 'Workshop',
    badgeBg: 'bg-emerald-500/10',
    badgeBorder: 'border-emerald-500/30',
    badgeText: 'text-emerald-700',
    pillBg: 'bg-emerald-500/20',
  },
  demo: {
    label: 'Demo',
    badgeBg: 'bg-cyan-500/10',
    badgeBorder: 'border-cyan-500/30',
    badgeText: 'text-cyan-700',
    pillBg: 'bg-cyan-500/20',
  },
};

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(date: string, now: Date) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: new Date(date).getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

function isEventToday(date: string, now: Date) {
  const eventDate = new Date(date);
  return eventDate.toDateString() === now.toDateString();
}

function isEventUpcoming(date: string, now: Date) {
  return new Date(date) >= now;
}

function formatSlots(cur?: number, max?: number) {
  const c = cur ?? 0;
  const m = max ?? 0;
  if (!m) return `${c} joined`;
  return `${c}/${m}`;
}

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewPast, setViewPast] = useState(false);

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        let response: { data?: Event[]; events?: Event[] } | null = null;
        try {
          response = await api.get<{ data?: Event[]; events?: Event[] }>('/events');
        } catch (primaryError: any) {
          const status = primaryError?.statusCode;
          if (status === 404) {
            response = await api.get<{ data?: Event[]; events?: Event[] }>('/pilot/events');
          } else {
            throw primaryError;
          }
        }
        setEvents(response?.data || response?.events || []);
      } catch (error) {
        toast.error('Failed to load events');
        console.error('Fetch events error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  const now = useMemo(() => new Date(), [events.length]);

  const filteredEvents = useMemo(() => {
    return events
      .filter((e) => {
        const matchType = selectedType === 'all' || String(e.event_type) === selectedType;
        const q = search.trim().toLowerCase();
        const matchSearch =
          !q ||
          e.title.toLowerCase().includes(q) ||
          (e.description?.toLowerCase().includes(q) ?? false);
        const matchPast = viewPast ? true : new Date(e.start_at) >= now;
        return matchType && matchSearch && matchPast;
      })
      .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
  }, [events, now, search, selectedType, viewPast]);

  const upcomingCount = useMemo(() => events.filter((e) => new Date(e.start_at) > now).length, [events, now]);

  const featured = useMemo(() => {
    if (loading) return null;
    if (search.trim() || selectedType !== 'all' || viewPast) return null;
    if (events.length === 0) return null;
    return [...events].sort((a, b) => (b.view_count ?? 0) - (a.view_count ?? 0))[0];
  }, [events, loading, search, selectedType, viewPast]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  const eventTypes = [
    { label: 'All', value: 'all' },
    { label: 'Meeting', value: 'meeting' },
    { label: 'Call', value: 'call' },
    { label: 'Presentation', value: 'presentation' },
    { label: 'Workshop', value: 'workshop' },
    { label: 'Demo', value: 'demo' },
  ];

  return (
    <div className="min-h-screen px-4 md:px-8 pr-4 md:pr-32 py-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">
              Deal <span className="text-brand">Events</span>
            </h1>
            <p className="text-sm text-slate-500">Curated sessions to help founders and investors move deals forward.</p>
          </div>
          <p className="text-xs uppercase tracking-widest text-slate-400">
            {upcomingCount} upcoming · {events.length} total
          </p>
        </div>

        {!loading && events.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="rounded-xl bg-white/90 border border-slate-200/80 backdrop-blur-sm px-4 py-3">
              <div className="flex items-center gap-2 text-brand">
                <Sparkles className="w-4 h-4" />
                <div className="text-base font-bold text-slate-900">{upcomingCount}</div>
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide mt-1">Upcoming sessions</div>
            </div>
            <div className="rounded-xl bg-white/90 border border-slate-200/80 backdrop-blur-sm px-4 py-3">
              <div className="text-base font-bold text-slate-900">
                {events.filter((e) => String(e.event_type) === 'workshop').length}
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide mt-1">Workshops</div>
            </div>
            <div className="rounded-xl bg-white/90 border border-slate-200/80 backdrop-blur-sm px-4 py-3">
              <div className="text-base font-bold text-slate-900">
                {events.filter((e) => ['presentation', 'demo'].includes(String(e.event_type))).length}
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide mt-1">Pitch & Demo</div>
            </div>
          </div>
        )}

        <div className="mb-6 space-y-3">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search events, topics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/90 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand/50"
              />
            </div>
            <button
              onClick={() => setViewPast((v) => !v)}
              className={`text-xs px-3 py-2 rounded-xl border font-medium transition-colors ${
                viewPast
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white/90 text-slate-600 border-slate-200 hover:border-slate-400'
              }`}
            >
              {viewPast ? 'Show upcoming only' : 'Include past events'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {eventTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`text-[11px] px-3 py-1.5 rounded-full border font-medium transition-all ${
                  selectedType === type.value
                    ? 'bg-brand text-white border-brand shadow-sm'
                    : 'bg-white/80 border-slate-200 text-slate-600 hover:border-brand/40'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[220px] rounded-2xl bg-slate-100/80 border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 rounded-2xl border border-dashed border-slate-200 bg-white/80"
          >
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 text-sm mb-1">{search ? 'No events match your search' : 'No events scheduled yet'}</p>
            <p className="text-slate-400 text-xs">Try clearing filters or check back later — new sessions are added every week.</p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {featured && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-brand" />
                  <span className="text-xs font-semibold text-brand uppercase tracking-widest">Most Popular</span>
                </div>
                <motion.div
                  className="rounded-2xl p-[1px]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.0) 0%, rgba(37, 99, 235, 0.18) 100%)',
                  }}
                  whileHover={{ y: -2 }}
                  transition={{ type: 'spring', stiffness: 250, damping: 22 }}
                >
                  <div className="rounded-[1.1rem] bg-white/95 border border-slate-200/70 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-5">
                      <div className="md:col-span-2 relative h-60">
                        {featured.cover_image_url ? (
                          <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${featured.cover_image_url})` }}
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-slate-200/60 to-slate-100" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                        <div className="absolute top-3 left-3">
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold ${
                              (TYPE_CONFIG[String(featured.event_type)]?.badgeBg ?? 'bg-slate-500/10')
                            } ${
                              (TYPE_CONFIG[String(featured.event_type)]?.badgeBorder ?? 'border-slate-300')
                            } border ${
                              (TYPE_CONFIG[String(featured.event_type)]?.badgeText ?? 'text-slate-700')
                            }`}
                          >
                            {(TYPE_CONFIG[String(featured.event_type)]?.label ?? 'Event')}
                          </span>
                        </div>
                      </div>
                      <div className="md:col-span-3 p-5 md:p-6 flex flex-col justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 mb-2">{featured.title}</h3>
                          {featured.description && (
                            <p className="text-sm text-slate-600 line-clamp-2">{featured.description}</p>
                          )}
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(featured.start_at, now)}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {formatTime(featured.start_at)}-{formatTime(featured.end_at)}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              {formatSlots(featured.current_attendees, featured.max_attendees)}
                            </span>
                          </div>
                          {featured.meeting_link ? (
                            <a
                              href={featured.meeting_link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-brand px-4 py-2 rounded-xl hover:bg-brand/90 transition-colors"
                            >
                              Join link
                            </a>
                          ) : (
                            <button className="inline-flex items-center gap-2 text-sm font-semibold text-brand bg-brand/10 px-4 py-2 rounded-xl border border-brand/20">
                              View details
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            <AnimatePresence>
              <motion.div
                key={selectedType + String(viewPast) + search}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {filteredEvents.map((event) => {
                  const cfg = TYPE_CONFIG[String(event.event_type)] ?? TYPE_CONFIG.meeting;
                  const upcoming = isEventUpcoming(event.start_at, now);
                  const today = isEventToday(event.start_at, now);
                  return (
                    <motion.div
                      key={event.id}
                      className={`rounded-2xl border bg-white/95 backdrop-blur-sm hover:shadow-sm transition-shadow overflow-hidden cursor-pointer`}
                      whileHover={{ y: -2 }}
                      transition={{ type: 'spring', stiffness: 250, damping: 22 }}
                    >
                      <div className="relative h-40">
                        {event.cover_image_url ? (
                          <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${event.cover_image_url})` }}
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-slate-200/70 to-slate-100" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-[11px] font-semibold border ${cfg.badgeBg} ${cfg.badgeBorder} ${cfg.badgeText}`}>
                            {cfg.label}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold border ${
                              upcoming
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700'
                                : 'bg-slate-200 border-slate-300 text-slate-700'
                            }`}
                          >
                            {today ? 'Today' : upcoming ? 'Upcoming' : 'Past'}
                          </span>
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="text-base font-bold text-slate-900 mb-1 line-clamp-1">{event.title}</h3>
                        {event.description && (
                          <p className="text-sm text-slate-600 line-clamp-2 mb-3">{event.description}</p>
                        )}

                        <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-3">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(event.start_at, now)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatTime(event.start_at)}-{formatTime(event.end_at)}
                          </span>
                          {event.location && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {event.location}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
                            <Users className="w-4 h-4 text-slate-400" />
                            <span>{formatSlots(event.current_attendees, event.max_attendees)} joined</span>
                          </div>
                          {event.meeting_link ? (
                            <a
                              href={event.meeting_link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-semibold text-brand hover:underline"
                            >
                              Join
                            </a>
                          ) : (
                            <span className="text-xs font-semibold text-slate-400">Details</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}
