ALTER TABLE member MODIFY status ENUM('pending', 'active', 'lapsed', 'deceased') DEFAULT 'pending';

CREATE TABLE claim (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    member_id BIGINT NOT NULL UNIQUE,
    date_of_death DATE NOT NULL,
    notes TEXT,
    recorded_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES member(id)
);
