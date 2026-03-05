"use client";
import { useState } from "react";

/* Unsplash photos mapped by event type */
const imagesByType = {
    "House party": [
        "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1496024840928-4c417adf211d?w=400&h=400&fit=crop",
    ],
    "Club event": [
        "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=400&fit=crop",
    ],
    "Birthday": [
        "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=400&fit=crop",
    ],
    "Networking": [
        "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=400&fit=crop",
    ],
    "Study group": [
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400&h=400&fit=crop",
    ],
    "Sports watch": [
        "https://images.unsplash.com/photo-1461896836934-bd45ba40b09e?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=400&fit=crop",
    ],
    "Cultural": [
        "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=400&h=400&fit=crop",
    ],
    "Other": [
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=400&fit=crop",
    ],
};

export default function EventCard({ event, index = 0 }) {
    const [starred, setStarred] = useState(false);
    const typeImages = imagesByType[event.type] || imagesByType["Other"];
    const imgSrc = typeImages[index % typeImages.length];

    return (
        <div className="pf-event-card">
            {/* Square poster image */}
            <div className="pf-event-card-poster">
                <img
                    src={imgSrc}
                    alt=""
                    loading="lazy"
                    width={400}
                    height={400}
                />
            </div>

            {/* Info section */}
            <div className="pf-event-card-info">
                <div className="pf-event-card-tag">{event.type}</div>
                <div className="pf-event-card-title">{event.name}</div>
                <div className="pf-event-card-meta">
                    <span>{event.date} · {event.time}</span>
                </div>
                <div className="pf-event-card-meta">
                    <span>{event.location || "TBA"}</span>
                </div>
                <div className="pf-event-card-bottom">
                    <span className="pf-event-card-interested">
                        {event.interested || event.rsvps} interested
                    </span>
                    <button
                        className={`pf-event-card-star ${starred ? "active" : ""}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            setStarred(!starred);
                        }}
                        aria-label={starred ? "Remove from saved" : "Save event"}
                    >
                        {starred ? "★" : "☆"}
                    </button>
                </div>
            </div>
        </div>
    );
}
