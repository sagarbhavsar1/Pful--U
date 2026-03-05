"""
Seasonality analysis.
Time-series decomposition and seasonal pattern identification.
"""

import os
import json
import numpy as np
import pandas as pd
from statsmodels.tsa.seasonal import seasonal_decompose


class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (np.integer,)):
            return int(obj)
        if isinstance(obj, (np.floating,)):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if pd.isna(obj):
            return None
        return super().default(obj)


def analyze_seasonality(data_dir: str, output_dir: str):
    """
    Decompose weekly event volume into trend, seasonal, and residual components.
    Also identify anomalous weeks.
    """
    events_df = pd.read_csv(os.path.join(data_dir, "events.csv"))

    # Weekly event counts
    weekly = events_df.groupby("event_week").size().reset_index(name="events")
    weekly = weekly.set_index("event_week").reindex(range(52), fill_value=0)
    weekly.index.name = "event_week"

    # Time-series decomposition
    # Use additive model since the data is simulated with multiplicative seasonality
    # but additive is more interpretable
    ts = weekly["events"].values.astype(float)

    # Pad to handle edges
    decomposition = seasonal_decompose(ts, model="additive", period=13, extrapolate_trend="freq")

    decomp_data = []
    for week in range(52):
        decomp_data.append({
            "week": week,
            "observed": float(ts[week]),
            "trend": float(decomposition.trend[week]) if not np.isnan(decomposition.trend[week]) else None,
            "seasonal": float(decomposition.seasonal[week]),
            "residual": float(decomposition.resid[week]) if not np.isnan(decomposition.resid[week]) else None,
        })

    with open(os.path.join(output_dir, "seasonality_decomposition.json"), "w") as f:
        json.dump(decomp_data, f, indent=2, cls=NumpyEncoder)

    # Identify anomalous weeks (residual > 2 std devs)
    residuals = np.array([d["residual"] for d in decomp_data if d["residual"] is not None])
    resid_std = np.std(residuals)
    resid_mean = np.mean(residuals)

    anomalies = []
    for d in decomp_data:
        if d["residual"] is not None and abs(d["residual"] - resid_mean) > 2 * resid_std:
            anomalies.append({
                "week": d["week"],
                "observed": d["observed"],
                "expected": round(d["trend"] + d["seasonal"], 1) if d["trend"] else None,
                "residual": round(d["residual"], 1),
                "direction": "above" if d["residual"] > 0 else "below",
            })

    with open(os.path.join(output_dir, "seasonal_anomalies.json"), "w") as f:
        json.dump(anomalies, f, indent=2, cls=NumpyEncoder)

    # Weekly engagement pattern
    rsvps_df = pd.read_csv(os.path.join(data_dir, "rsvps.csv"))
    attendance_df = pd.read_csv(os.path.join(data_dir, "attendance.csv"))

    event_rsvps = rsvps_df.merge(
        events_df[["event_id", "event_week"]], on="event_id"
    )
    weekly_rsvp_rate = event_rsvps.groupby("event_week").apply(
        lambda g: (g["rsvp_status"] == "Yes").sum() / len(g) * 100
    ).reset_index(name="yes_rate")

    event_attend = attendance_df.merge(
        events_df[["event_id", "event_week"]], on="event_id"
    )
    weekly_attend_rate = event_attend.groupby("event_week").apply(
        lambda g: g["attended"].sum() / len(g) * 100
    ).reset_index(name="attendance_rate")

    weekly_engagement = weekly_rsvp_rate.merge(weekly_attend_rate, on="event_week", how="outer")
    weekly_engagement = weekly_engagement.sort_values("event_week")

    with open(os.path.join(output_dir, "weekly_engagement.json"), "w") as f:
        json.dump(weekly_engagement.to_dict(orient="records"), f, indent=2, cls=NumpyEncoder)

    print("       ✓ Seasonality decomposition computed")
    print(f"       ✓ {len(anomalies)} anomalous weeks identified")
    print("       ✓ Weekly engagement patterns computed")


if __name__ == "__main__":
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(project_root, "data", "output")
    output_dir = os.path.join(project_root, "analysis", "output")
    os.makedirs(output_dir, exist_ok=True)
    analyze_seasonality(data_dir, output_dir)
