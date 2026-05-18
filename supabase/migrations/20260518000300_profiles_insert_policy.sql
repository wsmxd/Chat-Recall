create policy "profiles are owner insertable"
on public.profiles for insert
with check (auth.uid() = id);
