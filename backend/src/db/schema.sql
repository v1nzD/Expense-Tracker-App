
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL, 
    last_name VARCHAR(255) NOT NULL, 
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
    UNIQUE (user_id, name)
);

CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    description TEXT,
    expense_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);