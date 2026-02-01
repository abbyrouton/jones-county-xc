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

-- name: CreateResult :execresult
INSERT INTO results (athlete_id, meet_id, time, place)
VALUES (?, ?, ?, ?);
