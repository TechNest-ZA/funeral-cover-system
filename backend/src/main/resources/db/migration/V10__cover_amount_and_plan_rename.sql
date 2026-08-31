-- Re-adds cover_amount, dropped in V6 back when this product was
-- services-in-kind only. The offer is now cash-plus-services, matching the
-- marketing site's Single/Family/Extended plans.
ALTER TABLE plan ADD COLUMN cover_amount DECIMAL(12,2) NULL AFTER monthly_premium;

UPDATE plan SET
    name = 'Single',
    monthly_premium = 99.00,
    cover_amount = 10000.00,
    description = 'Cover for one person.',
    benefits = 'R10 000 cash to your family
Coffin and hearse included
Full funeral service
Same-week payout'
WHERE name = 'Basic Cover';

UPDATE plan SET
    name = 'Family',
    monthly_premium = 199.00,
    cover_amount = 20000.00,
    description = 'You, your spouse and up to 4 children.',
    benefits = 'R20 000 cash to your family
Everything in Single, for all six
Grocery benefit for the week
Tent, chairs and sound at the home'
WHERE name = 'Standard Cover';

UPDATE plan SET
    name = 'Extended',
    monthly_premium = 299.00,
    cover_amount = 30000.00,
    description = 'Add parents and in-laws — up to 10 people.',
    benefits = 'R30 000 cash to your family
Up to 10 dependants
Transport home to the village included
Cover for parents anywhere in SA'
WHERE name = 'Premium Cover';

ALTER TABLE plan MODIFY cover_amount DECIMAL(12,2) NOT NULL;

-- Beneficiary contact details, extended - not replaced. Nullable since
-- existing members predate these fields (same pattern as V8).
ALTER TABLE member ADD COLUMN beneficiary_phone VARCHAR(20) NULL AFTER beneficiary_relationship;
ALTER TABLE member ADD COLUMN beneficiary_id_number VARCHAR(20) NULL AFTER beneficiary_phone;
