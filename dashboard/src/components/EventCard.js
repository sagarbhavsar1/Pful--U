const images = ["/images/hero-bg.png", "/images/party-rooftop.png", "/images/party-study.png", "/images/party-club.png"];
const avatarColors = ["#6236FF", "#EC4899", "#3B82F6", "#22C55E", "#F97316", "#8B5CF6", "#06B6D4"];

export default function EventCard({ event, index = 0 }) {
    const imgSrc = images[index % images.length];
    const initials = (event.host || "AB").split(" ").map((w) => w[0]).join("").slice(0, 2);

    return (
        <div className="event-card animate-in" style={{ animationDelay: `${index * 0.06}s` }}>
            {/* Image */}
            <img
                src={imgSrc}
                alt=""
                className="event-card-image"
                loading="lazy"
                width={400}
                height={160}
            />
            <div className="event-card-overlay" />

            {/* Type badge */}
            <div className="event-card-type">{event.type}</div>

            {/* Body */}
            <div className="event-card-body">
                <div className="event-card-name">{event.name}</div>
                <div className="event-card-host">Hosted by {event.host}</div>

                <div className="event-card-details">
                    <span className="event-card-detail">📅 {event.date}</span>
                    <span className="event-card-detail">⏰ {event.time}</span>
                </div>

                <div className="event-card-footer">
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div className="avatar-stack">
                            {[0, 1, 2].map((j) => (
                                <div
                                    key={j}
                                    className="avatar"
                                    style={{ background: avatarColors[(index + j) % avatarColors.length] }}
                                    aria-hidden="true"
                                >
                                    {String.fromCharCode(65 + ((index + j) % 26))}
                                </div>
                            ))}
                        </div>
                        <span className="event-card-rsvp-count">
                            <strong>{event.rsvps}</strong> going
                        </span>
                    </div>
                    <button className="btn-rsvp" aria-label={`RSVP to ${event.name}`}>RSVP</button>
                </div>
            </div>
        </div>
    );
}
