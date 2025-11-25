CREATE TABLE items (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);
