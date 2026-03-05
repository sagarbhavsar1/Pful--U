"use client";
import {
    AreaChart, Area, LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

import seasonalityDecomp from "@/data/seasonality_decomposition.json";
import weeklyEngagement from "@/data/weekly_engagement.json";
import weeklyEvents from "@/data/weekly_events.json";
import seasonalAnomalies from "@/data/seasonal_anomalies.json";

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
                    {p.name}: {typeof p.value === "number" ? Math.round(p.value * 10) / 10 : p.value}
                </p>
            ))}
        </div>
    );
};

const periods = [
    { start: 0, end: 3, label: "Orientation", color: "#22c55e" },
    { start: 8, end: 11, label: "Midterms", color: "#ef4444" },
    { start: 15, end: 16, label: "Thanksgiving", color: "#f97316" },
    { start: 17, end: 23, label: "Finals + Winter Break", color: "#3b82f6" },
    { start: 24, end: 27, label: "Spring Start", color: "#22c55e" },
    { start: 32, end: 33, label: "Spring Break", color: "#f97316" },
    { start: 38, end: 43, label: "Pre-Finals + Finals", color: "#ef4444" },
    { start: 44, end: 46, label: "Graduation", color: "#6236FF" },
    { start: 47, end: 51, label: "Summer", color: "#3b82f6" },
];

export default function SeasonalityPage() {
    const decomp = seasonalityDecomp.map((d, i) => ({ ...d, label: weekLabels[i] || `W${d.week}` }));
    const engagement = weeklyEngagement.map((d) => ({ ...d, label: weekLabels[d.event_week] || `W${d.event_week}` }));
    const events = weeklyEvents.map((d, i) => ({ ...d, label: weekLabels[i] || `W${d.event_week}` }));

    return (
        <div>
            <div className="page-header">
                <h2>Seasonality Analysis</h2>
                <p>Time-series decomposition and academic calendar patterns across 52 weeks of simulation.</p>
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
                <div className="card-header">
                    <div className="card-title">Academic Calendar Periods</div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {periods.map((p, i) => (
                        <div key={i} style={{
                            display: "flex", alignItems: "center", gap: 6,
                            padding: "4px 10px", borderRadius: 6,
                            background: `${p.color}15`, border: `1px solid ${p.color}30`,
                            fontSize: 11, color: p.color, fontWeight: 500,
                        }}>
                            <span>W{p.start}–W{p.end}</span>
                            <span style={{ color: "#8b8b9e" }}>{p.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
                <div className="card-header">
                    <div>
                        <div className="card-title">Weekly Event Volume</div>
                        <div className="card-subtitle">Raw event counts showing academic calendar seasonality</div>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={events}>
                        <defs>
                            <linearGradient id="gradEventsS" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#6236FF" stopOpacity={0.4} />
                                <stop offset="100%" stopColor="#6236FF" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#5a5a6e" }} interval={2} />
                        <YAxis tick={{ fontSize: 10, fill: "#5a5a6e" }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="events" name="Events" stroke="#6236FF" fill="url(#gradEventsS)" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="charts-grid">
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Trend Component</div>
                            <div className="card-subtitle">Underlying growth trend after removing seasonality</div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={decomp}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#5a5a6e" }} interval={4} />
                            <YAxis tick={{ fontSize: 10, fill: "#5a5a6e" }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="trend" name="Trend" stroke="#3b82f6" strokeWidth={2} dot={false} connectNulls />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Seasonal Component</div>
                            <div className="card-subtitle">Recurring periodic pattern (13-week cycle)</div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={decomp}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#5a5a6e" }} interval={4} />
                            <YAxis tick={{ fontSize: 10, fill: "#5a5a6e" }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="seasonal" name="Seasonal" fill="#EC4899" radius={[2, 2, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="card" style={{ marginTop: 24, marginBottom: 24 }}>
                <div className="card-header">
                    <div>
                        <div className="card-title">Weekly RSVP & Attendance Rates</div>
                        <div className="card-subtitle">RSVP Yes rate and attendance rate by week</div>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={engagement}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#5a5a6e" }} interval={3} />
                        <YAxis tick={{ fontSize: 10, fill: "#5a5a6e" }} unit="%" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Line type="monotone" dataKey="yes_rate" name="RSVP Yes %" stroke="#6236FF" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="attendance_rate" name="Attendance %" stroke="#22c55e" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {seasonalAnomalies.length > 0 && (
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Anomalous Weeks</div>
                            <div className="card-subtitle">Weeks with residual activity &gt; 2 standard deviations from expected</div>
                        </div>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Week</th>
                                <th>Observed</th>
                                <th>Expected</th>
                                <th>Residual</th>
                                <th>Direction</th>
                            </tr>
                        </thead>
                        <tbody>
                            {seasonalAnomalies.map((a, i) => (
                                <tr key={i}>
                                    <td>{weekLabels[a.week] || `W${a.week}`}</td>
                                    <td>{Math.round(a.observed).toLocaleString()}</td>
                                    <td>{a.expected ? Math.round(a.expected).toLocaleString() : "—"}</td>
                                    <td>{a.residual}</td>
                                    <td>
                                        <span className={`badge ${a.direction === "above" ? "green" : "red"}`}>
                                            {a.direction === "above" ? "↑ Above" : "↓ Below"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
