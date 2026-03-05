"""
Attendance data generation.
Simulates actual attendance based on RSVP status.
"""

import numpy as np
import pandas as pd


# Show-up rates by RSVP status
_ATTENDANCE_RATES = {
    "Yes": 0.85,
    "Maybe": 0.40,
    "No": 0.05,
    "No Response": 0.02,
}

# Event-type modifiers on attendance
_TYPE_ATTENDANCE_MOD = {
    "House Party": 1.05,
    "Club Event": 0.90,
    "Birthday": 1.15,
    "Networking": 0.80,
    "Study Group": 1.0,
    "Sports Watch": 0.95,
    "Cultural": 0.95,
    "Other": 0.90,
}


def generate_attendance(
    rsvps_df: pd.DataFrame,
    events_df: pd.DataFrame,
    seed: int = 42,
) -> pd.DataFrame:
    """
    Generate attendance records based on RSVP status.
    Show-up probability depends on RSVP status and event type.
    """
    rng = np.random.default_rng(seed=seed)

    # Create event type lookup
    event_types = events_df.set_index("event_id")["event_type"].to_dict()

    records = []

    for _, rsvp in rsvps_df.iterrows():
        event_id = rsvp["event_id"]
        rsvp_status = rsvp["rsvp_status"]
        event_type = event_types.get(event_id, "Other")

        base_rate = _ATTENDANCE_RATES.get(rsvp_status, 0.02)
        type_mod = _TYPE_ATTENDANCE_MOD.get(event_type, 1.0)

        show_prob = min(base_rate * type_mod, 0.99)
        attended = rng.random() < show_prob

        records.append({
            "event_id": event_id,
            "user_id": rsvp["user_id"],
            "attended": attended,
        })

    return pd.DataFrame(records)
