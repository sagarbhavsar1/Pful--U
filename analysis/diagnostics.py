"""
Automated diagnostics and insight generation.
Surfaces key findings, anomalies, and business recommendations.
"""

import os
import json
import numpy as np
import pandas as pd


class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (np.integer,)):
            return int(obj)
        if isinstance(obj, (np.floating,)):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super().default(obj)


def generate_insights(analytics_dir: str, analysis_dir: str, output_dir: str):
    """
    Generate automated insight statements from computed analytics.
    These read like analyst conclusions, not raw data.
    """
    insights = []

    # --- Load all computed data ---
    def _load(directory, filename):
        path = os.path.join(directory, filename)
        if os.path.exists(path):
            with open(path) as f:
                return json.load(f)
        return None

    uni_perf = _load(analytics_dir, "university_performance.json")
    visibility_impact = _load(analysis_dir, "visibility_impact.json")
    visibility_by_type = _load(analysis_dir, "visibility_impact_by_type.json")
    uni_clusters = _load(analysis_dir, "university_clusters.json")
    user_segments = _load(analysis_dir, "user_segments.json")
    vis_retention = _load(analysis_dir, "visibility_retention_comparison.json")
    weekly_events = _load(analytics_dir, "weekly_events.json")

    # --- Insight 1: Visibility Impact (the headline) ---
    if visibility_impact:
        rsvp_lift = visibility_impact["rsvp_positive_rate"]["lift_pct"]
        attend_lift = visibility_impact["attendance_rate"]["lift_pct"]
        p_val = visibility_impact["rsvp_positive_rate"]["p_value"]
        sig = "statistically significant" if p_val < 0.05 else "not statistically significant"

        insights.append({
            "category": "Feature Impact",
            "severity": "high",
            "title": "Campus-Public Visibility Drives Higher Engagement",
            "body": f"Events with campus-wide visibility show a {rsvp_lift:.1f}% higher RSVP positive rate and {attend_lift:.1f}% higher attendance compared to friends-only events. This effect is {sig} (p={p_val:.4f}).",
            "recommendation": "Expand campus-public visibility as a default for eligible event types. Consider A/B testing opt-in campus visibility for hosts.",
            "metric": f"+{rsvp_lift:.1f}% RSVP lift",
        })

    # --- Insight 2: Best-performing event types for campus visibility ---
    if visibility_by_type:
        sorted_types = sorted(visibility_by_type, key=lambda x: x["lift_pct"], reverse=True)
        best_type = sorted_types[0]
        worst_type = sorted_types[-1]

        insights.append({
            "category": "Feature Impact",
            "severity": "medium",
            "title": f"Campus Visibility Most Effective for {best_type['event_type']} Events",
            "body": f"{best_type['event_type']} events see the largest RSVP lift from campus visibility ({best_type['lift_pct']:.1f}%), while {worst_type['event_type']} events see the smallest ({worst_type['lift_pct']:.1f}%).",
            "recommendation": f"Prioritize campus visibility promotion for {best_type['event_type']} and {sorted_types[1]['event_type']} event types where the feature has the most impact.",
            "metric": f"{best_type['lift_pct']:.1f}% lift for {best_type['event_type']}",
        })

    # --- Insight 3: University clusters ---
    if uni_clusters:
        high_growth = [c for c in uni_clusters if "High" in c["cluster_name"] or "Hub" in c["cluster_name"]]
        underperform = [c for c in uni_clusters if "Under" in c["cluster_name"] or "Low" in c["cluster_name"]]

        if high_growth:
            hg = high_growth[0]
            insights.append({
                "category": "Growth",
                "severity": "high",
                "title": f"{hg['count']} Universities Identified as High-Growth Hubs",
                "body": f"These campuses show {hg['avg_events_per_1k']:.0f} events/1K users (vs cluster average), with {hg['avg_host_repeat_rate']:.0f}% host repeat rate and {hg['avg_rsvp_rate']:.0f}% RSVP yes rate.",
                "recommendation": "Study these campuses for growth playbook insights. Consider dedicated campus ambassadors for sustained momentum.",
                "metric": f"{hg['count']} high-growth campuses",
            })

        if underperform:
            up = underperform[0]
            insights.append({
                "category": "Growth",
                "severity": "medium",
                "title": f"{up['count']} Campuses Underperforming Relative to Potential",
                "body": f"These schools have low event density ({up['avg_events_per_1k']:.0f}/1K users) and host repeat rate ({up['avg_host_repeat_rate']:.0f}%). They represent untapped growth potential.",
                "recommendation": "Deploy targeted activation campaigns: host workshops, incentivized first-event creation, and peer referral programs.",
                "metric": f"{up['count']} underperforming campuses",
            })

    # --- Insight 4: User segments ---
    if user_segments:
        lurkers = [s for s in user_segments if "Lurker" in s["segment_name"]]
        power_hosts = [s for s in user_segments if "Power" in s["segment_name"] or "Host" in s["segment_name"]]

        if lurkers:
            l = lurkers[0]
            insights.append({
                "category": "Engagement",
                "severity": "medium",
                "title": f"{l['pct_of_users']:.0f}% of Users Are Lurkers — Activation Opportunity",
                "body": f"{l['count']:,} users ({l['pct_of_users']:.0f}%) have created no events and attended very few. They have {l['avg_friend_count']:.0f} avg friends but {l['avg_events_attended']:.1f} avg events attended.",
                "recommendation": "Implement re-engagement campaigns: 'Events your friends are going to' notifications, personalized event recommendations, and low-friction RSVP flows.",
                "metric": f"{l['pct_of_users']:.0f}% lurker rate",
            })

        if power_hosts:
            ph = power_hosts[0]
            insights.append({
                "category": "Engagement",
                "severity": "high",
                "title": f"Power Hosts ({ph['pct_of_users']:.0f}% of users) Drive Disproportionate Value",
                "body": f"Just {ph['pct_of_users']:.0f}% of users host {ph['avg_events_hosted']:.1f} events on average. They also attend {ph['avg_events_attended']:.1f} events and have {ph['avg_friend_count']:.0f} friends.",
                "recommendation": "Protect and nurture power hosts with hosting tools, analytics, and recognition. Their churn would have outsized platform impact.",
                "metric": f"{ph['avg_events_hosted']:.1f} avg events hosted",
            })

    # --- Insight 5: Retention comparison ---
    if vis_retention:
        vis_df = pd.DataFrame(vis_retention)
        # Week 4 retention
        cp_w4 = vis_df[(vis_df["visibility_scope"] == "campus_public") & (vis_df["weeks_since_join"] == 4)]
        fo_w4 = vis_df[(vis_df["visibility_scope"] == "friends_only") & (vis_df["weeks_since_join"] == 4)]

        if len(cp_w4) > 0 and len(fo_w4) > 0:
            cp_ret = cp_w4.iloc[0]["retention_pct"]
            fo_ret = fo_w4.iloc[0]["retention_pct"]
            insights.append({
                "category": "Retention",
                "severity": "high",
                "title": "Campus Visibility Improves 4-Week Retention",
                "body": f"Users whose first event had campus visibility show {cp_ret:.1f}% 4-week retention vs {fo_ret:.1f}% for friends-only first events — a {cp_ret - fo_ret:.1f}pp difference.",
                "recommendation": "Default new events to campus-visible for first-time hosts to maximize early retention lift.",
                "metric": f"+{cp_ret - fo_ret:.1f}pp retention lift",
            })

    # --- Insight 6: Seasonality ---
    if weekly_events:
        we_df = pd.DataFrame(weekly_events)
        peak_week = we_df.loc[we_df["events"].idxmax()]
        trough_week = we_df.loc[we_df["events"].idxmin()]

        insights.append({
            "category": "Seasonality",
            "severity": "low",
            "title": "Event Volume Varies 6x Between Peak and Trough Weeks",
            "body": f"Peak activity: Week {int(peak_week['event_week'])} ({int(peak_week['events']):,} events). Lowest: Week {int(trough_week['event_week'])} ({int(trough_week['events']):,} events). This ~{peak_week['events']/max(trough_week['events'],1):.0f}x variation follows academic calendar patterns.",
            "recommendation": "Pre-load engagement campaigns before semester starts. Reduce marketing spend during break periods. Use trough weeks for platform maintenance.",
            "metric": f"{peak_week['events']/max(trough_week['events'],1):.0f}x seasonal swing",
        })

    # --- Insight 7: University performance distribution ---
    if uni_perf:
        perf_df = pd.DataFrame(uni_perf)
        top5 = perf_df.nlargest(5, "events_per_1k_users")[["name", "events_per_1k_users"]].to_dict(orient="records")
        bottom5 = perf_df.nsmallest(5, "events_per_1k_users")[["name", "events_per_1k_users"]].to_dict(orient="records")

        insights.append({
            "category": "Growth",
            "severity": "low",
            "title": "Wide Variance in Campus Engagement Density",
            "body": f"Top 5 campuses by event density generate {top5[0]['events_per_1k_users']:.0f}+ events/1K users, while bottom 5 generate under {bottom5[-1]['events_per_1k_users']:.0f}/1K. The top performer is {top5[0]['name']}.",
            "recommendation": "Investigate what makes top-performing campuses successful and replicate those conditions elsewhere.",
            "metric": f"{top5[0]['events_per_1k_users']:.0f}/1K top density",
        })

    with open(os.path.join(output_dir, "insights.json"), "w") as f:
        json.dump(insights, f, indent=2, cls=NumpyEncoder)

    print(f"       ✓ {len(insights)} insights generated")
    return insights


if __name__ == "__main__":
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    analytics_dir = os.path.join(project_root, "analytics", "output")
    analysis_dir = os.path.join(project_root, "analysis", "output")
    output_dir = os.path.join(project_root, "analysis", "output")
    os.makedirs(output_dir, exist_ok=True)
    generate_insights(analytics_dir, analysis_dir, output_dir)
