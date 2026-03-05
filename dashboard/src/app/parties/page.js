"use client";
import { useSearchParams } from "next/navigation";
import { useMemo, Suspense } from "react";
import Link from "next/link";
import EventCard from "@/components/EventCard";
import uniPerformance from "@/data/university_performance.json";
import eventTypes from "@/data/event_types.json";

/* ─── Mock event name templates ─── */
const namesByType = {
    "House party": [
        "End of Finals Blowout 🎉", "Friday Night Pregame", "Rooftop Kickback",
        "Welcome Week Mixer", "Last Day of Classes Party", "Apartment Warming Rager",
        "Spring Fling Bash", "Post-Midterm Celebration", "Sunset Vibes Only",
        "Themed Costume Party 🎭", "Day Drink & Chill ☀️", "Block Party Madness"
    ],
    "Club event": [
        "CS Club Demo Night", "Debate Society Social", "Engineering Showcase",
        "Finance Club Networking Night", "Photography Club Gallery Walk",
        "Film Club Screening Night 🎬", "Startup Pitch Night"
    ],
    "Birthday": [
        "Sarah's 21st! 🎂", "Jake's Birthday Bash", "Surprise Birthday Party",
        "Mia's Golden Birthday 🌟", "Rooftop Birthday Dinner"
    ],
    "Networking": [
        "Tech Industry Mixer", "Alumni Career Panel", "Startup Founders Night",
        "Resume Workshop & Social", "Mentor Matching Social"
    ],
    "Study group": [
        "Calc III Study Session", "Organic Chem Review", "Physics Notes Swap",
        "CS 101 Office Hours Hangout", "Library Grind Squad 📚"
    ],
    "Sports watch": [
        "March Madness Watch Party 🏀", "Super Bowl Screening", "Game Day Tailgate",
        "Championship Finals Watch"
    ],
    "Cultural": [
        "Diwali Celebration 🪔", "Lunar New Year Fest", "Latin Night Dance",
        "International Food Festival 🌍", "K-Pop Dance Cover Night"
    ],
    "Other": [
        "Karaoke Night 🎤", "Open Mic Comedy", "Movie Night on the Quad",
        "Thrift Swap Meet", "Board Game Tournament"
    ],
};

const hostNames = [
    "Alex Martinez", "Jordan Patel", "Sam Kim", "Taylor Nguyen",
    "Morgan Chen", "Riley Santos", "Casey Williams", "Avery Thompson",
    "Jamie Rodriguez", "Quinn Davis", "Drew Park", "Skylar Washington",
];

const times = ["7:00 PM", "8:00 PM", "9:00 PM", "6:30 PM", "10:00 PM", "5:00 PM", "8:30 PM", "3:00 PM"];
const days = [
    "Fri, Mar 7", "Sat, Mar 8", "Sun, Mar 9", "Mon, Mar 10",
    "Tue, Mar 11", "Wed, Mar 12", "Thu, Mar 13", "Fri, Mar 14",
    "Sat, Mar 15", "Sun, Mar 16",
];

function generateEvents(uniId) {
    const seed = uniId ? uniId.charCodeAt(4) + uniId.charCodeAt(5) : 42;
    const events = [];
    const types = eventTypes.map((t) => t.event_type);

    for (let i = 0; i < 12; i++) {
        const typeIdx = (seed + i * 3) % types.length;
        const type = types[typeIdx];
        const names = namesByType[type] || namesByType["Other"];
        const nameIdx = (seed + i * 7) % names.length;
        const hostIdx = (seed + i * 5) % hostNames.length;

        events.push({
            id: `evt-${i}`,
            name: names[nameIdx],
            type,
            host: hostNames[hostIdx],
            date: days[i % days.length],
            time: times[(seed + i) % times.length],
            rsvps: 15 + ((seed * (i + 1) * 7) % 120),
        });
    }
    return events;
}

function PartiesContent() {
    const searchParams = useSearchParams();
    const uniId = searchParams.get("uni");

    const uni = useMemo(
        () => uniPerformance.find((u) => u.university_id === uniId) || uniPerformance[0],
        [uniId]
    );

    const events = useMemo(() => generateEvents(uniId), [uniId]);

    return (
        <div className="parties-page">
            {/* Hero banner */}
            <div className="parties-hero">
                <h1 className="parties-uni-name">{uni.name}</h1>
                <p className="parties-uni-subtitle">
                    {uni.region} • {uni.type} • {uni.setting}
                </p>
                <div className="parties-stats-row">
                    <div className="parties-stat-chip">
                        🎉 <strong>{uni.total_events.toLocaleString()}</strong> events
                    </div>
                    <div className="parties-stat-chip">
                        👥 <strong>{uni.total_users.toLocaleString()}</strong> students
                    </div>
                    <div className="parties-stat-chip">
                        ✅ <strong>{uni.rsvp_yes_rate}%</strong> RSVP rate
                    </div>
                    <div className="parties-stat-chip">
                        📈 <strong>{uni.attendance_rate}%</strong> attendance
                    </div>
                </div>
            </div>

            {/* Events */}
            <div className="parties-content">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                    <div className="parties-section-title">
                        🔥 Happening This Week
                    </div>
                    <Link href="/explorer" className="btn-explorer" style={{ fontSize: 14 }}>
                        📊 Open Data Explorer
                    </Link>
                </div>

                <div className="events-grid">
                    {events.map((evt, i) => (
                        <EventCard key={evt.id} event={evt} index={i} />
                    ))}
                </div>

                {/* CTA */}
                <div style={{
                    textAlign: "center",
                    padding: "48px 24px",
                    borderTop: "1px solid var(--border)",
                }}>
                    <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 16 }}>
                        Want to see the data behind campus discovery?
                    </p>
                    <Link href="/explorer" className="btn-explorer" style={{ fontSize: 15, padding: "14px 28px" }}>
                        📊 Explore the Analytics Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function PartiesPage() {
    return (
        <Suspense fallback={<div className="loading">Loading campus events…</div>}>
            <PartiesContent />
        </Suspense>
    );
}
