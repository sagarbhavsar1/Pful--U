"""
RSVP data generation.
Simulates RSVPs for each event with realistic response rates and timing.
"""

import numpy as np
import pandas as pd


# RSVP rate modifiers by event type
_TYPE_RSVP_MODIFIER = {
    "House Party": 1.1,
    "Club Event": 0.85,
    "Birthday": 1.25,
    "Networking": 0.75,
    "Study Group": 1.0,
    "Sports Watch": 0.95,
    "Cultural": 0.90,
    "Other": 0.90,
}


def generate_rsvps(
    events_df: pd.DataFrame,
    users_df: pd.DataFrame,
    seed: int = 42,
) -> pd.DataFrame:
    """
    Generate RSVPs. For each event, select a subset of eligible users as invitees,
    then assign RSVP status.

    Key design: campus_public events get a +15% boost in RSVP rate
    (the Partiful U effect).
    """
    rng = np.random.default_rng(seed=seed)

    # Pre-compute user lists per university
    users_by_uni = {}
    for uni_id, group in users_df.groupby("university_id"):
        users_by_uni[uni_id] = {
            "user_ids": group["user_id"].values,
            "join_weeks": group["join_week"].values,
        }

    records = []

    for _, event in events_df.iterrows():
        uni_id = event["university_id"]
        host_id = event["host_id"]
        event_week = event["event_week"]
        event_type = event["event_type"]
        visibility = event["visibility_scope"]
        invite_count = event["invite_count"]

        uni_data = users_by_uni.get(uni_id)
        if uni_data is None:
            continue

        # Get users who joined before this event
        eligible_mask = uni_data["join_weeks"] <= event_week
        eligible_ids = uni_data["user_ids"][eligible_mask]

        # Remove host from eligible invitees
        eligible_ids = eligible_ids[eligible_ids != host_id]

        if len(eligible_ids) == 0:
            continue

        # Select invitees
        n_invite = min(invite_count, len(eligible_ids))
        invitees = rng.choice(eligible_ids, size=n_invite, replace=False)

        # Base RSVP rate: ~60%
        base_rsvp_rate = 0.60

        # Modifiers
        type_mod = _TYPE_RSVP_MODIFIER.get(event_type, 1.0)

        # THE KEY EFFECT: campus_public visibility boosts RSVP
        visibility_mod = 1.15 if visibility == "campus_public" else 1.0

        effective_rate = min(base_rsvp_rate * type_mod * visibility_mod, 0.95)

        for user_id in invitees:
            will_rsvp = rng.random() < effective_rate

            if will_rsvp:
                # RSVP status distribution: Yes 55%, Maybe 25%, No 20%
                status = rng.choice(
                    ["Yes", "Maybe", "No"],
                    p=[0.55, 0.25, 0.20]
                )
            else:
                # User was invited but didn't respond → treat as implicit No
                status = "No Response"

            # Response timing: exponential, most respond 1-3 days before
            days_before = max(0, int(rng.exponential(2.5)))
            days_before = min(days_before, 14)  # cap at 2 weeks before

            records.append({
                "event_id": event["event_id"],
                "user_id": user_id,
                "rsvp_status": status,
                "days_before_event": days_before,
            })

    return pd.DataFrame(records)
