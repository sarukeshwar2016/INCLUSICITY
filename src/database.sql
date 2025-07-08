-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create the sequence if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'users_id_seq') THEN
        CREATE SEQUENCE users_id_seq START 1;
    END IF;
END $$;

-- Create the users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL, -- Store hashed password
    created_at TIMESTAMP DEFAULT NOW(),
    remember_me BOOLEAN DEFAULT FALSE
);

-- Create or replace the function to generate the custom ID
CREATE OR REPLACE FUNCTION generate_custom_user_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.id = 'IC' || LPAD(nextval('users_id_seq')::TEXT, 3, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_custom_user_id ON users;

-- Create a trigger to automatically set the custom ID on insert
CREATE TRIGGER set_custom_user_id
BEFORE INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION generate_custom_user_id();

-- Create or replace the function to insert a user record on auth.users creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (email, password)
    VALUES (NEW.email, 'pending'::TEXT) -- Placeholder password until updated
    ON CONFLICT (email) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create a trigger to call the function on new user creation
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

-- Allow users to read their own data
CREATE POLICY "Users can view their own data" ON users
FOR SELECT USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Allow users to update their own data
CREATE POLICY "Users can update their own data" ON users
FOR UPDATE USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));