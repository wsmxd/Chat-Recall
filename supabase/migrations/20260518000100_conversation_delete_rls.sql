-- Add missing DELETE policy for conversations table
create policy "conversation owners can delete"
on public.conversations for delete
using (auth.uid() = owner_id);
