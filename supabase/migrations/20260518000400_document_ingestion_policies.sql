create policy "lore pack owners can insert documents"
on public.documents for insert
with check (
  exists (
    select 1
    from public.lore_packs lp
    where lp.id = lore_pack_id
      and lp.owner_id = auth.uid()
  )
);

create policy "lore pack owners can insert document chunks"
on public.document_chunks for insert
with check (
  exists (
    select 1
    from public.lore_packs lp
    where lp.id = lore_pack_id
      and lp.owner_id = auth.uid()
  )
);
