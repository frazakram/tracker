-- Create habits table
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '📝',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create completions table
CREATE TABLE IF NOT EXISTS completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(habit_id, completed_date)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS habits_user_id_idx ON habits(user_id);
CREATE INDEX IF NOT EXISTS completions_user_id_idx ON completions(user_id);
CREATE INDEX IF NOT EXISTS completions_habit_id_idx ON completions(habit_id);
CREATE INDEX IF NOT EXISTS completions_date_idx ON completions(completed_date);

-- Enable Row Level Security
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for habits table
-- Users can only see their own habits
CREATE POLICY "Users can view their own habits"
  ON habits FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own habits
CREATE POLICY "Users can insert their own habits"
  ON habits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own habits
CREATE POLICY "Users can update their own habits"
  ON habits FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only delete their own habits
CREATE POLICY "Users can delete their own habits"
  ON habits FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for completions table
-- Users can only see their own completions
CREATE POLICY "Users can view their own completions"
  ON completions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own completions
CREATE POLICY "Users can insert their own completions"
  ON completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own completions
CREATE POLICY "Users can delete their own completions"
  ON completions FOR DELETE
  USING (auth.uid() = user_id);
