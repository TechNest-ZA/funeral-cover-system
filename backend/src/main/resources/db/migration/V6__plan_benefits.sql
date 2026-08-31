-- This is an in-kind services benefit, not a cash payout, so the flat
-- cover_amount figure doesn't reflect what a member actually receives.
-- Replaced with a real list of what each tier includes.
ALTER TABLE plan ADD COLUMN benefits TEXT NULL AFTER description;

UPDATE plan SET benefits = 'Body collection, washing & storage
Standard wooden casket
Hearse and 1 family car
Death certificate & paperwork assistance'
WHERE name = 'Basic Cover';

UPDATE plan SET benefits = 'Body collection, washing & storage
Upgraded dome casket
Hearse and 2 family cars
Tent, chairs & tables for the service
Basic catering equipment'
WHERE name = 'Standard Cover';

UPDATE plan SET benefits = 'Body collection, washing & storage
Premium casket
Hearse and 3 family cars
Large tent, chairs & tables for the service
Full catering service
Tombstone contribution'
WHERE name = 'Premium Cover';

ALTER TABLE plan MODIFY benefits TEXT NOT NULL;
ALTER TABLE plan DROP COLUMN cover_amount;
