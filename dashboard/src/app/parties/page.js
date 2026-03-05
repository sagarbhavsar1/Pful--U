"use client";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, Suspense } from "react";
import Link from "next/link";
import EventCard from "@/components/EventCard";
import uniPerformance from "@/data/university_performance.json";
import eventTypes from "@/data/event_types.json";

const namesByType = {
    "House party": [
        "End of Finals Blowout", "Friday Night Pregame", "Rooftop Kickback",
        "Welcome Week Mixer", "Last Day of Classes Party", "Apartment Warming",
        "Spring Fling Bash", "Post-Midterm Celebration", "Sunset Vibes Only",
        "Themed Costume Party", "Day Drink & Chill", "Block Party Madness"
    ],
    "Club event": [
        "CS Club Demo Night", "Debate Society Social", "Engineering Showcase",
        "Finance Club Networking", "Photography Club Gallery Walk",
        "Film Club Screening Night", "Startup Pitch Night"
    ],
    "Birthday": [
        "Sarah's 21st!", "Jake's Birthday Bash", "Surprise Birthday Party",
        "Mia's Golden Birthday", "Rooftop Birthday Dinner"
    ],
    "Networking": [
        "Tech Industry Mixer", "Alumni Career Panel", "Startup Founders Night",
        "Resume Workshop & Social", "Mentor Matching Social"
    ],
    "Study group": [
        "Calc III Study Session", "Organic Chem Review", "Physics Notes Swap",
        "CS 101 Office Hours", "Library Grind Squad"
    ],
    "Sports watch": [
        "March Madness Watch Party", "Super Bowl Screening", "Game Day Tailgate",
        "Championship Finals Watch"
    ],
    "Cultural": [
        "Diwali Celebration", "Lunar New Year Fest", "Latin Night Dance",
        "International Food Festival", "K-Pop Dance Cover Night"
    ],
    "Other": [
        "Karaoke Night", "Open Mic Comedy", "Movie Night on the Quad",
        "Thrift Swap Meet", "Board Game Tournament"
    ],
};

const hostNames = [
    "Alex Martinez", "Jordan Patel", "Sam Kim", "Taylor Nguyen",
    "Morgan Chen", "Riley Santos", "Casey Williams", "Avery Thompson",
    "Jamie Rodriguez", "Quinn Davis", "Drew Park", "Skylar Washington",
];

const locations = [
    "Student Center", "Main Quad", "Rooftop Lounge", "The Basement",
    "Room 204, Engineering Hall", "Campus Green", "Off-campus House",
    "Library Atrium", "Frat Row", "Downtown Venue", "Art Gallery",
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
        const locIdx = (seed + i * 4) % locations.length;

        events.push({
            id: `evt-${i}`,
            name: names[nameIdx],
            type,
            host: hostNames[hostIdx],
            location: locations[locIdx],
            date: days[i % days.length],
            time: times[(seed + i) % times.length],
            rsvps: 15 + ((seed * (i + 1) * 7) % 120),
            interested: 30 + ((seed * (i + 1) * 3) % 200),
        });
    }
    return events;
}

const allCategories = ["All", "House party", "Club event", "Birthday", "Networking", "Study group", "Sports watch", "Cultural", "Other"];

function PartiesContent() {
    const searchParams = useSearchParams();
    const uniId = searchParams.get("uni");
    const [activeFilter, setActiveFilter] = useState("All");

    const uni = useMemo(
        () => uniPerformance.find((u) => u.university_id === uniId) || uniPerformance[0],
        [uniId]
    );

    const events = useMemo(() => generateEvents(uniId), [uniId]);
    const filteredEvents = activeFilter === "All" ? events : events.filter(e => e.type === activeFilter);

    return (
        <div className="pf-discover">
            {/* Top bar */}
            <div className="pf-discover-topbar">
                <div className="pf-discover-topbar-left">
                    <Link href="/" className="pf-discover-logo">
                        <img src="/images/pful.png" alt="Partiful" />
                    </Link>
                    <div className="pf-discover-topbar-text">
                        <span className="pf-discover-topbar-title">discover</span>
                    </div>
                </div>
                <Link href="/explorer" className="pf-discover-explore-btn">
                    Data Explorer
                </Link>
            </div>

            {/* City / University header */}
            <div className="pf-discover-header">
                <h1 className="pf-discover-city">{uni.name.toLowerCase()}</h1>
                <div className="pf-discover-meta">
                    {uni.region} · {uni.type} · {uni.total_users.toLocaleString()} students
                </div>
            </div>

            {/* Category filter pills */}
            <div className="pf-discover-filters">
                {allCategories.map(cat => (
                    <button
                        key={cat}
                        className={`pf-filter-pill ${activeFilter === cat ? "active" : ""}`}
                        onClick={() => setActiveFilter(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Event grid */}
            <div className="pf-discover-grid">
                {filteredEvents.map((evt, i) => (
                    <EventCard key={evt.id} event={evt} index={i} />
                ))}
            </div>

            {filteredEvents.length === 0 && (
                <div className="pf-discover-empty">
                    No events found for this category. Try "All" to see everything.
                </div>
            )}

            {/* Footer CTA */}
            <div className="pf-discover-footer">
                <p>want to see the analytics?</p>
                <Link href="/explorer" className="pf-discover-footer-btn">
                    open data explorer
                </Link>
            </div>
        </div>
    );
}

export default function PartiesPage() {
    return (
        <Suspense fallback={<div className="loading" style={{ background: "#000", color: "#666", minHeight: "100vh" }}>Loading...</div>}>
            <PartiesContent />
        </Suspense>
    );
}
