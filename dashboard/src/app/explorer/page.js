"use client";
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from "recharts";

import summaryData from "@/data/summary.json";
import weeklyEvents from "@/data/weekly_events.json";
import weeklyUsers from "@/data/weekly_users.json";
import avgRetention from "@/data/avg_retention_curve.json";
import uniPerformance from "@/data/university_performance.json";

const weekLabels = [
    "Aug W1", "Aug W2", "Aug W3", "Aug W4",
    "Sep W1", "Sep W2", "Sep W3", "Sep W4",
    "Oct W1", "Oct W2", "Oct W3", "Oct W4", "Oct W5",
    "Nov W1", "Nov W2", "Nov W3", "Nov W4",
    "Dec W1", "Dec W2", "Dec W3", "Dec W4",
    "Jan W1", "Jan W2", "Jan W3", "Jan W4", "Jan W5",
    "Feb W1", "Feb W2", "Feb W3", "Feb W4",
    "Mar W1", "Mar W2", "Mar W3", "Mar W4",
    "Apr W1", "Apr W2", "Apr W3", "Apr W4", "Apr W5",
    "May W1", "May W2", "May W3", "May W4",
    "Jun W1", "Jun W2", "Jun W3", "Jun W4",
    "Jul W1", "Jul W2", "Jul W3", "Jul W4", "Jul W5",
];

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: "rgba(10,10,15,0.95)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8, padding: "10px 14px", fontSize: 12,
        }}>
            <p style={{ color: "#f0f0f5", fontWeight: 600, marginBottom: 4 }}>{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }}>
                    {p.name}: {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
                </p>
            ))}
        </div>
    );
};

export default function ExplorerOverviewPage() {
    const eventData = weeklyEvents.map((d, i) => ({ ...d, label: weekLabels[i] || `W${d.event_week}` }));
    const userData = weeklyUsers.map((d, i) => ({ ...d, label: weekLabels[i] || `W${i}` }));
    const retentionData = avgRetention.map((d) => ({ ...d, label: `W${d.week}` }));

    const topCampuses = [...uniPerformance]
        .sort((a, b) => b.total_events - a.total_events)
        .slice(0, 10);

    return (
        <div>
            <div className="page-header">
                <h2>Executive Overview</h2>
                <p>Platform-wide metrics across {summaryData.total_universities} campuses.</p>
            </div>

            {/* Hero Metrics */}
            <div className="metrics-grid">
                {[
                    { label: "Campuses", value: summaryData.total_universities, color: "purple" },
                    { label: "Students", value: summaryData.total_users.toLocaleString(), color: "pink" },
                    { label: "Events", value: summaryData.total_events.toLocaleString(), color: "blue" },
                    { label: "RSVPs", value: summaryData.total_rsvps.toLocaleString(), color: "green" },
                ].map((m, i) => (
                    <div key={i} className={`metric-card ${m.color} animate-in`}>
                        <div className="metric-label">{m.label}</div>
                        <div className={`metric-value ${m.color}`}>{m.value}</div>
                    </div>
                ))}
            </div>

            {/* Event Volume + User Growth */}
            <div className="charts-grid">
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Event Volume</div>
                            <div className="card-subtitle">Weekly events across all campuses</div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={eventData}>
                            <defs>
                                <linearGradient id="gradEvents" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6236FF" stopOpacity={0.4} />
                                    <stop offset="100%" stopColor="#6236FF" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#5a5a6e" }} interval={3} />
                            <YAxis tick={{ fontSize: 10, fill: "#5a5a6e" }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="events" name="Events" stroke="#6236FF" fill="url(#gradEvents)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">User Growth</div>
                            <div className="card-subtitle">Cumulative users and new weekly sign-ups</div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={userData}>
                            <defs>
                                <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#EC4899" stopOpacity={0.4} />
                                    <stop offset="100%" stopColor="#EC4899" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#5a5a6e" }} interval={3} />
                            <YAxis tick={{ fontSize: 10, fill: "#5a5a6e" }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="cumulative_users" name="Total Users" stroke="#EC4899" fill="url(#gradUsers)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Retention + Top Campuses */}
            <div className="charts-grid">
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Retention Curve</div>
                            <div className="card-subtitle">Average user retention across all campuses</div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={retentionData}>
                            <defs>
                                <linearGradient id="gradRetention" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#22C55E" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#5a5a6e" }} />
                            <YAxis tick={{ fontSize: 10, fill: "#5a5a6e" }} unit="%" />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="retention_pct" name="Retention %" stroke="#22C55E" fill="url(#gradRetention)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Top Campuses by Volume</div>
                            <div className="card-subtitle">Highest event-producing universities</div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={topCampuses} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis type="number" tick={{ fontSize: 10, fill: "#5a5a6e" }} />
                            <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 10, fill: "#8b8b9e" }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="total_events" name="Events" fill="#6236FF" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
