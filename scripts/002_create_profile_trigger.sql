-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, restaurant_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'restaurant_name', 'My Restaurant')
  )
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO public.api_keys (user_id)
  VALUES (NEW.id)
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
