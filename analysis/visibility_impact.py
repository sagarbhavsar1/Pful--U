"""
Visibility impact analysis.
Evaluates the effect of campus_public vs friends_only visibility on key metrics.
"""

import os
import json
import numpy as np
import pandas as pd
from scipy import stats


class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (np.bool_,)):
            return bool(obj)
        if isinstance(obj, (np.integer,)):
            return int(obj)
        if isinstance(obj, (np.floating,)):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super().default(obj)


def analyze_visibility_impact(data_dir: str, output_dir: str):
    """
    Compare campus_public vs friends_only across multiple metrics.
    This is the core evaluation of the Partiful U feature hypothesis.
    """
    events_df = pd.read_csv(os.path.join(data_dir, "events.csv"))
    rsvps_df = pd.read_csv(os.path.join(data_dir, "rsvps.csv"))
    attendance_df = pd.read_csv(os.path.join(data_dir, "attendance.csv"))

    # Merge everything
    event_data = events_df.merge(rsvps_df, on="event_id", how="left", suffixes=("", "_rsvp"))
    event_data = event_data.merge(attendance_df, on=["event_id", "user_id"], how="left")

    # --- Metric 1: RSVP positive rate (Yes + Maybe) ---
    rsvp_by_event = event_data.groupby(["event_id", "visibility_scope"]).agg(
        total_rsvps=("rsvp_status", "count"),
        positive_rsvps=("rsvp_status", lambda x: ((x == "Yes") | (x == "Maybe")).sum()),
        yes_rsvps=("rsvp_status", lambda x: (x == "Yes").sum()),
    ).reset_index()
    rsvp_by_event["positive_rate"] = rsvp_by_event["positive_rsvps"] / rsvp_by_event["total_rsvps"]
    rsvp_by_event["yes_rate"] = rsvp_by_event["yes_rsvps"] / rsvp_by_event["total_rsvps"]

    campus_rsvp = rsvp_by_event[rsvp_by_event["visibility_scope"] == "campus_public"]["positive_rate"]
    friends_rsvp = rsvp_by_event[rsvp_by_event["visibility_scope"] == "friends_only"]["positive_rate"]

    rsvp_ttest = stats.ttest_ind(campus_rsvp, friends_rsvp, alternative="greater")

    # --- Metric 2: Attendance rate ---
    attend_by_event = event_data.groupby(["event_id", "visibility_scope"]).agg(
        total=("attended", "count"),
        attended=("attended", "sum"),
    ).reset_index()
    attend_by_event["attendance_rate"] = attend_by_event["attended"] / attend_by_event["total"]

    campus_attend = attend_by_event[attend_by_event["visibility_scope"] == "campus_public"]["attendance_rate"]
    friends_attend = attend_by_event[attend_by_event["visibility_scope"] == "friends_only"]["attendance_rate"]

    attend_ttest = stats.ttest_ind(campus_attend, friends_attend, alternative="greater")

    # --- Metric 3: Average event size (invites) ---
    campus_events = events_df[events_df["visibility_scope"] == "campus_public"]
    friends_events = events_df[events_df["visibility_scope"] == "friends_only"]

    # --- Metric 4: Cross-group discovery (unique attendees not in host's prior events) ---
    # Simplified: count distinct attendees per event
    attendees_per_event = attendance_df[attendance_df["attended"]].groupby("event_id")["user_id"].nunique()
    events_with_attendees = events_df[["event_id", "visibility_scope"]].merge(
        attendees_per_event.reset_index().rename(columns={"user_id": "unique_attendees"}),
        on="event_id", how="left"
    ).fillna(0)

    campus_attendees = events_with_attendees[events_with_attendees["visibility_scope"] == "campus_public"]["unique_attendees"]
    friends_attendees = events_with_attendees[events_with_attendees["visibility_scope"] == "friends_only"]["unique_attendees"]

    # Build summary
    impact_summary = {
        "rsvp_positive_rate": {
            "campus_public": round(campus_rsvp.mean() * 100, 2),
            "friends_only": round(friends_rsvp.mean() * 100, 2),
            "lift_pct": round((campus_rsvp.mean() - friends_rsvp.mean()) / friends_rsvp.mean() * 100, 2),
            "p_value": round(rsvp_ttest.pvalue, 6),
            "significant": rsvp_ttest.pvalue < 0.05,
            "ci_95_lower": round((campus_rsvp.mean() - friends_rsvp.mean() - 1.96 * np.sqrt(
                campus_rsvp.var()/len(campus_rsvp) + friends_rsvp.var()/len(friends_rsvp)
            )) * 100, 2),
            "ci_95_upper": round((campus_rsvp.mean() - friends_rsvp.mean() + 1.96 * np.sqrt(
                campus_rsvp.var()/len(campus_rsvp) + friends_rsvp.var()/len(friends_rsvp)
            )) * 100, 2),
        },
        "attendance_rate": {
            "campus_public": round(campus_attend.mean() * 100, 2),
            "friends_only": round(friends_attend.mean() * 100, 2),
            "lift_pct": round((campus_attend.mean() - friends_attend.mean()) / friends_attend.mean() * 100, 2),
            "p_value": round(attend_ttest.pvalue, 6),
            "significant": attend_ttest.pvalue < 0.05,
        },
        "avg_event_size": {
            "campus_public": round(campus_events["invite_count"].mean(), 1),
            "friends_only": round(friends_events["invite_count"].mean(), 1),
            "lift_pct": round(
                (campus_events["invite_count"].mean() - friends_events["invite_count"].mean())
                / friends_events["invite_count"].mean() * 100, 2
            ),
        },
        "unique_attendees": {
            "campus_public": round(campus_attendees.mean(), 1),
            "friends_only": round(friends_attendees.mean(), 1),
            "lift_pct": round(
                (campus_attendees.mean() - friends_attendees.mean())
                / max(friends_attendees.mean(), 0.01) * 100, 2
            ),
        },
        "sample_sizes": {
            "campus_public_events": len(campus_events),
            "friends_only_events": len(friends_events),
        },
    }

    with open(os.path.join(output_dir, "visibility_impact.json"), "w") as f:
        json.dump(impact_summary, f, indent=2, cls=NumpyEncoder)

    # --- Visibility impact by event type ---
    impact_by_type = []
    for event_type in events_df["event_type"].unique():
        type_events = rsvp_by_event.merge(events_df[["event_id", "event_type"]], on="event_id")
        type_data = type_events[type_events["event_type"] == event_type]

        campus_rate = type_data[type_data["visibility_scope"] == "campus_public"]["positive_rate"]
        friends_rate = type_data[type_data["visibility_scope"] == "friends_only"]["positive_rate"]

        if len(campus_rate) > 0 and len(friends_rate) > 0:
            impact_by_type.append({
                "event_type": event_type,
                "campus_public_rate": round(campus_rate.mean() * 100, 2),
                "friends_only_rate": round(friends_rate.mean() * 100, 2),
                "lift_pct": round((campus_rate.mean() - friends_rate.mean()) / max(friends_rate.mean(), 0.001) * 100, 2),
                "campus_public_n": len(campus_rate),
                "friends_only_n": len(friends_rate),
            })

    with open(os.path.join(output_dir, "visibility_impact_by_type.json"), "w") as f:
        json.dump(impact_by_type, f, indent=2, cls=NumpyEncoder)

    print("       ✓ Visibility impact analysis complete")
    print(f"       ✓ RSVP lift: {impact_summary['rsvp_positive_rate']['lift_pct']}% (p={impact_summary['rsvp_positive_rate']['p_value']})")
    print(f"       ✓ Attendance lift: {impact_summary['attendance_rate']['lift_pct']}%")


if __name__ == "__main__":
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(project_root, "data", "output")
    output_dir = os.path.join(project_root, "analysis", "output")
    os.makedirs(output_dir, exist_ok=True)
    analyze_visibility_impact(data_dir, output_dir)
