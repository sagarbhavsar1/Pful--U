"""
User data generation.
Simulates users across universities with realistic join-date and friend distributions.
"""

import numpy as np
import pandas as pd
from data.seasonality import get_weekly_multipliers


def generate_users(universities_df: pd.DataFrame, seed: int = 42) -> pd.DataFrame:
    """
    Generate users for each university.
    User count per uni ≈ student_population × adoption_rate.
    Join dates are spread across 52 weeks with seasonality.
    """
    rng = np.random.default_rng(seed=seed)
    multipliers = get_weekly_multipliers()
    join_mult = multipliers["join"]
    join_probs = join_mult / join_mult.sum()

    records = []
    user_counter = 0

    for _, uni in universities_df.iterrows():
        n_users = int(uni["student_population"] * uni["adoption_rate"])
        n_users = max(n_users, 20)  # at least 20 users per uni

        # Assign join weeks using seasonality probabilities
        join_weeks = rng.choice(52, size=n_users, p=join_probs)

        # Friend count: power-law-ish (lognormal approximation)
        # Mean ~12 friends, heavy right tail
        raw_friends = rng.lognormal(mean=np.log(10), sigma=0.8, size=n_users)
        friend_counts = np.clip(raw_friends, 1, 500).astype(int)

        for i in range(n_users):
            records.append({
                "user_id": f"USR_{user_counter:06d}",
                "university_id": uni["university_id"],
                "join_week": int(join_weeks[i]),
                "friend_count": int(friend_counts[i]),
            })
            user_counter += 1

    df = pd.DataFrame(records)

    # Convert join_week to a date (week 0 = 2024-08-26, a Monday)
    base_date = pd.Timestamp("2024-08-26")
    df["join_date"] = df["join_week"].apply(
        lambda w: base_date + pd.Timedelta(weeks=int(w))
    )

    return df
