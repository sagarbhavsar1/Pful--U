"use client";

// Shared Theme Colors for the Neo-Brutalist cards
const COLORS = [
    "#6236FF", // purple
    "#EC4899", // pink
    "#22C55E", // green
    "#3B82F6"  // blue
];

export default function InsightsPage() {
    const recommendations = [
        {
            title: "Default to Campus-Wide Visibility",
            insight: "Data shows that making events visible to the entire campus increases RSVPs by 14.8% and actual turnout by 13.6%. Broad visibility also drives 2.4x more cross-pollination between different campus organizations.",
            action: "Make 'Campus Public' the default privacy setting when users create new events to maximize total reach and attendance.",
            metric: "+14.8% RSVP LIFT",
            icon: "🌎",
            bg: "rgba(98, 54, 255, 0.1)", // Light purple
            color: COLORS[0]
        },
        {
            title: "Target Mid-Size Private Urban Campuses",
            insight: "Our cohort analysis reveals that mid-size, private universities in cities adopt the platform fastest, generating 3x more events per user than the national baseline.",
            action: "Focus our marketing budget and campus ambassador recruiting specifically on these high-performing university demographics.",
            metric: "211 EVENTS / 1K",
            icon: "🏫",
            bg: "rgba(236, 72, 153, 0.1)", // Light pink
            color: COLORS[1]
        },
        {
            title: "Build Features for 'Power Hosts'",
            insight: "A small group of creators drive the entire network. Just 7% of our users are responsible for hosting events that generate over 60% of all RSVPs.",
            action: "Build features dedicated to retaining these top creators, such as advanced guest list management, host analytics, and loyalty rewards.",
            metric: "7% DRIVES PLATFORM",
            icon: "👑",
            bg: "rgba(34, 197, 94, 0.1)", // Light green
            color: COLORS[2]
        },
        {
            title: "Capitalize on Orientation Spikes",
            insight: "Event volume is highly seasonal. Our data shows that 40% of all fall engagement occurs in just the first three weeks of the semester during orientation.",
            action: "Concentrate our campus ambassador budgets to heavily sponsor and promote events exclusively during these critical 'Welcome Week' windows.",
            metric: "3X ACQUISITION",
            icon: "🚀",
            bg: "rgba(59, 130, 246, 0.1)", // Light blue
            color: COLORS[3]
        }
    ];

    return (
        <div className="animate-in" style={{ paddingBottom: "40px" }}>
            <div className="page-header" style={{ marginBottom: "40px" }}>
                <h2 style={{ fontSize: "42px", letterSpacing: "-1.5px", fontWeight: "900", color: "#111" }}>
                    Data Science Insights
                </h2>
                <p style={{ fontSize: "16px", color: "#1A1A1A", fontWeight: "600", maxWidth: "800px" }}>
                    Clear, actionable findings from the Partiful U dataset. Here are the 4 highest-leverage product decisions we can make right now based on how students are actually using the platform.
                </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
                {recommendations.map((rec, i) => (
                    <div key={i} className="card" style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                        position: "relative",
                        overflow: "hidden",
                        background: "#fff"
                    }}>
                        {/* Huge background icon */}
                        <div style={{
                            position: "absolute",
                            right: "-20px",
                            bottom: "-40px",
                            fontSize: "180px",
                            opacity: 0.05,
                            pointerEvents: "none",
                            transform: "rotate(-10deg)"
                        }}>
                            {rec.icon}
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{
                                width: "48px", height: "48px", borderRadius: "12px",
                                background: rec.bg, border: `2px solid ${rec.color}`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "24px", boxShadow: `3px 3px 0px ${rec.color}`
                            }}>
                                {rec.icon}
                            </div>
                            <h3 style={{ fontSize: "24px", fontWeight: 900, color: "#111", letterSpacing: "-0.5px" }}>
                                {rec.title}
                            </h3>
                        </div>

                        <div style={{ marginLeft: "60px", paddingRight: "100px" }}>
                            <p style={{ fontSize: "15px", color: "#3D3D4E", lineHeight: 1.6, marginBottom: "16px", fontWeight: "500" }}>
                                {rec.insight}
                            </p>

                            <div style={{
                                padding: "16px",
                                background: "rgba(17, 17, 17, 0.03)",
                                borderLeft: `4px solid ${rec.color}`,
                                borderRadius: "0 8px 8px 0"
                            }}>
                                <span style={{ fontWeight: 800, color: "#111", display: "block", marginBottom: "4px", textTransform: "uppercase", fontSize: "12px", letterSpacing: "1px" }}>
                                    Required Action
                                </span>
                                <span style={{ fontSize: "15px", color: "#111", fontWeight: "600" }}>
                                    {rec.action}
                                </span>
                            </div>
                        </div>

                        {/* Top right metric badge */}
                        <div style={{
                            position: "absolute",
                            top: "24px",
                            right: "24px",
                            background: rec.color,
                            color: "#fff",
                            padding: "6px 16px",
                            borderRadius: "100px",
                            fontSize: "13px",
                            fontWeight: "800",
                            border: "2px solid #111",
                            boxShadow: "3px 3px 0px #111",
                            letterSpacing: "0.5px"
                        }}>
                            {rec.metric}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
