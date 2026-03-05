"""
University and user clustering analysis.
K-Means clustering to identify behavioral archetypes.
"""

import os
import json
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler


class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (np.integer,)):
            return int(obj)
        if isinstance(obj, (np.floating,)):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super().default(obj)


def cluster_universities(uni_perf_path: str, output_dir: str):
    """
    Cluster universities into behavioral profiles using K-Means.

    Features: events_per_1k_users, rsvp_yes_rate, attendance_rate,
              host_repeat_rate, avg_friend_count, adoption_rate
    """
    with open(uni_perf_path) as f:
        uni_data = json.load(f)

    df = pd.DataFrame(uni_data)

    features = [
        "events_per_1k_users", "rsvp_yes_rate", "attendance_rate",
        "host_repeat_rate", "avg_friend_count", "adoption_rate",
    ]

    # Fill any NaN with 0
    for col in features:
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    X = df[features].values

    # Standardize
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # K-Means with k=5
    km = KMeans(n_clusters=5, random_state=42, n_init=10)
    df["cluster"] = km.fit_predict(X_scaled)

    # Name clusters based on centroid characteristics
    centroids = pd.DataFrame(
        scaler.inverse_transform(km.cluster_centers_),
        columns=features,
    )

    cluster_names = []
    for i, row in centroids.iterrows():
        if row["events_per_1k_users"] > centroids["events_per_1k_users"].median() * 1.3:
            if row["host_repeat_rate"] > centroids["host_repeat_rate"].median():
                name = "High-Growth Hub"
            else:
                name = "Event-Heavy, Low Retention"
        elif row["adoption_rate"] > centroids["adoption_rate"].median() * 1.2:
            name = "High-Adoption, Engaged"
        elif row["attendance_rate"] > centroids["attendance_rate"].median() * 1.1:
            name = "Steady & Reliable"
        else:
            if row["events_per_1k_users"] < centroids["events_per_1k_users"].median() * 0.7:
                name = "Underperforming"
            else:
                name = "Average Performer"
        cluster_names.append(name)

    # Ensure unique names
    seen = {}
    for i, name in enumerate(cluster_names):
        if name in seen:
            cluster_names[i] = f"{name} ({i+1})"
        seen[name] = True

    cluster_map = {i: name for i, name in enumerate(cluster_names)}
    df["cluster_name"] = df["cluster"].map(cluster_map)

    # Build output
    cluster_profiles = []
    for cluster_id in sorted(df["cluster"].unique()):
        subset = df[df["cluster"] == cluster_id]
        profile = {
            "cluster_id": int(cluster_id),
            "cluster_name": cluster_map[cluster_id],
            "count": len(subset),
            "avg_events_per_1k": round(subset["events_per_1k_users"].mean(), 1),
            "avg_rsvp_rate": round(subset["rsvp_yes_rate"].mean(), 1),
            "avg_attendance_rate": round(subset["attendance_rate"].mean(), 1),
            "avg_host_repeat_rate": round(subset["host_repeat_rate"].mean(), 1),
            "avg_adoption_rate": round(subset["adoption_rate"].mean(), 4),
            "universities": subset[["university_id", "name", "region", "type", "setting",
                                     "total_users", "total_events"]].to_dict(orient="records"),
        }
        cluster_profiles.append(profile)

    with open(os.path.join(output_dir, "university_clusters.json"), "w") as f:
        json.dump(cluster_profiles, f, indent=2, cls=NumpyEncoder)

    # Also save per-university cluster assignment
    uni_clusters = df[["university_id", "name", "cluster", "cluster_name"]].to_dict(orient="records")
    with open(os.path.join(output_dir, "university_cluster_assignments.json"), "w") as f:
        json.dump(uni_clusters, f, indent=2, cls=NumpyEncoder)

    print(f"       ✓ {len(cluster_profiles)} university clusters identified")
    return cluster_profiles


