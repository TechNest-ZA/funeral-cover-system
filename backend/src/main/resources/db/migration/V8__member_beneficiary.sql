-- Who the parlor should contact/coordinate with for this member. Not a cash
-- beneficiary (this product has no cash payout) - purely operational contact
-- info, requested at signup per the warm-redesign handoff.
ALTER TABLE member ADD COLUMN beneficiary_name VARCHAR(150) NULL AFTER phone;
ALTER TABLE member ADD COLUMN beneficiary_relationship VARCHAR(50) NULL AFTER beneficiary_name;
