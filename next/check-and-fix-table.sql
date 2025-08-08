-- Check if push_subscriptions table exists
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'push_subscriptions'
ORDER BY ordinal_position;

-- If table doesn't exist or has wrong structure, run this:
-- DROP TABLE IF EXISTS push_subscriptions CASCADE;

-- Create the correct table structure
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Service role can access all push subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Users can manage their own push subscriptions" ON push_subscriptions;

CREATE POLICY "Service role can access all push subscriptions"
  ON push_subscriptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can manage their own push subscriptions"
  ON push_subscriptions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
