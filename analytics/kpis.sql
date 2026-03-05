-- ================================================================
-- Partiful U Analytics — KPI Queries
-- Core product metrics computed via DuckDB SQL
-- ================================================================

-- ============================================
-- GROWTH KPIs
-- ============================================

-- Weekly new users per campus
-- Shows organic growth trajectory by university
CREATE OR REPLACE VIEW kpi_weekly_new_users AS
SELECT
    u.university_id,
    uni.name AS university_name,
    u.join_week,
    COUNT(*) AS new_users,
    SUM(COUNT(*)) OVER (
        PARTITION BY u.university_id
        ORDER BY u.join_week
        ROWS UNBOUNDED PRECEDING
    ) AS cumulative_users
FROM users u
JOIN universities uni ON u.university_id = uni.university_id
GROUP BY u.university_id, uni.name, u.join_week
ORDER BY u.university_id, u.join_week;


-- Event creation rate per 1,000 active users (weekly)
-- "Active" = joined by that week
CREATE OR REPLACE VIEW kpi_event_creation_rate AS
WITH active_users AS (
    SELECT
        university_id,
        join_week,
        COUNT(*) AS users_joined_this_week,
        SUM(COUNT(*)) OVER (
            PARTITION BY university_id
            ORDER BY join_week
            ROWS UNBOUNDED PRECEDING
        ) AS cumul_active_users
    FROM users
    GROUP BY university_id, join_week
),
weekly_events AS (
    SELECT
        university_id,
        event_week,
        COUNT(*) AS events_created
    FROM events
    GROUP BY university_id, event_week
)
SELECT
    e.university_id,
    e.event_week,
    e.events_created,
    a.cumul_active_users,
    ROUND(e.events_created * 1000.0 / NULLIF(a.cumul_active_users, 0), 2) AS events_per_1k_users
FROM weekly_events e
LEFT JOIN active_users a
    ON e.university_id = a.university_id
    AND e.event_week = a.join_week
ORDER BY e.university_id, e.event_week;


-- Invite-to-RSVP conversion rate (by visibility scope)
-- THE KEY METRIC: campus_public should outperform
CREATE OR REPLACE VIEW kpi_invite_rsvp_conversion AS
SELECT
    ev.visibility_scope,
    ev.event_type,
    COUNT(DISTINCT ev.event_id) AS events,
    SUM(ev.invite_count) AS total_invites,
    COUNT(CASE WHEN r.rsvp_status IN ('Yes', 'Maybe') THEN 1 END) AS positive_rsvps,
    ROUND(
        COUNT(CASE WHEN r.rsvp_status IN ('Yes', 'Maybe') THEN 1 END) * 100.0
        / NULLIF(COUNT(r.user_id), 0),
        2
    ) AS rsvp_positive_rate_pct
FROM events ev
LEFT JOIN rsvps r ON ev.event_id = r.event_id
GROUP BY ev.visibility_scope, ev.event_type
ORDER BY ev.visibility_scope, ev.event_type;


-- ============================================
-- ENGAGEMENT KPIs
-- ============================================

-- Average events attended per user (by university)
CREATE OR REPLACE VIEW kpi_avg_events_attended AS
SELECT
    u.university_id,
    uni.name AS university_name,
    COUNT(DISTINCT a.user_id) AS users_who_attended,
    COUNT(CASE WHEN a.attended THEN 1 END) AS total_attendances,
    ROUND(
        COUNT(CASE WHEN a.attended THEN 1 END) * 1.0
        / NULLIF(COUNT(DISTINCT u.user_id), 0),
        2
    ) AS avg_events_per_user
FROM users u
JOIN universities uni ON u.university_id = uni.university_id
LEFT JOIN attendance a ON u.user_id = a.user_id AND a.attended = true
GROUP BY u.university_id, uni.name
ORDER BY avg_events_per_user DESC;


-- RSVP "Yes" rate by event type
CREATE OR REPLACE VIEW kpi_rsvp_rate AS
SELECT
    ev.event_type,
    ev.visibility_scope,
    COUNT(*) AS total_rsvps,
    COUNT(CASE WHEN r.rsvp_status = 'Yes' THEN 1 END) AS yes_count,
    ROUND(
        COUNT(CASE WHEN r.rsvp_status = 'Yes' THEN 1 END) * 100.0
        / NULLIF(COUNT(*), 0),
        2
    ) AS yes_rate_pct
FROM rsvps r
JOIN events ev ON r.event_id = ev.event_id
GROUP BY ev.event_type, ev.visibility_scope
ORDER BY ev.event_type;


-- Poll participation rate
CREATE OR REPLACE VIEW kpi_poll_participation AS
SELECT
    poll_enabled,
    COUNT(*) AS events,
    AVG(invite_count) AS avg_invites,
    COUNT(DISTINCT host_id) AS unique_hosts
FROM events
GROUP BY poll_enabled;


-- ============================================
-- RETENTION KPIs
-- ============================================

-- 30-day host repeat rate
-- Hosts who created 2+ events within 30 days of their first event
CREATE OR REPLACE VIEW kpi_host_repeat_rate AS
WITH host_events AS (
    SELECT
        host_id,
        university_id,
        event_date,
        ROW_NUMBER() OVER (PARTITION BY host_id ORDER BY event_date) AS event_rank,
        MIN(event_date) OVER (PARTITION BY host_id) AS first_event_date
    FROM events
)
SELECT
    h.university_id,
    uni.name AS university_name,
    COUNT(DISTINCT h.host_id) AS total_hosts,
    COUNT(DISTINCT CASE
        WHEN h.event_rank >= 2
        AND h.event_date <= h.first_event_date + INTERVAL '30 days'
        THEN h.host_id
    END) AS repeat_hosts_30d,
    ROUND(
        COUNT(DISTINCT CASE
            WHEN h.event_rank >= 2
            AND h.event_date <= h.first_event_date + INTERVAL '30 days'
            THEN h.host_id
        END) * 100.0 / NULLIF(COUNT(DISTINCT h.host_id), 0),
        2
    ) AS repeat_rate_30d_pct
FROM host_events h
JOIN universities uni ON h.university_id = uni.university_id
GROUP BY h.university_id, uni.name
ORDER BY repeat_rate_30d_pct DESC;


-- Weekly cohort retention (8-week)
-- Users grouped by join_week, tracked for 8 weeks of activity
CREATE OR REPLACE VIEW kpi_cohort_retention AS
WITH user_activity AS (
    SELECT DISTINCT
        u.user_id,
        u.join_week,
        ev.event_week AS active_week
    FROM users u
    JOIN attendance a ON u.user_id = a.user_id AND a.attended = true
    JOIN events ev ON a.event_id = ev.event_id
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
    ROUND(
        COUNT(DISTINCT ua.user_id) * 100.0 / cs.cohort_size, 2
    ) AS retention_pct
FROM user_activity ua
JOIN cohort_sizes cs ON ua.join_week = cs.join_week
WHERE ua.active_week >= ua.join_week
  AND (ua.active_week - ua.join_week) <= 8
GROUP BY ua.join_week, ua.active_week - ua.join_week, cs.cohort_size
ORDER BY ua.join_week, weeks_since_join;
