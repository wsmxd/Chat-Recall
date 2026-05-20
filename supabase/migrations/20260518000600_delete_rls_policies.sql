-- Add RLS delete policies for character owners and lore pack owners

create policy "character owners can delete"
on public.characters for delete
using (auth.uid() = owner_id);

create policy "lore pack owners can delete"
on public.lore_packs for delete
using (auth.uid() = owner_id);

create policy "lore pack owners can delete their documents"
on public.documents for delete
using (
  exists (
    select 1
    from public.lore_packs lp
    where lp.id = lore_pack_id
      and lp.owner_id = auth.uid()
  )
);

create policy "lore pack owners can delete their document chunks"
on public.document_chunks for delete
using (
  exists (
    select 1
    from public.lore_packs lp
    where lp.id = lore_pack_id
      and lp.owner_id = auth.uid()
  )
);