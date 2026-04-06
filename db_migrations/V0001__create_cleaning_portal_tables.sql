
CREATE TABLE IF NOT EXISTS cleaning_users (
    id SERIAL PRIMARY KEY,
    login VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cleaning_orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES cleaning_users(id),
    address TEXT NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    service_date DATE NOT NULL,
    service_time VARCHAR(10) NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    payment_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'new',
    cancel_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cleaning_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES cleaning_users(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '7 days'
);

INSERT INTO cleaning_users (login, password_hash, full_name, phone, email, is_admin)
VALUES ('adminka', 'password', 'Администратор системы', '+7-000-000-0000', 'admin@cleaning.ru', TRUE)
ON CONFLICT (login) DO NOTHING;
