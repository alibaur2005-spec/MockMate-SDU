-- Add DELETE policy for transcriptions table
create policy "Users can delete own transcriptions" on public.transcriptions
  for delete using (auth.uid() = user_id);
