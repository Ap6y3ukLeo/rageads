-- Отключаем RLS (самый простой способ)
ALTER TABLE reminders DISABLE ROW LEVEL SECURITY;

-- Или если хочешь оставить RLS, создай политики:
-- CREATE POLICY "Allow all inserts" ON reminders FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow all updates" ON reminders FOR UPDATE USING (true);
-- CREATE POLICY "Allow all deletes" ON reminders FOR DELETE USING (true);
-- CREATE POLICY "Allow all selects" ON reminders FOR SELECT USING (true);
