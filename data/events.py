"""
Event data generation.
Simulates events across universities with seasonality and different event types.
"""

import numpy as np
import pandas as pd
from data.seasonality import get_weekly_multipliers


_EVENT_TYPES = [
    ("House Party", 0.30),
    ("Club Event", 0.20),
    ("Birthday", 0.15),
    ("Networking", 0.10),
    ("Study Group", 0.08),
    ("Sports Watch", 0.07),
    ("Cultural", 0.05),
    ("Other", 0.05),
]
_EVENT_TYPE_NAMES = [t[0] for t in _EVENT_TYPES]
_EVENT_TYPE_PROBS = [t[1] for t in _EVENT_TYPES]

# Average invites by event type (log-normal mu)
_INVITE_MU = {
    "House Party": np.log(25),
    "Club Event": np.log(60),
    "Birthday": np.log(15),
    "Networking": np.log(40),
    "Study Group": np.log(8),
    "Sports Watch": np.log(20),
    "Cultural": np.log(35),
    "Other": np.log(15),
}


def generate_events(
    universities_df: pd.DataFrame,
    users_df: pd.DataFrame,
    seed: int = 42,
) -> pd.DataFrame:
    """
    Generate events over 52 weeks.
    Events per university per week = Poisson(λ) where λ scales with uni size and seasonality.
    """
    rng = np.random.default_rng(seed=seed)
    multipliers = get_weekly_multipliers()
    event_mult = multipliers["event"]

    # Pre-compute per-uni user counts
    users_per_uni = users_df.groupby("university_id")["user_id"].count().to_dict()

    # Base event rate: ~0.5 events per 100 users per week
    base_rate_per_100_users = 0.5

    records = []
    event_counter = 0
    base_date = pd.Timestamp("2024-08-26")

    for _, uni in universities_df.iterrows():
        uni_id = uni["university_id"]
        n_users = users_per_uni.get(uni_id, 0)
        if n_users == 0:
            continue

        base_lambda = (n_users / 100) * base_rate_per_100_users

        # Get eligible hosts (users at this university)
        uni_users = users_df[users_df["university_id"] == uni_id]
        uni_user_ids = uni_users["user_id"].values
        uni_join_weeks = uni_users["join_week"].values

        for week in range(52):
            lam = max(base_lambda * event_mult[week], 0.1)
            n_events = rng.poisson(lam)

            for _ in range(n_events):
                # Pick a host who has already joined by this week
                eligible_mask = uni_join_weeks <= week
                if not eligible_mask.any():
                    continue
                eligible_ids = uni_user_ids[eligible_mask]
                host_id = rng.choice(eligible_ids)

                # Event type
                event_type = rng.choice(_EVENT_TYPE_NAMES, p=_EVENT_TYPE_PROBS)

                # Visibility: 70% friends_only, 30% campus_public
                visibility = rng.choice(
                    ["friends_only", "campus_public"], p=[0.70, 0.30]
                )

                # Invite count
                mu = _INVITE_MU[event_type]
                invite_count = int(np.clip(rng.lognormal(mu, 0.5), 3, 500))

                # Cap invites at available users for this uni
                invite_count = min(invite_count, len(eligible_ids))

                # Poll enabled
                poll_enabled = rng.random() < 0.25

                # Text blast count
                text_blast_count = rng.poisson(1.2) if rng.random() < 0.4 else 0

                # Event date: random day within this week
                event_date = base_date + pd.Timedelta(weeks=int(week), days=int(rng.integers(0, 7)))

                records.append({
                    "event_id": f"EVT_{event_counter:06d}",
                    "university_id": uni_id,
                    "host_id": host_id,
                    "event_week": week,
                    "event_date": event_date,
                    "event_type": event_type,
                    "visibility_scope": visibility,
                    "invite_count": invite_count,
                    "poll_enabled": poll_enabled,
                    "text_blast_count": text_blast_count,
                })
                event_counter += 1

    return pd.DataFrame(records)
