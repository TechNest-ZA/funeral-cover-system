ALTER TABLE member ADD COLUMN access_token VARCHAR(36) NULL AFTER id_number;

UPDATE member SET access_token = UUID() WHERE access_token IS NULL;

ALTER TABLE member MODIFY access_token VARCHAR(36) NOT NULL;
ALTER TABLE member ADD UNIQUE INDEX idx_member_access_token (access_token);
