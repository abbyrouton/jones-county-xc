-- Sample athletes
INSERT INTO athletes (name, grade, personal_record, events) VALUES
('Marcus Thompson', 12, '16:23', '5K,3200m'),
('Jake Reynolds', 11, '17:05', '5K,1600m'),
('Dylan Carter', 10, '17:48', '5K'),
('Chris Nguyen', 9, '18:32', '5K,3200m'),
('Brandon Scott', 12, '16:45', '5K,1600m'),
('Emily Davis', 11, '19:15', '5K,3200m'),
('Sarah Mitchell', 12, '18:42', '5K,1600m'),
('Mia Rodriguez', 10, '20:08', '5K'),
('Hannah Clark', 11, '19:55', '5K,3200m'),
('Lily Patterson', 9, '21:30', '5K');

-- Sample meets
INSERT INTO meets (name, date, location, description) VALUES
('Panther Creek Invitational', '2026-08-22', 'Panther Creek State Park, Covington, GA', 'Season opener hosted by Newton County'),
('Run the Bison Classic', '2026-09-05', 'Berkmar High School, Lilburn, GA', 'Large invitational with 30+ schools'),
('Grayson Invitational', '2026-09-12', 'Grayson High School, Loganville, GA', 'Competitive meet featuring top metro Atlanta teams'),
('West Georgia Invitational', '2026-09-26', 'Carrollton, GA', 'Western Georgia regional competition'),
('Region 4-AAAAA Championship', '2026-10-17', 'Jones County Recreation Complex, Gray, GA', 'Region championship meet'),
('GHSA State Championship', '2026-11-07', 'Carrollton, GA', 'Georgia High School State Championship');

-- Sample results for Panther Creek Invitational
INSERT INTO results (athlete_id, meet_id, time, place) VALUES
(1, 1, '16:45', 3),
(2, 1, '17:22', 8),
(3, 1, '18:05', 15),
(4, 1, '19:01', 24),
(5, 1, '17:02', 5),
(6, 1, '19:38', 4),
(7, 1, '19:02', 2),
(8, 1, '20:45', 12),
(9, 1, '20:18', 8),
(10, 1, '22:05', 18);

-- Sample results for Run the Bison Classic
INSERT INTO results (athlete_id, meet_id, time, place) VALUES
(1, 2, '16:31', 5),
(2, 2, '17:15', 18),
(3, 2, '17:55', 32),
(5, 2, '16:52', 12),
(6, 2, '19:22', 8),
(7, 2, '18:55', 3),
(9, 2, '20:02', 15);

-- Sample results for Grayson Invitational
INSERT INTO results (athlete_id, meet_id, time, place) VALUES
(1, 3, '16:28', 7),
(2, 3, '17:08', 22),
(5, 3, '16:48', 14),
(7, 3, '18:48', 5),
(6, 3, '19:30', 9);
