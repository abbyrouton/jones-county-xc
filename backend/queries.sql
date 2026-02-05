-- name: GetAllAthletes :many
SELECT id, name, grade, personal_record, events, created_at
FROM athletes
ORDER BY name;

-- name: GetAthleteByID :one
SELECT id, name, grade, personal_record, events, created_at
FROM athletes
WHERE id = ?;

-- name: GetAllMeets :many
SELECT id, name, date, location, description, created_at
FROM meets
ORDER BY date;

-- name: GetResultsByMeetID :many
SELECT r.id, r.athlete_id, r.meet_id, r.time, r.place, r.created_at
FROM results r
WHERE r.meet_id = ?
ORDER BY r.place;

-- name: GetMeetResults :many
SELECT r.id, r.time, r.place, a.id AS athlete_id, a.name AS athlete_name, a.grade AS athlete_grade
FROM results r
JOIN athletes a ON r.athlete_id = a.id
WHERE r.meet_id = ?
ORDER BY r.place;

-- name: CreateResult :execresult
INSERT INTO results (athlete_id, meet_id, time, place)
VALUES (?, ?, ?, ?);

-- name: GetTopTimes :many
SELECT r.id, r.time, r.place, a.id AS athlete_id, a.name AS athlete_name, m.id AS meet_id, m.name AS meet_name, m.date AS meet_date
FROM results r
JOIN athletes a ON r.athlete_id = a.id
JOIN meets m ON r.meet_id = m.id
ORDER BY r.time ASC
LIMIT 10;

-- name: CreateAthlete :execresult
INSERT INTO athletes (name, grade, personal_record, events)
VALUES (?, ?, ?, ?);

-- name: UpdateAthlete :exec
UPDATE athletes
SET name = ?, grade = ?, personal_record = ?, events = ?
WHERE id = ?;

-- name: DeleteAthlete :exec
DELETE FROM athletes WHERE id = ?;

-- name: CreateMeet :execresult
INSERT INTO meets (name, date, location, description)
VALUES (?, ?, ?, ?);

-- name: UpdateMeet :exec
UPDATE meets
SET name = ?, date = ?, location = ?, description = ?
WHERE id = ?;

-- name: DeleteMeet :exec
DELETE FROM meets WHERE id = ?;

-- name: UpdateResult :exec
UPDATE results
SET athlete_id = ?, meet_id = ?, time = ?, place = ?
WHERE id = ?;

-- name: DeleteResult :exec
DELETE FROM results WHERE id = ?;
