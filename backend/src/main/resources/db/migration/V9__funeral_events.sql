CREATE TABLE funeral_event (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    label VARCHAR(150) NOT NULL,
    service_date DATE NOT NULL,
    qr_token VARCHAR(12) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE member ADD COLUMN funeral_event_id BIGINT NULL AFTER plan_id;
ALTER TABLE member ADD CONSTRAINT fk_member_funeral_event
    FOREIGN KEY (funeral_event_id) REFERENCES funeral_event(id);
