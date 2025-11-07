-- Create custom ENUM types for status fields to ensure data integrity.
-- ENUMs are a good practice because they prevent typos and invalid data in status columns.
CREATE TYPE event_status AS ENUM ('BUSY', 'SWAPPABLE', 'SWAP_PENDING');
CREATE TYPE swap_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- Create the Users table to store login and profile information.
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the Events table, which represents a time slot in a user's calendar.
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    -- user_id is a foreign key that links to the users table.
    -- ON DELETE CASCADE means if a user is deleted, all of their events will be automatically deleted as well.
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status event_status NOT NULL DEFAULT 'BUSY'
);

-- Create the SwapRequests table.
-- This table acts as a "link" between two events that are part of a swap proposal.
CREATE TABLE swap_requests (
    id SERIAL PRIMARY KEY,
    -- The ID of the event being offered by the requester.
    requester_slot_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    -- The ID of the event being requested from the other user.
    requested_slot_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    status swap_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW()
);