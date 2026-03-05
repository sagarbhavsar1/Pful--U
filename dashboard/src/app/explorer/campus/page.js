"use client";
import { useState, useMemo } from "react";
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer,
} from "recharts";

import uniPerformance from "@/data/university_performance.json";
import clusterAssignments from "@/data/university_cluster_assignments.json";

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: "rgba(10,10,15,0.95)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8, padding: "10px 14px", fontSize: 12,
        }}>
            <p style={{ color: "#f0f0f5", fontWeight: 600, marginBottom: 4 }}>{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color || "#8b8b9e" }}>
                    {p.name}: {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
                </p>
            ))}
        </div>
    );
};

export default function CampusPage() {
    const [selectedUni, setSelectedUni] = useState(uniPerformance[0]?.university_id || "");

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
        { metric: "Social (Friends)", campus: Math.min(uni.avg_friend_count / 30 * 100, 100), benchmark: Math.min(benchmarks.avg_friend_count / 30 * 100, 100) },
    ] : [];

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
        if (ratio > 1.15) return { label: "Outperforming", color: "green" };
        if (ratio < 0.85) return { label: "Underperforming", color: "red" };
        return { label: "On Par", color: "purple" };
    };

    return (
        <div>
            <div className="page-header">
                <h2>Campus Comparison</h2>
                <p>Compare individual university performance against national benchmarks.</p>
            </div>

            <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
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
                    <div className="metrics-grid">
                        {[
                            { label: "Users", value: uni.total_users.toLocaleString(), detail: `${uni.student_population.toLocaleString()} students`, color: "purple" },
                            { label: "Events", value: uni.total_events.toLocaleString(), detail: `${uni.events_per_1k_users}/1K users`, color: "pink" },
                            { label: "RSVP Yes Rate", value: `${uni.rsvp_yes_rate}%`, detail: performanceLevel(uni.rsvp_yes_rate, benchmarks.rsvp_yes_rate).label, color: "blue" },
                            { label: "Attendance Rate", value: `${uni.attendance_rate}%`, detail: performanceLevel(uni.attendance_rate, benchmarks.attendance_rate).label, color: "green" },
                            { label: "Host Repeat Rate", value: `${uni.host_repeat_rate}%`, detail: `${uni.unique_hosts} unique hosts`, color: "orange" },
                        ].map((m, i) => (
                            <div key={i} className={`metric-card ${m.color} animate-in`}>
                                <div className="metric-label">{m.label}</div>
                                <div className={`metric-value ${m.color}`}>{m.value}</div>
                                <div className="metric-detail">{m.detail}</div>
                            </div>
                        ))}
                    </div>

                    <div className="charts-grid">
                        <div className="card">
                            <div className="card-header">
                                <div>
                                    <div className="card-title">Performance Radar</div>
                                    <div className="card-subtitle">Campus vs National Benchmark (normalized)</div>
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                                <RadarChart data={radarData}>
                                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "#8b8b9e" }} />
                                    <PolarRadiusAxis tick={false} axisLine={false} />
                                    <Radar name="Campus" dataKey="campus" stroke="#6236FF" fill="#6236FF" fillOpacity={0.2} strokeWidth={2} />
                                    <Radar name="Benchmark" dataKey="benchmark" stroke="#5a5a6e" fill="#5a5a6e" fillOpacity={0.1} strokeWidth={1} strokeDasharray="4 4" />
                                    <Tooltip content={<CustomTooltip />} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <div>
                                    <div className="card-title">Metric Comparison</div>
                                    <div className="card-subtitle">Selected campus vs national average</div>
                                </div>
                            </div>
                            <div style={{ padding: "16px 0" }}>
                                {[
                                    { label: "Event Density (events/1K users)", val: uni.events_per_1k_users, bench: benchmarks.events_per_1k_users, max: 400 },
                                    { label: "RSVP Yes Rate", val: uni.rsvp_yes_rate, bench: benchmarks.rsvp_yes_rate, max: 50 },
                                    { label: "Attendance Rate", val: uni.attendance_rate, bench: benchmarks.attendance_rate, max: 50 },
                                    { label: "Host Repeat Rate", val: uni.host_repeat_rate, bench: benchmarks.host_repeat_rate, max: 100 },
                                    { label: "Avg Friends", val: uni.avg_friend_count, bench: benchmarks.avg_friend_count, max: 30 },
                                ].map((item, i) => {
                                    const perf = performanceLevel(item.val, item.bench);
                                    return (
                                        <div key={i} className="comparison-bar-wrapper">
                                            <div className="comparison-bar-label">
                                                <span>{item.label}</span>
                                                <span style={{ color: `var(--accent-${perf.color})` }}>
                                                    {typeof item.val === "number" ? item.val.toFixed(1) : item.val} vs {item.bench.toFixed(1)}
                                                </span>
                                            </div>
                                            <div style={{ display: "flex", gap: 4 }}>
                                                <div className="comparison-bar" style={{ flex: 1 }}>
                                                    <div className="comparison-bar-fill" style={{
                                                        width: `${Math.min((item.val / item.max) * 100, 100)}%`,
                                                        background: `var(--accent-${perf.color})`,
                                                    }} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ marginBottom: 24 }}>
                        <div className="card-header">
                            <div>
                                <div className="card-title">Regional Event Density</div>
                                <div className="card-subtitle">Average events per 1K users by region</div>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={regionData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="region" tick={{ fontSize: 11, fill: "#8b8b9e" }} />
                                <YAxis tick={{ fontSize: 10, fill: "#5a5a6e" }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="avg_event_density" name="Avg Events/1K Users" fill="#6236FF" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">Campus Details</div>
                        </div>
                        <table className="data-table">
                            <tbody>
                                {[
                                    ["Region", uni.region],
                                    ["Type", uni.type],
                                    ["Setting", uni.setting],
                                    ["Student Population", uni.student_population.toLocaleString()],
                                    ["Adoption Rate", `${(uni.adoption_rate * 100).toFixed(1)}%`],
                                    ["Active Users", uni.total_users.toLocaleString()],
                                    ["Total Events", uni.total_events.toLocaleString()],
                                    ["Unique Hosts", uni.unique_hosts.toLocaleString()],
                                    ["Avg Invites/Event", uni.avg_invites],
                                ].map(([label, val], i) => (
                                    <tr key={i}>
                                        <td style={{ color: "var(--text-muted)", width: "40%" }}>{label}</td>
                                        <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{val}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
