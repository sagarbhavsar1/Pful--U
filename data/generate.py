"""
Main data generation orchestrator.
Generates all synthetic data tables and exports them as CSV and JSON.
"""

import os
import sys
import json
import time

import pandas as pd
import numpy as np

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from data.universities import generate_universities
from data.users import generate_users
from data.events import generate_events
from data.rsvps import generate_rsvps
from data.attendance import generate_attendance


def main():
    output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output")
    os.makedirs(output_dir, exist_ok=True)

    print("=" * 60)
    print("PARTIFUL U — Synthetic Data Generation Pipeline")
    print("=" * 60)

    # Step 1: Universities
    print("\n[1/5] Generating 250 universities...")
    t0 = time.time()
    universities = generate_universities(n=250)
    print(f"       ✓ {len(universities)} universities in {time.time()-t0:.1f}s")
    print(f"       Size range: {universities['student_population'].min():,} – {universities['student_population'].max():,}")
    print(f"       Adoption: {universities['adoption_rate'].mean():.1%} mean")

    # Step 2: Users
    print("\n[2/5] Generating users...")
    t0 = time.time()
    users = generate_users(universities)
    print(f"       ✓ {len(users):,} users in {time.time()-t0:.1f}s")
    print(f"       Friends: {users['friend_count'].median():.0f} median, {users['friend_count'].max():,} max")

    # Step 3: Events
    print("\n[3/5] Generating events...")
    t0 = time.time()
    events = generate_events(universities, users)
    print(f"       ✓ {len(events):,} events in {time.time()-t0:.1f}s")
    visibility_counts = events['visibility_scope'].value_counts()
    print(f"       Visibility: {visibility_counts.get('friends_only', 0):,} friends-only, {visibility_counts.get('campus_public', 0):,} campus-public")

    # Step 4: RSVPs
    print("\n[4/5] Generating RSVPs...")
    t0 = time.time()
    rsvps = generate_rsvps(events, users)
    print(f"       ✓ {len(rsvps):,} RSVPs in {time.time()-t0:.1f}s")
    status_counts = rsvps['rsvp_status'].value_counts()
    print(f"       Status dist: {dict(status_counts)}")

    # Step 5: Attendance
    print("\n[5/5] Generating attendance...")
    t0 = time.time()
    attendance = generate_attendance(rsvps, events)
    attended_count = attendance['attended'].sum()
    print(f"       ✓ {len(attendance):,} records in {time.time()-t0:.1f}s")
    print(f"       Attendance rate: {attended_count/len(attendance):.1%}")

    # Export CSV
    print("\n--- Exporting CSV ---")
    universities.to_csv(os.path.join(output_dir, "universities.csv"), index=False)
    users.to_csv(os.path.join(output_dir, "users.csv"), index=False)
    events.to_csv(os.path.join(output_dir, "events.csv"), index=False)
    rsvps.to_csv(os.path.join(output_dir, "rsvps.csv"), index=False)
    attendance.to_csv(os.path.join(output_dir, "attendance.csv"), index=False)
    print("       ✓ CSVs written to data/output/")

    # Export JSON summary stats for quick dashboard loading
    print("\n--- Exporting summary stats ---")
    summary = {
        "total_universities": len(universities),
        "total_users": len(users),
        "total_events": len(events),
        "total_rsvps": len(rsvps),
        "total_attendance_records": len(attendance),
        "attendance_rate": round(attended_count / len(attendance), 4),
        "campus_public_events": int(visibility_counts.get("campus_public", 0)),
        "friends_only_events": int(visibility_counts.get("friends_only", 0)),
        "median_friend_count": int(users["friend_count"].median()),
        "avg_uni_adoption_rate": round(universities["adoption_rate"].mean(), 4),
    }
    with open(os.path.join(output_dir, "summary.json"), "w") as f:
        json.dump(summary, f, indent=2)
    print("       ✓ summary.json written")

    print("\n" + "=" * 60)
    print("Data generation complete!")
    print("=" * 60)

    return universities, users, events, rsvps, attendance


if __name__ == "__main__":
    main()
