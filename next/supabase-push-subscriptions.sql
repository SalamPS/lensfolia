-- Create push_subscriptions table with correct structure
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

-- Create RLS policies
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow service role to access all records (bypass RLS)
CREATE POLICY IF NOT EXISTS "Service role can access all push subscriptions"
  ON push_subscriptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow users to manage their own subscriptions
CREATE POLICY IF NOT EXISTS "Users can manage their own push subscriptions"
  ON push_subscriptions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
