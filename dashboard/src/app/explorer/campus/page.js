"use client";
import { useState, useMemo } from "react";
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell,
} from "recharts";

import uniPerformance from "@/data/university_performance.json";
import clusterAssignments from "@/data/university_cluster_assignments.json";

const COLORS = ["#6236FF", "#EC4899", "#3B82F6", "#22C55E", "#F97316", "#EF4444", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B"];



const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: "#fff", border: "3px solid #111",
            borderRadius: 12, padding: "12px 16px", fontSize: 13, boxShadow: "6px 6px 0px #111",
        }}>
            <p style={{ color: "#111", fontWeight: 800, marginBottom: 6, fontSize: 13 }}>{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color || "#3D3D4E", margin: "2px 0", fontWeight: 700 }}>
                    {p.name}: {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
                </p>
            ))}
        </div>
    );
};

export default function CampusPage() {
    const [selectedUni, setSelectedUni] = useState(uniPerformance[0]?.university_id || "");
    const [activeTab, setActiveTab] = useState("overview");

    const uni = useMemo(
        () => uniPerformance.find((u) => u.university_id === selectedUni),
        [selectedUni]
    );

    const clusterInfo = useMemo(
        () => clusterAssignments.find((c) => c.university_id === selectedUni),
        [selectedUni]
    );

    const benchmarks = useMemo(() => {
        const n = uniPerformance.length;
        return {
            events_per_1k_users: uniPerformance.reduce((s, u) => s + u.events_per_1k_users, 0) / n,
            rsvp_yes_rate: uniPerformance.reduce((s, u) => s + u.rsvp_yes_rate, 0) / n,
            attendance_rate: uniPerformance.reduce((s, u) => s + u.attendance_rate, 0) / n,
            host_repeat_rate: uniPerformance.reduce((s, u) => s + u.host_repeat_rate, 0) / n,
            avg_friend_count: uniPerformance.reduce((s, u) => s + u.avg_friend_count, 0) / n,
        };
    }, []);

    const radarData = uni ? [
        { metric: "Event Density", campus: Math.min(uni.events_per_1k_users / 400 * 100, 100), benchmark: Math.min(benchmarks.events_per_1k_users / 400 * 100, 100) },
        { metric: "RSVP Rate", campus: uni.rsvp_yes_rate, benchmark: benchmarks.rsvp_yes_rate },
        { metric: "Attendance", campus: uni.attendance_rate, benchmark: benchmarks.attendance_rate },
        { metric: "Host Repeat", campus: Math.min(uni.host_repeat_rate, 100), benchmark: Math.min(benchmarks.host_repeat_rate, 100) },
        { metric: "Social", campus: Math.min(uni.avg_friend_count / 30 * 100, 100), benchmark: Math.min(benchmarks.avg_friend_count / 30 * 100, 100) },
    ] : [];

    /* Rank top campuses by various metrics */
    const topByEvents = useMemo(() =>
        [...uniPerformance].sort((a, b) => b.total_events - a.total_events).slice(0, 8),
        []);

    const topByEngagement = useMemo(() =>
        [...uniPerformance].sort((a, b) => b.rsvp_yes_rate - a.rsvp_yes_rate).slice(0, 8),
        []);

    /* Rank top campuses by our platform data */
    const enrichedRankings = useMemo(() => {
        // Calculate a ranking score based heavily on event volume with a bonus for RSVP rate
        const sorted = [...uniPerformance].sort((a, b) => b.total_events - a.total_events);
        return sorted.slice(0, 10).map((school, index) => ({
            ...school,
            rank: index + 1,
            hasData: true
        }));
    }, []);

    const regionData = useMemo(() => {
        const regions = {};
        uniPerformance.forEach((u) => {
            if (!regions[u.region]) regions[u.region] = { region: u.region, count: 0, total_events: 0, total_rsvp: 0 };
            regions[u.region].count++;
            regions[u.region].total_events += u.events_per_1k_users;
            regions[u.region].total_rsvp += u.rsvp_yes_rate;
        });
        return Object.values(regions).map((r) => ({
            region: r.region,
            avg_event_density: Math.round(r.total_events / r.count),
            avg_rsvp_rate: Math.round(r.total_rsvp / r.count * 10) / 10,
        }));
    }, []);

    const performanceLevel = (val, benchmark) => {
        const ratio = val / benchmark;
        if (ratio > 1.15) return { label: "Above avg", color: "#22C55E", icon: "↑" };
        if (ratio < 0.85) return { label: "Below avg", color: "#EF4444", icon: "↓" };
        return { label: "On par", color: "#A855F7", icon: "→" };
    };

    return (
        <div>
            {/* Page header */}
            <div className="page-header">
                <h2>Campus Insights</h2>
                <p>Deep dive into individual campus performance metrics and national party school rankings.</p>
            </div>

            {/* Tab navigation */}
            <div className="insights-tabs">
                {[
                    { key: "overview", label: "Campus Overview", icon: "📊" },
                    { key: "rankings", label: "Party School Rankings", icon: "🏆" }
                ].map(tab => (
                    <button
                        key={tab.key}
                        className={`insights-tab ${activeTab === tab.key ? "active" : ""}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        <span>{tab.icon}</span> {tab.label}
                    </button>
                ))}
            </div>

            {/* ===== TAB: Campus Overview ===== */}
            {activeTab === "overview" && (
                <>
                    <div className="campus-selector-bar">
                        <div className="select-wrapper">
                            <select value={selectedUni} onChange={(e) => setSelectedUni(e.target.value)}>
                                {uniPerformance.map((u) => (
                                    <option key={u.university_id} value={u.university_id}>{u.name}</option>
                                ))}
                            </select>
                        </div>
                        {clusterInfo && <span className="badge purple">{clusterInfo.cluster_name}</span>}
                    </div>

                    {uni && (
                        <>
                            {/* Key metrics row */}
                            <div className="metrics-grid">
                                {[
                                    { label: "Active Users", value: uni.total_users.toLocaleString(), icon: "👥", color: "purple", detail: `${(uni.adoption_rate * 100).toFixed(1)}% adoption` },
                                    { label: "Total Events", value: uni.total_events.toLocaleString(), icon: "🎉", color: "pink", detail: `${uni.events_per_1k_users}/1K users` },
                                    { label: "RSVP Rate", value: `${uni.rsvp_yes_rate}%`, icon: "✅", color: "blue", detail: performanceLevel(uni.rsvp_yes_rate, benchmarks.rsvp_yes_rate).label },
                                    { label: "Attendance", value: `${uni.attendance_rate}%`, icon: "🎯", color: "green", detail: performanceLevel(uni.attendance_rate, benchmarks.attendance_rate).label },
                                    { label: "Host Retention", value: `${uni.host_repeat_rate}%`, icon: "🔄", color: "orange", detail: `${uni.unique_hosts} hosts` },
                                ].map((m, i) => (
                                    <div key={i} className={`metric-card ${m.color} animate-in`}>
                                        <div className="metric-icon-label">
                                            <span className="metric-emoji">{m.icon}</span>
                                            <div className="metric-label">{m.label}</div>
                                        </div>
                                        <div className={`metric-value ${m.color}`}>{m.value}</div>
                                        <div className="metric-detail">{m.detail}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Radar + Comparison bars */}
                            <div className="charts-grid">
                                <div className="card">
                                    <div className="card-header">
                                        <div>
                                            <div className="card-title">Performance vs National Average</div>
                                            <div className="card-subtitle">Normalized comparison across 5 key metrics</div>
                                        </div>
                                    </div>
                                    <ResponsiveContainer width="100%" height={320}>
                                        <RadarChart data={radarData}>
                                            <PolarGrid stroke="rgba(0,0,0,0.1)" />
                                            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "#111", fontWeight: 700 }} />
                                            <PolarRadiusAxis tick={false} axisLine={false} />
                                            <Radar name="This Campus" dataKey="campus" stroke="#6236FF" fill="#6236FF" fillOpacity={0.25} strokeWidth={2.5} />
                                            <Radar name="National Avg" dataKey="benchmark" stroke="#111" fill="#666" fillOpacity={0.08} strokeWidth={2} strokeDasharray="4 4" />
                                            <Tooltip content={<CustomTooltip />} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="card">
                                    <div className="card-header">
                                        <div>
                                            <div className="card-title">Metric Breakdown</div>
                                            <div className="card-subtitle">Campus performance vs platform average</div>
                                        </div>
                                    </div>
                                    <div style={{ padding: "20px 0" }}>
                                        {[
                                            { label: "Event Density", val: uni.events_per_1k_users, bench: benchmarks.events_per_1k_users, max: 400, unit: "/1K" },
                                            { label: "RSVP Rate", val: uni.rsvp_yes_rate, bench: benchmarks.rsvp_yes_rate, max: 50, unit: "%" },
                                            { label: "Attendance", val: uni.attendance_rate, bench: benchmarks.attendance_rate, max: 50, unit: "%" },
                                            { label: "Host Repeat", val: uni.host_repeat_rate, bench: benchmarks.host_repeat_rate, max: 100, unit: "%" },
                                            { label: "Avg Friends", val: uni.avg_friend_count, bench: benchmarks.avg_friend_count, max: 30, unit: "" },
                                        ].map((item, i) => {
                                            const perf = performanceLevel(item.val, item.bench);
                                            return (
                                                <div key={i} className="comparison-bar-wrapper">
                                                    <div className="comparison-bar-label">
                                                        <span>{item.label}</span>
                                                        <span style={{ color: perf.color, fontWeight: 700 }}>
                                                            {perf.icon} {typeof item.val === "number" ? item.val.toFixed(1) : item.val}{item.unit}
                                                        </span>
                                                    </div>
                                                    <div className="comparison-bar">
                                                        <div className="comparison-bar-fill" style={{
                                                            width: `${Math.min((item.val / item.max) * 100, 100)}%`,
                                                            background: perf.color,
                                                        }} />
                                                        <div className="comparison-bar-benchmark" style={{
                                                            left: `${Math.min((item.bench / item.max) * 100, 100)}%`,
                                                        }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Campus details table */}
                            <div className="card" style={{ marginTop: 24 }}>
                                <div className="card-header">
                                    <div className="card-title">Campus Profile</div>
                                </div>
                                <div className="campus-profile-grid">
                                    {[
                                        { icon: "📍", label: "Region", val: uni.region },
                                        { icon: "🏛️", label: "Type", val: uni.type },
                                        { icon: "🌆", label: "Setting", val: uni.setting },
                                        { icon: "🎓", label: "Student Population", val: uni.student_population.toLocaleString() },
                                        { icon: "📈", label: "Adoption Rate", val: `${(uni.adoption_rate * 100).toFixed(1)}%` },
                                        { icon: "👥", label: "Active Users", val: uni.total_users.toLocaleString() },
                                        { icon: "🎉", label: "Total Events", val: uni.total_events.toLocaleString() },
                                        { icon: "🎤", label: "Unique Hosts", val: uni.unique_hosts.toLocaleString() },
                                        { icon: "💌", label: "Avg Invites/Event", val: uni.avg_invites },
                                    ].map((item, i) => (
                                        <div key={i} className="profile-stat">
                                            <span className="profile-stat-icon">{item.icon}</span>
                                            <div>
                                                <div className="profile-stat-label">{item.label}</div>
                                                <div className="profile-stat-value">{item.val}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}

            {/* ===== TAB: Party School Rankings ===== */}
            {activeTab === "rankings" && (
                <>
                    <div className="rankings-header-card card">
                        <div style={{ textAlign: "center", padding: "24px 0" }}>
                            <div className="rankings-badge">🏆 2026 Rankings</div>
                            <h3 className="rankings-title">Top Party Schools in America</h3>
                            <p className="rankings-subtitle">
                                Based on native Partiful U platform event volume and engagement rates.
                            </p>
                        </div>
                    </div>

                    <div className="rankings-list">
                        {enrichedRankings.map((school, i) => (
                            <div key={i} className={`ranking-card ${school.hasData ? "has-data" : ""}`}>
                                <div className="ranking-number">#{school.rank}</div>
                                <div className="ranking-info">
                                    <div className="ranking-name">{school.name}</div>
                                    <div className="ranking-meta">
                                        <span className="ranking-tag">{school.region}</span>
                                        <span className="ranking-tag">{school.type}</span>
                                        <span className="ranking-tag">{school.setting}</span>
                                    </div>
                                </div>
                                <div className="ranking-stats">
                                    {school.hasData ? (
                                        <>
                                            <div className="ranking-stat">
                                                <div className="ranking-stat-value">{school.total_events?.toLocaleString()}</div>
                                                <div className="ranking-stat-label">Events</div>
                                            </div>
                                            <div className="ranking-stat">
                                                <div className="ranking-stat-value">{school.rsvp_yes_rate}%</div>
                                                <div className="ranking-stat-label">RSVP Rate</div>
                                            </div>
                                            <div className="ranking-stat">
                                                <div className="ranking-stat-value">{school.total_users?.toLocaleString()}</div>
                                                <div className="ranking-stat-label">Users</div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="ranking-no-data">Not in dataset</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Top campuses by volume chart */}
                    <div className="charts-grid" style={{ marginTop: 24 }}>
                        <div className="card">
                            <div className="card-header">
                                <div>
                                    <div className="card-title">Top Campuses by Event Volume</div>
                                    <div className="card-subtitle">Highest event-producing universities on Partiful U</div>
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart data={topByEvents} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                                    <XAxis type="number" tick={{ fontSize: 10, fill: "#666" }} />
                                    <YAxis type="category" dataKey="name" width={180} tick={{ fontSize: 11, fill: "#111", fontWeight: 700 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="total_events" name="Events" radius={[0, 6, 6, 0]}>
                                        {topByEvents.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <div>
                                    <div className="card-title">Top Campuses by RSVP Engagement</div>
                                    <div className="card-subtitle">Highest RSVP yes-rate across platform</div>
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart data={topByEngagement} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                                    <XAxis type="number" tick={{ fontSize: 10, fill: "#666" }} unit="%" />
                                    <YAxis type="category" dataKey="name" width={180} tick={{ fontSize: 11, fill: "#111", fontWeight: 700 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="rsvp_yes_rate" name="RSVP %" radius={[0, 6, 6, 0]}>
                                        {topByEngagement.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            )}

        </div>
    );
}
