-- Realtime + notification insert policy for ARES messaging

-- Allow authenticated users to create notifications (message, like, save)
create policy "Authenticated users can create notifications"
on public.notifications for insert
to authenticated
with check (true);

-- Enable realtime for messages and notifications
alter table public.messages replica identity full;
alter table public.notifications replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.messages;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.notifications;
exception
  when duplicate_object then null;
end $$;
