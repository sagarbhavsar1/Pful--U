"""
Seasonality configuration for 52-week academic year simulation.
Maps each week to activity multipliers for event creation, user joins, and engagement.
"""

import numpy as np


def get_weekly_multipliers() -> dict:
    """
    Returns a dict with keys 'event', 'join', 'engagement',
    each mapping to a numpy array of 52 floats (one per week).

    Academic calendar assumptions (week 1 = late August):
      Weeks 1-4:   Orientation / Welcome Week  → spike
      Weeks 5-8:   Early semester settling in
      Weeks 9-12:  Midterm season              → dip
      Weeks 13-15: Post-midterm recovery
      Weeks 16-17: Thanksgiving / Fall break    → moderate dip
      Weeks 18-20: Finals + Winter break start  → big dip
      Weeks 21-24: Winter break                 → low
      Weeks 25-28: Spring semester start        → recovery spike
      Weeks 29-32: Spring steady state
      Weeks 33-34: Spring break                 → dip
      Weeks 35-38: Post-spring break
      Weeks 39-42: Pre-finals                   → moderate dip
      Weeks 43-44: Finals                       → dip
      Weeks 45-47: Graduation week              → spike
      Weeks 48-52: Summer                       → slump
    """
    event_mult = np.ones(52)
    join_mult = np.ones(52)
    engagement_mult = np.ones(52)

    # Orientation spike (weeks 1-4)
    event_mult[0:4] = [1.8, 1.6, 1.4, 1.3]
    join_mult[0:4] = [3.0, 2.5, 1.8, 1.4]
    engagement_mult[0:4] = [1.6, 1.5, 1.3, 1.2]

    # Early semester (weeks 5-8)
    event_mult[4:8] = [1.1, 1.05, 1.0, 1.0]
    join_mult[4:8] = [1.1, 1.0, 0.9, 0.85]
    engagement_mult[4:8] = [1.1, 1.05, 1.0, 1.0]

    # Midterm season (weeks 9-12)
    event_mult[8:12] = [0.75, 0.6, 0.6, 0.7]
    join_mult[8:12] = [0.7, 0.6, 0.55, 0.65]
    engagement_mult[8:12] = [0.7, 0.55, 0.55, 0.65]

    # Post-midterm recovery (weeks 13-15)
    event_mult[12:15] = [1.1, 1.15, 1.2]
    join_mult[12:15] = [0.8, 0.85, 0.9]
    engagement_mult[12:15] = [1.05, 1.1, 1.15]

    # Thanksgiving / Fall break (weeks 16-17)
    event_mult[15:17] = [0.5, 0.4]
    join_mult[15:17] = [0.4, 0.3]
    engagement_mult[15:17] = [0.5, 0.4]

    # Finals + winter break start (weeks 18-20)
    event_mult[17:20] = [0.35, 0.25, 0.2]
    join_mult[17:20] = [0.3, 0.2, 0.15]
    engagement_mult[17:20] = [0.3, 0.2, 0.15]

    # Winter break (weeks 21-24)
    event_mult[20:24] = [0.15, 0.15, 0.2, 0.3]
    join_mult[20:24] = [0.1, 0.1, 0.15, 0.25]
    engagement_mult[20:24] = [0.15, 0.15, 0.2, 0.3]

    # Spring semester start (weeks 25-28)
    event_mult[24:28] = [1.5, 1.3, 1.2, 1.1]
    join_mult[24:28] = [2.0, 1.6, 1.2, 1.0]
    engagement_mult[24:28] = [1.4, 1.3, 1.15, 1.1]

    # Spring steady state (weeks 29-32)
    event_mult[28:32] = [1.05, 1.0, 1.0, 1.05]
    join_mult[28:32] = [0.9, 0.85, 0.85, 0.8]
    engagement_mult[28:32] = [1.0, 1.0, 1.0, 1.0]

    # Spring break (weeks 33-34)
    event_mult[32:34] = [0.35, 0.3]
    join_mult[32:34] = [0.3, 0.25]
    engagement_mult[32:34] = [0.35, 0.3]

    # Post-spring break (weeks 35-38)
    event_mult[34:38] = [1.1, 1.15, 1.1, 1.05]
    join_mult[34:38] = [0.9, 0.85, 0.8, 0.75]
    engagement_mult[34:38] = [1.05, 1.1, 1.05, 1.0]

    # Pre-finals (weeks 39-42)
    event_mult[38:42] = [0.8, 0.7, 0.6, 0.5]
    join_mult[38:42] = [0.6, 0.5, 0.45, 0.4]
    engagement_mult[38:42] = [0.75, 0.65, 0.55, 0.5]

    # Finals (weeks 43-44)
    event_mult[42:44] = [0.3, 0.25]
    join_mult[42:44] = [0.3, 0.25]
    engagement_mult[42:44] = [0.3, 0.25]

    # Graduation (weeks 45-47)
    event_mult[44:47] = [1.5, 1.8, 1.3]
    join_mult[44:47] = [0.5, 0.6, 0.4]
    engagement_mult[44:47] = [1.3, 1.5, 1.1]

    # Summer slump (weeks 48-52)
    event_mult[47:52] = [0.4, 0.35, 0.3, 0.3, 0.35]
    join_mult[47:52] = [0.3, 0.25, 0.2, 0.2, 0.25]
    engagement_mult[47:52] = [0.35, 0.3, 0.25, 0.25, 0.3]

    return {
        "event": event_mult,
        "join": join_mult,
        "engagement": engagement_mult,
    }


def get_week_labels() -> list[str]:
    """Human-readable labels for each of the 52 weeks."""
    labels = []
    month_week_map = [
        ("Aug", 4), ("Sep", 4), ("Oct", 5), ("Nov", 4), ("Dec", 4),
        ("Jan", 5), ("Feb", 4), ("Mar", 4), ("Apr", 5), ("May", 4),
        ("Jun", 4), ("Jul", 5),
    ]
    week_num = 0
    for month, n_weeks in month_week_map:
        for w in range(1, n_weeks + 1):
            if week_num < 52:
                labels.append(f"{month} W{w}")
                week_num += 1
    return labels[:52]
