CREATE TABLE IF NOT EXISTS email_verification_token (
    token_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    token VARCHAR(128) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_verification_token_user_id ON email_verification_token(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_token_expires_at ON email_verification_token(expires_at);
