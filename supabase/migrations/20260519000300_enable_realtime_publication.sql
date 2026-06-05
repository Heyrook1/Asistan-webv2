-- ============================================================================
-- Enable Supabase Realtime for notifications and messaging
-- Date: 2026-05-19
-- ============================================================================

alter table "Notification" replica identity full;
alter table "Message" replica identity full;
alter table "MessageReaction" replica identity full;
alter table "ConversationParticipant" replica identity full;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'Notification'
  ) then
    alter publication supabase_realtime add table "Notification";
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'Message'
  ) then
    alter publication supabase_realtime add table "Message";
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'MessageReaction'
  ) then
    alter publication supabase_realtime add table "MessageReaction";
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'ConversationParticipant'
  ) then
    alter publication supabase_realtime add table "ConversationParticipant";
  end if;
end $$;
