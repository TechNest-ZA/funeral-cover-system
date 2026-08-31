CREATE TABLE plan (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    monthly_premium DECIMAL(10,2) NOT NULL,
    cover_amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE member (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    id_number VARCHAR(20) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(150),
    plan_id BIGINT NOT NULL,
    status ENUM('pending', 'active', 'lapsed') DEFAULT 'pending',
    signup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES plan(id)
);

CREATE TABLE payment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    member_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    method ENUM('eft', 'card', 'cash') NOT NULL,
    status ENUM('pending', 'success', 'failed') DEFAULT 'pending',
    reference VARCHAR(100),
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES member(id)
);

CREATE TABLE admin_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('staff', 'owner') DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for the searches the admin dashboard will actually do
CREATE INDEX idx_member_id_number ON member(id_number);
CREATE INDEX idx_member_full_name ON member(full_name);
CREATE INDEX idx_payment_member ON payment(member_id);
CREATE INDEX idx_payment_status ON payment(status);
