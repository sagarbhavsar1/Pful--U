-- Partiful U Analytics — DuckDB Schema
-- Demonstrates SQL proficiency with proper analytical schema design

-- Universities dimension table
CREATE TABLE IF NOT EXISTS universities (
    university_id    VARCHAR PRIMARY KEY,
    name             VARCHAR NOT NULL,
    student_population INTEGER NOT NULL,
    region           VARCHAR NOT NULL,
    type             VARCHAR NOT NULL,      -- Public / Private
    setting          VARCHAR NOT NULL,      -- Urban / Suburban / Rural
    adoption_rate    DOUBLE NOT NULL
);

-- Users fact table
CREATE TABLE IF NOT EXISTS users (
    user_id          VARCHAR PRIMARY KEY,
    university_id    VARCHAR NOT NULL REFERENCES universities(university_id),
    join_week        INTEGER NOT NULL,
    join_date        DATE NOT NULL,
    friend_count     INTEGER NOT NULL
);

-- Events fact table
CREATE TABLE IF NOT EXISTS events (
    event_id         VARCHAR PRIMARY KEY,
    university_id    VARCHAR NOT NULL REFERENCES universities(university_id),
    host_id          VARCHAR NOT NULL REFERENCES users(user_id),
    event_week       INTEGER NOT NULL,
    event_date       DATE NOT NULL,
    event_type       VARCHAR NOT NULL,
    visibility_scope VARCHAR NOT NULL,      -- friends_only / campus_public
    invite_count     INTEGER NOT NULL,
    poll_enabled     BOOLEAN NOT NULL,
    text_blast_count INTEGER NOT NULL
);

-- RSVPs fact table
CREATE TABLE IF NOT EXISTS rsvps (
    event_id         VARCHAR NOT NULL REFERENCES events(event_id),
    user_id          VARCHAR NOT NULL REFERENCES users(user_id),
    rsvp_status      VARCHAR NOT NULL,      -- Yes / Maybe / No / No Response
    days_before_event INTEGER NOT NULL,
    PRIMARY KEY (event_id, user_id)
);

-- Attendance fact table
CREATE TABLE IF NOT EXISTS attendance (
    event_id         VARCHAR NOT NULL REFERENCES events(event_id),
    user_id          VARCHAR NOT NULL REFERENCES users(user_id),
    attended         BOOLEAN NOT NULL,
    PRIMARY KEY (event_id, user_id)
);