def cluster_users(data_dir: str, output_dir: str):
    """
    Cluster users into engagement segments using K-Means.

    Features: events_attended, events_hosted, friend_count, rsvp_yes_rate
    """
    users_df = pd.read_csv(os.path.join(data_dir, "users.csv"))
    events_df = pd.read_csv(os.path.join(data_dir, "events.csv"))
    rsvps_df = pd.read_csv(os.path.join(data_dir, "rsvps.csv"))
    attendance_df = pd.read_csv(os.path.join(data_dir, "attendance.csv"))

    # Compute per-user features
    events_hosted = events_df.groupby("host_id").size().rename("events_hosted")
    events_attended = attendance_df[attendance_df["attended"]].groupby("user_id").size().rename("events_attended")

    rsvp_by_user = rsvps_df.groupby("user_id").apply(
        lambda g: (g["rsvp_status"] == "Yes").sum() / len(g) if len(g) > 0 else 0
    ).rename("rsvp_yes_rate")

    user_features = users_df[["user_id", "friend_count"]].set_index("user_id")
    user_features = user_features.join(events_hosted, how="left")
    user_features = user_features.join(events_attended, how="left")
    user_features = user_features.join(rsvp_by_user, how="left")
    user_features = user_features.fillna(0)

    features = ["friend_count", "events_hosted", "events_attended", "rsvp_yes_rate"]
    X = user_features[features].values

    # Sample for clustering (full dataset too large)
    sample_size = min(20000, len(X))
    rng = np.random.default_rng(42)
    sample_idx = rng.choice(len(X), size=sample_size, replace=False)
    X_sample = X[sample_idx]

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_sample)

    km = KMeans(n_clusters=4, random_state=42, n_init=10)
    sample_labels = km.fit_predict(X_scaled)

    # Predict for all users
    X_all_scaled = scaler.transform(X)
    all_labels = km.predict(X_all_scaled)
    user_features["cluster"] = all_labels

    # Name clusters
    centroids = pd.DataFrame(
        scaler.inverse_transform(km.cluster_centers_),
        columns=features,
    )

    segment_names = {}
    for i, row in centroids.iterrows():
        hosted = row["events_hosted"]
        attended = row["events_attended"]
        friends = row["friend_count"]

        if hosted > centroids["events_hosted"].median() * 1.5:
            segment_names[i] = "Power Hosts"
        elif attended > centroids["events_attended"].median() * 1.5 and friends > centroids["friend_count"].median():
            segment_names[i] = "Social Butterflies"
        elif attended > 0 or row["rsvp_yes_rate"] > 0:
            segment_names[i] = "Casual Attendees"
        else:
            segment_names[i] = "Lurkers"

    # Ensure unique names
    seen = set()
    for k in list(segment_names.keys()):
        if segment_names[k] in seen:
            segment_names[k] = f"{segment_names[k]} ({k+1})"
        seen.add(segment_names[k])

    user_features["segment_name"] = user_features["cluster"].map(segment_names)

    # Build segment profiles
    segment_profiles = []
    for seg_id in sorted(user_features["cluster"].unique()):
        subset = user_features[user_features["cluster"] == seg_id]
        profile = {
            "segment_id": int(seg_id),
            "segment_name": segment_names[seg_id],
            "count": len(subset),
            "pct_of_users": round(len(subset) * 100.0 / len(user_features), 1),
            "avg_events_hosted": round(subset["events_hosted"].mean(), 2),
            "avg_events_attended": round(subset["events_attended"].mean(), 2),
            "avg_friend_count": round(subset["friend_count"].mean(), 1),
            "avg_rsvp_yes_rate": round(subset["rsvp_yes_rate"].mean(), 3),
        }
        segment_profiles.append(profile)

    with open(os.path.join(output_dir, "user_segments.json"), "w") as f:
        json.dump(segment_profiles, f, indent=2, cls=NumpyEncoder)

    print(f"       ✓ {len(segment_profiles)} user segments identified")
    return segment_profiles


if __name__ == "__main__":
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(project_root, "data", "output")
    analytics_dir = os.path.join(project_root, "analytics", "output")
    output_dir = os.path.join(project_root, "analysis", "output")
    os.makedirs(output_dir, exist_ok=True)

    print("Running clustering analysis...")
    cluster_universities(
        os.path.join(analytics_dir, "university_performance.json"),
        output_dir,
    )
    cluster_users(data_dir, output_dir)
    print("Done!")
