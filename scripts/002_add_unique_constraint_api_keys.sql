-- Add unique constraint to api_keys table for user_id
-- This allows upsert operations to work properly
ALTER TABLE public.api_keys ADD CONSTRAINT api_keys_user_id_unique UNIQUE (user_id);
