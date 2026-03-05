"""
Cohort retention analysis.
Classic product analytics: track user activity by join cohort.
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


def compute_cohort_retention(data_dir: str, output_dir: str):
    """
    Compute cohort retention curves.
    - Overall retention by join week
    - Retention comparison: campus_public event users vs friends_only
    """
    users_df = pd.read_csv(os.path.join(data_dir, "users.csv"))
    events_df = pd.read_csv(os.path.join(data_dir, "events.csv"))
    attendance_df = pd.read_csv(os.path.join(data_dir, "attendance.csv"))

    # Join events to attendance
    attended = attendance_df[attendance_df["attended"]].merge(
        events_df[["event_id", "event_week", "visibility_scope"]], on="event_id"
    )

    # --- Overall cohort retention ---
    # Group cohorts into 4-week buckets for cleaner visualization
    users_df["cohort_bucket"] = (users_df["join_week"] // 4) * 4

    user_cohort = users_df[["user_id", "join_week", "cohort_bucket"]].copy()
    activity = attended.merge(user_cohort, on="user_id")
    activity["weeks_since_join"] = activity["event_week"] - activity["join_week"]
    activity = activity[activity["weeks_since_join"] >= 0]

    # Cohort sizes
    cohort_sizes = user_cohort.groupby("cohort_bucket")["user_id"].nunique()

    # Active users per cohort per retention week
    retention_data = []
    for cohort_bucket, cohort_size in cohort_sizes.items():
        cohort_activity = activity[activity["cohort_bucket"] == cohort_bucket]
        for week_offset in range(0, 13):  # 0 to 12 weeks retention
            active = cohort_activity[
                cohort_activity["weeks_since_join"] == week_offset
            ]["user_id"].nunique()
            retention_data.append({
                "cohort_bucket": int(cohort_bucket),
                "weeks_since_join": week_offset,
                "active_users": int(active),
                "cohort_size": int(cohort_size),
                "retention_pct": round(active * 100.0 / cohort_size, 2) if cohort_size > 0 else 0,
            })

    with open(os.path.join(output_dir, "cohort_retention_curves.json"), "w") as f:
        json.dump(retention_data, f, indent=2, cls=NumpyEncoder)

    # --- Average retention curve (across all cohorts with enough data) ---
    retention_df = pd.DataFrame(retention_data)
    # Only include cohorts with at least 8 weeks of possible data (joined before week 44)
    valid_cohorts = retention_df[retention_df["cohort_bucket"] <= 40]
    avg_retention = valid_cohorts.groupby("weeks_since_join").agg(
        avg_retention_pct=("retention_pct", "mean"),
        median_retention_pct=("retention_pct", "median"),
        count=("cohort_bucket", "nunique"),
    ).reset_index()

    with open(os.path.join(output_dir, "avg_retention_curve.json"), "w") as f:
        json.dump(avg_retention.to_dict(orient="records"), f, indent=2, cls=NumpyEncoder)

    # --- Retention by visibility exposure ---
    # Users whose first event was campus_public vs friends_only
    first_events = attended.sort_values("event_week").groupby("user_id").first().reset_index()
    first_events = first_events[["user_id", "visibility_scope"]].rename(
        columns={"visibility_scope": "first_event_visibility"}
    )

    activity_with_vis = activity.merge(first_events, on="user_id", how="left")

    vis_retention = []
    for vis_scope in ["campus_public", "friends_only"]:
        scope_data = activity_with_vis[activity_with_vis["first_event_visibility"] == vis_scope]
        scope_users = first_events[first_events["first_event_visibility"] == vis_scope]["user_id"].nunique()

        for week_offset in range(0, 13):
            active = scope_data[scope_data["weeks_since_join"] == week_offset]["user_id"].nunique()
            vis_retention.append({
                "visibility_scope": vis_scope,
                "weeks_since_join": week_offset,
                "active_users": int(active),
                "total_users": int(scope_users),
                "retention_pct": round(active * 100.0 / scope_users, 2) if scope_users > 0 else 0,
            })

    with open(os.path.join(output_dir, "visibility_retention_comparison.json"), "w") as f:
        json.dump(vis_retention, f, indent=2, cls=NumpyEncoder)

    print("       ✓ Cohort retention curves computed")
    print("       ✓ Visibility retention comparison computed")


if __name__ == "__main__":
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(project_root, "data", "output")
    output_dir = os.path.join(project_root, "analysis", "output")
    os.makedirs(output_dir, exist_ok=True)
    compute_cohort_retention(data_dir, output_dir)
