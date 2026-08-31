CREATE TABLE dependent (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    member_id BIGINT NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    id_number VARCHAR(20),
    relationship VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES member(id)
);

CREATE INDEX idx_dependent_member ON dependent(member_id);

-- A policy can now have more than one claim over its lifetime (a dependent's
-- death doesn't close it), so the old "one claim per member" constraint has
-- to go. Uniqueness moves to "one claim per dependent" instead; "only one
-- claim against the member themself" is enforced in the application layer,
-- since MySQL unique indexes treat NULLs as distinct and can't express that.
-- The existing unique index also backs the member_id foreign key, so a
-- plain index has to replace it before it can be dropped.
CREATE INDEX idx_claim_member ON claim(member_id);
ALTER TABLE claim DROP INDEX member_id;
ALTER TABLE claim ADD COLUMN dependent_id BIGINT NULL AFTER member_id;
ALTER TABLE claim ADD CONSTRAINT fk_claim_dependent FOREIGN KEY (dependent_id) REFERENCES dependent(id);
ALTER TABLE claim ADD UNIQUE INDEX idx_claim_dependent_unique (dependent_id);
