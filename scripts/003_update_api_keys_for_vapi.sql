-- Update api_keys table to support Vapi private and public keys
ALTER TABLE public.api_keys 
DROP COLUMN IF EXISTS vapi_api_key,
ADD COLUMN vapi_private_key TEXT,
ADD COLUMN vapi_public_key TEXT;

-- Update the unique constraint to work with the new structure
-- (The constraint was added in script 002, so we're good there)
