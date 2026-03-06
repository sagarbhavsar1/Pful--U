"use client";
import { useState } from "react";
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, LineChart, Line, Cell
} from "recharts";

import summaryData from "@/data/summary.json";
import weeklyEvents from "@/data/weekly_events.json";
import weeklyUsers from "@/data/weekly_users.json";
import avgRetention from "@/data/avg_retention_curve.json";
import uniPerformance from "@/data/university_performance.json";

// Shared Theme Colors
const COLORS = {
    purple: "#6236FF",
    pink: "#EC4899",
    green: "#22C55E",
    blue: "#3B82F6",
    orange: "#F59E0B"
};

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

// Mock sparkline data for KPI cards to show trends
const generateSparkline = (base, volatility) => {
    return Array.from({ length: 7 }, (_, i) => ({
        val: base + (Math.random() * volatility - volatility / 2) + (i * volatility * 0.2)
    }));
};

const kpiSparklines = {
    campuses: generateSparkline(100, 10),
    users: generateSparkline(500, 50),
    events: generateSparkline(300, 30),
    rsvps: generateSparkline(1000, 100),
};

// Simulated Live Feed Data
const liveInsights = [
    { type: "milestone", emoji: "🎉", text: "Crossed 600K total platform users", time: "2h ago" },
    { type: "trending", emoji: "🔥", text: "UC Santa Barbara event volume up 42% this week", time: "4h ago" },
    { type: "alert", emoji: "⚡️", text: "New peak: 15,000 RSVPs processed in one hour", time: "Yesterday" },
    { type: "milestone", emoji: "🚀", text: "Florida State adoption rate hit 35%", time: "Yesterday" },
    { type: "trending", emoji: "📈", text: "Greek life events increased by 18% across South region", time: "2 days ago" }
];

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: "#fff", border: "3px solid #111",
            borderRadius: 12, padding: "12px 16px", fontSize: 13,
            boxShadow: "6px 6px 0px #111"
        }}>
            <p style={{ color: "#111", fontWeight: 800, margin: "0 0 6px 0", fontSize: 15 }}>{label}</p>
            {payload.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.color, border: "2px solid #111" }}></div>
                    <span style={{ color: "#3D3D4E", fontWeight: 600 }}>{p.name}:</span>
                    <span style={{ color: "#111", fontWeight: 900 }}>
                        {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default function ExplorerOverviewPage() {
    const [activeTab, setActiveTab] = useState("health");

    // Prepare chart data
    const eventData = weeklyEvents.map((d, i) => ({ ...d, label: weekLabels[i] || `W${d.event_week}` }));
    const userData = weeklyUsers.map((d, i) => ({ ...d, label: weekLabels[i] || `W${i}` }));
    const retentionData = avgRetention.map((d) => ({ ...d, label: `W${d.weeks_since_join}` }));

    const topCampuses = [...uniPerformance]
        .sort((a, b) => b.total_events - a.total_events)
        .slice(0, 10);

    const kpiCards = [
        { id: "campuses", label: "Active Campuses", value: summaryData.total_universities, color: COLORS.purple, icon: "🏛️", trend: "+12%", sparkline: kpiSparklines.campuses },
        { id: "users", label: "Total Students", value: summaryData.total_users.toLocaleString(), color: COLORS.pink, icon: "👥", trend: "+24%", sparkline: kpiSparklines.users },
        { id: "events", label: "Total Events", value: summaryData.total_events.toLocaleString(), color: COLORS.blue, icon: "🎉", trend: "+18%", sparkline: kpiSparklines.events },
        { id: "rsvps", label: "Total RSVPs", value: summaryData.total_rsvps.toLocaleString(), color: COLORS.green, icon: "✅", trend: "+31%", sparkline: kpiSparklines.rsvps },
    ];

    return (
        <div className="animate-in">
            {/* Header & Tabs */}
            <div className="page-header" style={{ marginBottom: "20px" }}>
                <h2>Executive Overview</h2>
                <p>Platform-wide metrics and growth trajectories across all {summaryData.total_universities} campuses.</p>
            </div>

            <div className="insights-tabs">
                <button
                    className={`insights-tab ${activeTab === 'health' ? 'active' : ''}`}
                    onClick={() => setActiveTab('health')}
                >
                    ⚡️ Platform Health
                </button>
                <button
                    className={`insights-tab ${activeTab === 'growth' ? 'active' : ''}`}
                    onClick={() => setActiveTab('growth')}
                >
                    🚀 Growth Trajectories
                </button>
                <button
                    className={`insights-tab ${activeTab === 'retention' ? 'active' : ''}`}
                    onClick={() => setActiveTab('retention')}
                >
                    🧲 User Retention
                </button>
            </div>

            {/* TAB CONTENT: Platform Health */}
            {activeTab === 'health' && (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

                    {/* Bento Layout Top Section */}
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", alignItems: "start" }}>

                        {/* Premium KPI Cards */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
                            {kpiCards.map((card) => (
                                <div key={card.id} className="kpi-bento-card" style={{
                                    background: "#fff",
                                    border: "3px solid #111",
                                    borderRadius: "16px",
                                    padding: "20px",
                                    position: "relative",
                                    overflow: "hidden",
                                    boxShadow: "6px 6px 0px #111"
                                }}>
                                    <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                        <div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                                                <span style={{ fontSize: "18px" }}>{card.icon}</span>
                                                <span style={{ fontSize: "12px", color: "#3D3D4E", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px" }}>{card.label}</span>
                                            </div>
                                            <div style={{ fontSize: "32px", fontWeight: 900, color: "#111", letterSpacing: "-1.5px", lineHeight: "1" }}>
                                                {card.value}
                                            </div>
                                        </div>
                                        <div style={{
                                            background: "rgba(34, 197, 94, 0.15)", color: "#4ADE80",
                                            padding: "4px 8px", borderRadius: "100px", fontSize: "11px", fontWeight: 700
                                        }}>
                                            {card.trend}
                                        </div>
                                    </div>

                                    {/* Mini Sparkline Chart */}
                                    <div style={{ height: "40px", marginTop: "16px" }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={card.sparkline}>
                                                <Line type="monotone" dataKey="val" stroke={card.color} strokeWidth={3} dot={false} isAnimationActive={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Live Insights Feed */}
                        <div className="card" style={{ height: "100%", margin: 0 }}>
                            <div className="card-header" style={{ marginBottom: "16px" }}>
                                <div>
                                    <div className="card-title" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "18px", letterSpacing: "-0.5px" }}>
                                        <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#10B981", border: "2px solid #111" }}></div>
                                        Live Insights
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                {liveInsights.map((insight, idx) => (
                                    <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                                        <div style={{
                                            width: "36px", height: "36px", borderRadius: "50%",
                                            background: "#f0f0f5", border: "2px solid #111",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: "18px", flexShrink: 0, boxShadow: "2px 2px 0px #111"
                                        }}>
                                            {insight.emoji}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: "14px", color: "#111", fontWeight: "600", lineHeight: "1.4" }}>{insight.text}</div>
                                            <div style={{ fontSize: "12px", color: "#8b8b9e", marginTop: "4px", fontWeight: "700" }}>{insight.time}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Top Campuses Chart Wide */}
                    <div className="card">
                        <div className="card-header">
                            <div>
                                <div className="card-title">Top Producing Campuses</div>
                                <div className="card-subtitle">Highest event-volume universities on the network</div>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={320}>
                            <BarChart data={topCampuses} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" horizontal={true} vertical={false} />
                                <XAxis type="number" tick={{ fontSize: 10, fill: "#666" }} axisLine={false} tickLine={false} />
                                <YAxis type="category" dataKey="name" width={180} tick={{ fontSize: 11, fill: "#111", fontWeight: 800 }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.04)' }} content={<CustomTooltip />} />
                                <Bar dataKey="total_events" name="Total Events" radius={[0, 4, 4, 0]} barSize={16}>
                                    {topCampuses.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index < 3 ? COLORS.purple : "rgba(98, 54, 255, 0.2)"} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                </div>
            )}

            {/* TAB CONTENT: Growth Trajectories */}
            {activeTab === 'growth' && (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <div className="card">
                        <div className="card-header">
                            <div>
                                <div className="card-title">Event Volume Trajectory</div>
                                <div className="card-subtitle">Weekly events created across all active campuses</div>
                            </div>
                            <div style={{ padding: "4px 12px", background: "rgba(98, 54, 255, 0.1)", color: "#a78bfa", borderRadius: "100px", fontSize: "11px", fontWeight: 700 }}>
                                Peak: Week 38
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={360}>
                            <AreaChart data={eventData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradEventsMain" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={COLORS.purple} stopOpacity={0.5} />
                                        <stop offset="100%" stopColor={COLORS.purple} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" vertical={false} />
                                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#666" }} axisLine={false} tickLine={false} interval={4} />
                                <YAxis tick={{ fontSize: 10, fill: "#666" }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="events" name="Events" stroke={COLORS.purple} fill="url(#gradEventsMain)" strokeWidth={3} activeDot={{ r: 6, fill: COLORS.purple, stroke: "#111", strokeWidth: 2 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <div>
                                <div className="card-title">Network User Growth</div>
                                <div className="card-subtitle">Cumulative users acquiring the platform</div>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={360}>
                            <AreaChart data={userData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradUsersMain" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={COLORS.pink} stopOpacity={0.5} />
                                        <stop offset="100%" stopColor={COLORS.pink} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" vertical={false} />
                                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#666" }} axisLine={false} tickLine={false} interval={4} />
                                <YAxis tick={{ fontSize: 10, fill: "#666" }} axisLine={false} tickLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="cumulative_users" name="Total Users" stroke={COLORS.pink} fill="url(#gradUsersMain)" strokeWidth={3} activeDot={{ r: 6, fill: COLORS.pink, stroke: "#111", strokeWidth: 2 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: User Retention */}
            {activeTab === 'retention' && (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <div className="card">
                        <div className="card-header">
                            <div>
                                <div className="card-title">Platform Retention Curve</div>
                                <div className="card-subtitle">Average percentage of users returning after first RSVP</div>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={400}>
                            <AreaChart data={retentionData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradRetentionMain" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={COLORS.green} stopOpacity={0.4} />
                                        <stop offset="100%" stopColor={COLORS.green} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" vertical={false} />
                                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#666" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: "#666" }} unit="%" axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="retention_pct" name="Retention %" stroke={COLORS.green} fill="url(#gradRetentionMain)" strokeWidth={3} activeDot={{ r: 6, fill: COLORS.green, stroke: "#111", strokeWidth: 2 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
}
