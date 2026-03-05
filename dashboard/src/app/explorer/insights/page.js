"use client";

import insights from "@/data/insights.json";
import userSegments from "@/data/user_segments.json";
import uniClusters from "@/data/university_clusters.json";

const clusterColors = ["#6236FF", "#3B82F6", "#22C55E", "#EC4899", "#F97316"];

export default function InsightsPage() {
    const highInsights = insights.filter((i) => i.severity === "high");
    const medInsights = insights.filter((i) => i.severity === "medium");
    const lowInsights = insights.filter((i) => i.severity === "low");

    const renderInsightGroup = (items, label, icon) => {
        if (!items.length) return null;
        return (
            <div style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#f0f0f5" }}>{icon} {label}</span>
                    <span className="badge purple">{items.length} findings</span>
                </div>
                {items.map((insight, i) => (
                    <div key={i} className={`insight-card ${insight.severity}`}>
                        <div className="insight-category">{insight.category}</div>
                        <div className="insight-title">{insight.title}</div>
                        <div className="insight-body">{insight.body}</div>
                        <div className="insight-recommendation">
                            <strong>↳ Recommendation: </strong>{insight.recommendation}
                        </div>
                        {insight.metric && <div className="insight-metric">{insight.metric}</div>}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div>
            <div className="page-header">
                <h2>Insights & Recommendations</h2>
                <p>Data-driven product insights with actionable recommendations for campus growth strategy.</p>
            </div>

            {renderInsightGroup(highInsights, "High Priority", "🔴")}
            {renderInsightGroup(medInsights, "Medium Priority", "🟡")}
            {renderInsightGroup(lowInsights, "Context", "⚪")}

            {/* University Clusters */}
            <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#f0f0f5", marginBottom: 16 }}>
                    🏫 University Cluster Profiles
                </div>
                <div className="cluster-grid">
                    {uniClusters.map((cluster, i) => (
                        <div key={i} className="cluster-card" style={{ borderTop: `3px solid ${clusterColors[i % clusterColors.length]}` }}>
                            <div className="cluster-name" style={{ color: clusterColors[i % clusterColors.length] }}>
                                {cluster.cluster_name}
                            </div>
                            <div className="cluster-count">{cluster.count} universities</div>
                            <div className="cluster-stats">
                                <div className="cluster-stat">
                                    <div className="cluster-stat-label">Events/1K</div>
                                    <div className="cluster-stat-value">{cluster.avg_events_per_1k}</div>
                                </div>
                                <div className="cluster-stat">
                                    <div className="cluster-stat-label">RSVP Rate</div>
                                    <div className="cluster-stat-value">{cluster.avg_rsvp_rate}%</div>
                                </div>
                                <div className="cluster-stat">
                                    <div className="cluster-stat-label">Attendance</div>
                                    <div className="cluster-stat-value">{cluster.avg_attendance_rate}%</div>
                                </div>
                                <div className="cluster-stat">
                                    <div className="cluster-stat-label">Host Repeat</div>
                                    <div className="cluster-stat-value">{cluster.avg_host_repeat_rate}%</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* User Segments */}
            <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#f0f0f5", marginBottom: 16 }}>
                    👤 User Engagement Segments
                </div>
                <div className="card">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Segment</th>
                                <th>Users</th>
                                <th>% of Total</th>
                                <th>Avg Hosted</th>
                                <th>Avg Attended</th>
                                <th>Avg Friends</th>
                                <th>RSVP Yes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userSegments.map((seg, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 600, color: clusterColors[i % clusterColors.length] }}>
                                        {seg.segment_name}
                                    </td>
                                    <td>{seg.count.toLocaleString()}</td>
                                    <td>{seg.pct_of_users}%</td>
                                    <td>{seg.avg_events_hosted}</td>
                                    <td>{seg.avg_events_attended}</td>
                                    <td>{seg.avg_friend_count}</td>
                                    <td>{(seg.avg_rsvp_yes_rate * 100).toFixed(1)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Strategic Recommendations */}
            <div className="card">
                <div className="card-header">
                    <div className="card-title">🧭 Strategic Recommendations</div>
                </div>
                <div style={{ fontSize: 13, color: "#8b8b9e", lineHeight: 1.8 }}>
                    <ol style={{ paddingLeft: 20 }}>
                        <li style={{ marginBottom: 12 }}>
                            <strong style={{ color: "#f0f0f5" }}>Make campus visibility the default for all new events.</strong>
                            {" "}With a 55% RSVP rate on campus-visible events, defaulting new events to campus-wide visibility would maximize engagement.
                        </li>
                        <li style={{ marginBottom: 12 }}>
                            <strong style={{ color: "#f0f0f5" }}>Prioritize mid-size private urban campuses for GTM.</strong>
                            {" "}These show the highest adoption rates and engagement density.
                        </li>
                        <li style={{ marginBottom: 12 }}>
                            <strong style={{ color: "#f0f0f5" }}>Invest in host retention and creator tools.</strong>
                            {" "}Power hosts (7% of users) drive disproportionate platform value.
                        </li>
                        <li style={{ marginBottom: 12 }}>
                            <strong style={{ color: "#f0f0f5" }}>Build the campus discovery feed as the primary landing experience.</strong>
                            {" "}Students want to discover events beyond their friend graph.
                        </li>
                        <li>
                            <strong style={{ color: "#f0f0f5" }}>Pre-seed campus content during orientation weeks.</strong>
                            {" "}Orientation drives 3x user acquisition.
                        </li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
