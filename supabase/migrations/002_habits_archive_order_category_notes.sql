-- Add habit metadata fields and completion notes

ALTER TABLE habits
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;

-- Helpful index for ordering
CREATE INDEX IF NOT EXISTS habits_user_sort_order_idx ON habits(user_id, sort_order);
CREATE INDEX IF NOT EXISTS habits_user_archived_idx ON habits(user_id, archived_at);

ALTER TABLE completions
  ADD COLUMN IF NOT EXISTS note TEXT;

-- Fast range queries (last N days)
CREATE INDEX IF NOT EXISTS completions_user_date_idx ON completions(user_id, completed_date);


