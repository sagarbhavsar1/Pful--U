"use client";
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend,
} from "recharts";

import visibilityImpact from "@/data/visibility_impact.json";
import visibilityByType from "@/data/visibility_impact_by_type.json";
import visRetention from "@/data/visibility_retention_comparison.json";
import eventTypes from "@/data/event_types.json";
import weeklyEngagement from "@/data/weekly_engagement.json";

const COLORS = ["#6236FF", "#EC4899", "#3B82F6", "#22C55E", "#F97316", "#EF4444", "#8B5CF6", "#06B6D4"];

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: "#fff", border: "3px solid #111",
            borderRadius: 8, padding: "10px 14px", fontSize: 13, boxShadow: "6px 6px 0px #111"
        }}>
            <p style={{ color: "#111", fontWeight: 800, marginBottom: 6 }}>{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color || "#3D3D4E", margin: "2px 0", fontWeight: 700 }}>
                    {p.name}: {typeof p.value === "number" ? p.value.toFixed(1) : p.value}
                </p>
            ))}
        </div>
    );
};

export default function ImpactPage() {
    const { rsvp_positive_rate, attendance_rate, avg_event_size, unique_attendees, sample_sizes } = visibilityImpact;

    const campusRetention = visRetention
        .filter((d) => d.visibility_scope === "campus_public")
        .map((d) => ({ ...d, week: `W${d.weeks_since_join}` }));

    const typePerformance = visibilityByType.map((d) => ({
        event_type: d.event_type,
        rsvp_rate: d.campus_public_rate || d.lift_pct,
    })).sort((a, b) => b.rsvp_rate - a.rsvp_rate);

    const engagementSlice = weeklyEngagement.slice(0, 26).map((d) => ({
        ...d,
        label: `W${d.event_week}`,
    }));

    return (
        <div>
            <div className="page-header">
                <h2>Campus Discovery</h2>
                <p>How Partiful U&apos;s university-scoped discovery layer drives student engagement, event attendance, and social graph expansion.</p>
            </div>

            {/* Hero */}
            <div className="card" style={{ marginBottom: 24, borderColor: "#111", background: "#f3f2f8", boxShadow: "6px 6px 0px #111" }}>
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1, color: "#111", fontWeight: 800, marginBottom: 12 }}>
                        Campus Discovery Performance
                    </div>
                    <div style={{ fontSize: 36, fontWeight: 900, background: "linear-gradient(135deg, #6236FF, #EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: -1, marginBottom: 8 }}>
                        {rsvp_positive_rate.campus_public}% RSVP Rate
                    </div>
                    <div style={{ fontSize: 15, color: "#3D3D4E", fontWeight: 500, maxWidth: 500, margin: "0 auto" }}>
                        Events surfaced through campus discovery achieve a {rsvp_positive_rate.campus_public}% positive RSVP rate across {sample_sizes.campus_public_events.toLocaleString()} events.
                    </div>
                    <div style={{ marginTop: 12, display: "flex", justifyContent: "center", gap: 8 }}>
                        <span className="badge green">High Engagement</span>
                        <span className="badge purple">{sample_sizes.campus_public_events.toLocaleString()} events analyzed</span>
                    </div>
                </div>
            </div>

            <div className="metrics-grid">
                <div className="metric-card purple animate-in">
                    <div className="metric-label">RSVP Rate</div>
                    <div className="metric-value purple">{rsvp_positive_rate.campus_public}%</div>
                    <div className="metric-detail">positive RSVP rate on campus events</div>
                </div>
                <div className="metric-card green animate-in">
                    <div className="metric-label">Attendance Rate</div>
                    <div className="metric-value green">{attendance_rate.campus_public}%</div>
                    <div className="metric-detail">of RSVPs show up</div>
                </div>
                <div className="metric-card blue animate-in">
                    <div className="metric-label">Avg Event Size</div>
                    <div className="metric-value blue">{avg_event_size.campus_public}</div>
                    <div className="metric-detail">RSVPs per campus event</div>
                </div>
                <div className="metric-card pink animate-in">
                    <div className="metric-label">Unique Attendees</div>
                    <div className="metric-value pink">{unique_attendees.campus_public}</div>
                    <div className="metric-detail">unique users per event avg</div>
                </div>
            </div>

            <div className="charts-grid">
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Discovery User Retention</div>
                            <div className="card-subtitle">% users active after discovering via campus feed</div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={campusRetention}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                            <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#666" }} />
                            <YAxis tick={{ fontSize: 10, fill: "#666" }} unit="%" />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="retention_pct" name="Retention %" stroke="#6236FF" strokeWidth={3} dot={{ r: 4, fill: "#111", stroke: "#6236FF", strokeWidth: 2 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">RSVP by Event Type</div>
                            <div className="card-subtitle">Campus discovery engagement by category</div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={typePerformance} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                            <XAxis type="number" tick={{ fontSize: 10, fill: "#666" }} unit="%" />
                            <YAxis type="category" dataKey="event_type" width={100} tick={{ fontSize: 11, fill: "#111", fontWeight: 700 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="rsvp_rate" name="RSVP Rate" radius={[0, 4, 4, 0]}>
                                {typePerformance.map((entry, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="charts-grid" style={{ marginTop: 24 }}>
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Event Type Distribution</div>
                            <div className="card-subtitle">Breakdown of categories on campus feed</div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={eventTypes}
                                cx="50%" cy="50%"
                                outerRadius={100} innerRadius={50}
                                dataKey="count" nameKey="event_type"
                                label={({ event_type, percent }) => `${event_type} ${(percent * 100).toFixed(0)}%`}
                                labelLine={{ stroke: "#111" }}
                                stroke="#111" strokeWidth={2}
                            >
                                {eventTypes.map((entry, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Engagement Trends</div>
                            <div className="card-subtitle">Weekly RSVP and attendance rates</div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={engagementSlice}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                            <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#666" }} interval={2} />
                            <YAxis tick={{ fontSize: 10, fill: "#666" }} unit="%" />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 12, fontWeight: 700, color: "#111" }} />
                            <Line type="monotone" dataKey="yes_rate" name="RSVP Rate %" stroke="#6236FF" strokeWidth={3} dot={false} />
                            <Line type="monotone" dataKey="attendance_rate" name="Attendance %" stroke="#22c55e" strokeWidth={3} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="card" style={{ marginTop: 24 }}>
                <div className="card-header">
                    <div className="card-title" style={{ fontSize: "20px" }}>🎯 How Campus Discovery Works</div>
                </div>
                <div style={{ fontSize: 14, color: "#3D3D4E", lineHeight: 1.7, fontWeight: 500 }}>
                    <p style={{ marginBottom: 12 }}>
                        Partiful U lets students discover events happening across their campus, not just within their
                        existing friend graph. Hosts can tag events for campus-wide visibility, surfacing them in the
                        <strong style={{ color: "#6236FF" }}> Campus Discovery Feed</strong> for all students at that university.
                    </p>
                    <p style={{ marginBottom: 12 }}>
                        This expands the event audience beyond organic social reach, enabling students to find parties,
                        study groups, cultural events, and club activities they&apos;d otherwise miss.
                    </p>
                    <p>
                        <strong>Key product pillars:</strong> university-scoped privacy, host opt-in visibility, organic
                        campus graph building, and interest-based event surfacing.
                    </p>
                </div>
            </div>
        </div>
    );
}
