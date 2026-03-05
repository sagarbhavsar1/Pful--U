"""
DuckDB analytics query runner.
Loads CSV data, runs SQL KPI queries, and exports results as JSON for the dashboard.
"""

import os
import json
import duckdb
import pandas as pd
import numpy as np


class NumpyEncoder(json.JSONEncoder):
    """JSON encoder that handles numpy types."""
    def default(self, obj):
        if isinstance(obj, (np.integer,)):
            return int(obj)
        if isinstance(obj, (np.floating,)):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if isinstance(obj, pd.Timestamp):
            return obj.isoformat()
        return super().default(obj)


def _save_json(data, filepath):
    """Save data as JSON with numpy type handling."""
    with open(filepath, "w") as f:
        json.dump(data, f, indent=2, cls=NumpyEncoder, default=str)


def run_analytics():
    """Load data into DuckDB, run KPI queries, export JSON for dashboard."""
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(project_root, "data", "output")
    output_dir = os.path.join(project_root, "analytics", "output")
    os.makedirs(output_dir, exist_ok=True)

    print("=" * 60)
    print("PARTIFUL U — Analytics Pipeline (DuckDB)")
    print("=" * 60)

    # Connect to in-memory DuckDB
    con = duckdb.connect()

    # Load CSVs
    print("\n[1/8] Loading data into DuckDB...")
    con.execute(f"CREATE TABLE universities AS SELECT * FROM read_csv_auto('{data_dir}/universities.csv')")
    con.execute(f"CREATE TABLE users AS SELECT * FROM read_csv_auto('{data_dir}/users.csv')")
    con.execute(f"CREATE TABLE events AS SELECT * FROM read_csv_auto('{data_dir}/events.csv')")
    con.execute(f"CREATE TABLE rsvps AS SELECT * FROM read_csv_auto('{data_dir}/rsvps.csv')")
    con.execute(f"CREATE TABLE attendance AS SELECT * FROM read_csv_auto('{data_dir}/attendance.csv')")
    print("       ✓ All tables loaded")

    # --- KPI 1: Weekly event volume (overall) ---
    print("\n[2/8] Computing weekly event volume...")
    weekly_events = con.execute("""
        SELECT
            event_week,
            COUNT(*) AS events,
            COUNT(CASE WHEN visibility_scope = 'campus_public' THEN 1 END) AS campus_public_events,
            COUNT(CASE WHEN visibility_scope = 'friends_only' THEN 1 END) AS friends_only_events
        FROM events
        GROUP BY event_week
        ORDER BY event_week
    """).fetchdf()
    _save_json(weekly_events.to_dict(orient="records"), os.path.join(output_dir, "weekly_events.json"))
    print("       ✓ weekly_events.json")

    # --- KPI 2: Weekly new users (overall) ---
    print("\n[3/8] Computing weekly new users...")
    weekly_users = con.execute("""
        SELECT
            join_week,
            COUNT(*) AS new_users,
            SUM(COUNT(*)) OVER (ORDER BY join_week ROWS UNBOUNDED PRECEDING) AS cumulative_users
        FROM users
        GROUP BY join_week
        ORDER BY join_week
    """).fetchdf()
    _save_json(weekly_users.to_dict(orient="records"), os.path.join(output_dir, "weekly_users.json"))
    print("       ✓ weekly_users.json")

    # --- KPI 3: RSVP conversion by visibility scope ---
    print("\n[4/8] Computing RSVP conversion by visibility scope...")
    visibility_rsvp = con.execute("""
        SELECT
            ev.visibility_scope,
            COUNT(*) AS total_rsvps,
            COUNT(CASE WHEN r.rsvp_status = 'Yes' THEN 1 END) AS yes_count,
            COUNT(CASE WHEN r.rsvp_status IN ('Yes', 'Maybe') THEN 1 END) AS positive_count,
            ROUND(COUNT(CASE WHEN r.rsvp_status = 'Yes' THEN 1 END) * 100.0 / COUNT(*), 2) AS yes_rate,
            ROUND(COUNT(CASE WHEN r.rsvp_status IN ('Yes', 'Maybe') THEN 1 END) * 100.0 / COUNT(*), 2) AS positive_rate
        FROM rsvps r
        JOIN events ev ON r.event_id = ev.event_id
        GROUP BY ev.visibility_scope
    """).fetchdf()
    _save_json(visibility_rsvp.to_dict(orient="records"), os.path.join(output_dir, "visibility_rsvp.json"))
    print("       ✓ visibility_rsvp.json")

    # --- KPI 4: Visibility impact on attendance ---
    print("\n[5/8] Computing attendance by visibility scope...")
    visibility_attendance = con.execute("""
        SELECT
            ev.visibility_scope,
            COUNT(*) AS total_records,
            COUNT(CASE WHEN a.attended THEN 1 END) AS attended_count,
            ROUND(COUNT(CASE WHEN a.attended THEN 1 END) * 100.0 / COUNT(*), 2) AS attendance_rate
        FROM attendance a
        JOIN events ev ON a.event_id = ev.event_id
        GROUP BY ev.visibility_scope
    """).fetchdf()
    _save_json(visibility_attendance.to_dict(orient="records"), os.path.join(output_dir, "visibility_attendance.json"))
    print("       ✓ visibility_attendance.json")

    # --- KPI 5: University performance summary ---
    print("\n[6/8] Computing university performance summary...")
    uni_performance = con.execute("""
        WITH uni_events AS (
            SELECT university_id, COUNT(*) AS total_events,
                   COUNT(DISTINCT host_id) AS unique_hosts,
                   AVG(invite_count) AS avg_invites
            FROM events GROUP BY university_id
        ),
        uni_users AS (
            SELECT university_id, COUNT(*) AS total_users,
                   AVG(friend_count) AS avg_friends
            FROM users GROUP BY university_id
        ),
        uni_rsvps AS (
            SELECT ev.university_id,
                   COUNT(CASE WHEN r.rsvp_status = 'Yes' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0) AS rsvp_yes_rate
            FROM rsvps r
            JOIN events ev ON r.event_id = ev.event_id
            GROUP BY ev.university_id
        ),
        uni_attendance AS (
            SELECT ev.university_id,
                   COUNT(CASE WHEN a.attended THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0) AS attendance_rate
            FROM attendance a
            JOIN events ev ON a.event_id = ev.event_id
            GROUP BY ev.university_id
        ),
        uni_retention AS (
            SELECT
                e1.university_id,
                COUNT(DISTINCT e1.host_id) AS total_hosts,
                COUNT(DISTINCT CASE
                    WHEN e2.host_id IS NOT NULL THEN e1.host_id
                END) AS repeat_hosts
            FROM events e1
            LEFT JOIN events e2
                ON e1.host_id = e2.host_id
                AND e1.event_id != e2.event_id
                AND e2.event_date BETWEEN e1.event_date AND e1.event_date + INTERVAL '30 days'
            GROUP BY e1.university_id
        )
        SELECT
            u.university_id,
            u.name,
            u.student_population,
            u.region,
            u.type,
            u.setting,
            u.adoption_rate,
            COALESCE(uu.total_users, 0) AS total_users,
            COALESCE(ue.total_events, 0) AS total_events,
            COALESCE(ue.unique_hosts, 0) AS unique_hosts,
            ROUND(COALESCE(ue.avg_invites, 0), 1) AS avg_invites,
            ROUND(COALESCE(ur.rsvp_yes_rate, 0), 2) AS rsvp_yes_rate,
            ROUND(COALESCE(ua.attendance_rate, 0), 2) AS attendance_rate,
            ROUND(COALESCE(urt.repeat_hosts * 100.0 / NULLIF(urt.total_hosts, 0), 0), 2) AS host_repeat_rate,
            ROUND(COALESCE(ue.total_events * 1000.0 / NULLIF(uu.total_users, 0), 0), 2) AS events_per_1k_users,
            ROUND(COALESCE(uu.avg_friends, 0), 1) AS avg_friend_count
        FROM universities u
        LEFT JOIN uni_users uu ON u.university_id = uu.university_id
        LEFT JOIN uni_events ue ON u.university_id = ue.university_id
        LEFT JOIN uni_rsvps ur ON u.university_id = ur.university_id
        LEFT JOIN uni_attendance ua ON u.university_id = ua.university_id
        LEFT JOIN uni_retention urt ON u.university_id = urt.university_id
        ORDER BY total_events DESC
    """).fetchdf()
    _save_json(uni_performance.to_dict(orient="records"), os.path.join(output_dir, "university_performance.json"))
    print("       ✓ university_performance.json")

    # --- KPI 6: Cohort retention (simplified: join week → active week) ---
    print("\n[7/8] Computing cohort retention...")
    cohort_retention = con.execute("""
        WITH user_activity AS (
            SELECT DISTINCT
                u.user_id,
                u.join_week,
                ev.event_week AS active_week
            FROM users u
            JOIN attendance a ON u.user_id = a.user_id AND a.attended = true
            JOIN events ev ON a.event_id = ev.event_id
            WHERE ev.event_week >= u.join_week
        ),
        cohort_sizes AS (
            SELECT join_week, COUNT(DISTINCT user_id) AS cohort_size
            FROM users
            GROUP BY join_week
        )
        SELECT
            ua.join_week AS cohort_week,
            (ua.active_week - ua.join_week) AS weeks_since_join,
            COUNT(DISTINCT ua.user_id) AS active_users,
            cs.cohort_size,
            ROUND(COUNT(DISTINCT ua.user_id) * 100.0 / cs.cohort_size, 2) AS retention_pct
        FROM user_activity ua
        JOIN cohort_sizes cs ON ua.join_week = cs.join_week
        WHERE (ua.active_week - ua.join_week) BETWEEN 0 AND 12
        GROUP BY ua.join_week, ua.active_week - ua.join_week, cs.cohort_size
        ORDER BY ua.join_week, weeks_since_join
    """).fetchdf()
    _save_json(cohort_retention.to_dict(orient="records"), os.path.join(output_dir, "cohort_retention.json"))
    print("       ✓ cohort_retention.json")

    # --- KPI 7: Event type breakdown ---
    print("\n[8/8] Computing event type breakdown...")
    event_types = con.execute("""
        SELECT
            ev.event_type,
            COUNT(*) AS event_count,
            AVG(ev.invite_count) AS avg_invites,
            COUNT(CASE WHEN r.rsvp_status = 'Yes' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0) AS yes_rate,
            COUNT(CASE WHEN a.attended THEN 1 END) * 100.0 / NULLIF(COUNT(a.event_id), 0) AS attendance_rate
        FROM events ev
        LEFT JOIN rsvps r ON ev.event_id = r.event_id
        LEFT JOIN attendance a ON ev.event_id = a.event_id AND r.user_id = a.user_id
        GROUP BY ev.event_type
        ORDER BY event_count DESC
    """).fetchdf()
    _save_json(event_types.to_dict(orient="records"), os.path.join(output_dir, "event_types.json"))
    print("       ✓ event_types.json")

    # --- Weekly RSVP and attendance by visibility ---
    weekly_visibility = con.execute("""
        SELECT
            ev.event_week,
            ev.visibility_scope,
            COUNT(DISTINCT ev.event_id) AS events,
            COUNT(r.user_id) AS total_rsvps,
            COUNT(CASE WHEN r.rsvp_status = 'Yes' THEN 1 END) AS yes_rsvps,
            ROUND(COUNT(CASE WHEN r.rsvp_status = 'Yes' THEN 1 END) * 100.0 / NULLIF(COUNT(r.user_id), 0), 2) AS yes_rate
        FROM events ev
        LEFT JOIN rsvps r ON ev.event_id = r.event_id
        GROUP BY ev.event_week, ev.visibility_scope
        ORDER BY ev.event_week, ev.visibility_scope
    """).fetchdf()
    _save_json(weekly_visibility.to_dict(orient="records"), os.path.join(output_dir, "weekly_visibility.json"))

    # --- University weekly heatmap data ---
    uni_weekly_heatmap = con.execute("""
        SELECT
            ev.university_id,
            u.name AS university_name,
            ev.event_week,
            COUNT(*) AS events
        FROM events ev
        JOIN universities u ON ev.university_id = u.university_id
        GROUP BY ev.university_id, u.name, ev.event_week
        ORDER BY ev.university_id, ev.event_week
    """).fetchdf()
    _save_json(uni_weekly_heatmap.to_dict(orient="records"), os.path.join(output_dir, "uni_weekly_heatmap.json"))

    con.close()

    print("\n" + "=" * 60)
    print("Analytics pipeline complete!")
    print("=" * 60)


if __name__ == "__main__":
    run_analytics()
