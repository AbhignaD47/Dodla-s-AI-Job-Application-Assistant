-- Seeding an admin user
-- NOTE: In production, you would typically use Supabase Auth API to create this user securely
-- Here we're using a direct SQL insert for local development / initialization

DO $$
DECLARE
  _admin_id uuid := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- Insert into auth.users (simulate signup)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'abhignadodla4@gmail.com') THEN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role)
    VALUES (
      _admin_id,
      '00000000-0000-0000-0000-000000000000',
      'abhignadodla4@gmail.com',
      crypt('HiddenLove@47', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{}',
      false,
      'authenticated'
    );

    -- the trigger 'handle_new_user' will automatically insert into public.users
    -- so we just need to update it to be an admin
    UPDATE public.users
    SET is_admin = true, credits = 9999999 -- Unlimited
    WHERE id = _admin_id;

    -- Also insert some seed promo codes
    INSERT INTO public.promo_codes (code, discount_percent, is_active, is_used) VALUES 
    ('WELCOME100', 100, true, false),
    ('DISCOUNT50', 50, true, false),
    ('LAUNCH20', 20, true, false);
  END IF;
END $$;
