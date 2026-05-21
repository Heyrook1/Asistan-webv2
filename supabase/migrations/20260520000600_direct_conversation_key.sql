-- ============================================================================
-- Direct conversation identity
-- Date: 2026-05-20
--
-- A direct message is identified by the owning business and the sorted pair of
-- user ids. This avoids relation-filter ambiguity and prevents duplicate DMs
-- under concurrent "start conversation" requests.
-- ============================================================================

alter table "Conversation"
  add column if not exists "directKey" text;

with direct_pairs as (
  select
    c.id,
    c."businessId",
    string_agg(cp."userId"::text, ':' order by cp."userId"::text) as direct_key
  from "Conversation" c
  join "ConversationParticipant" cp
    on cp."conversationId" = c.id
   and cp."isActive" = true
  where c."isGroup" = false
  group by c.id, c."businessId"
  having count(*) = 2
),
ranked_pairs as (
  select
    id,
    "businessId",
    direct_key,
    row_number() over (partition by "businessId", direct_key order by id) as rn
  from direct_pairs
)
update "Conversation" c
set "directKey" = rp.direct_key
from ranked_pairs rp
where c.id = rp.id
  and rp.rn = 1
  and c."directKey" is null;

create unique index if not exists "Conversation_business_directKey_unique"
  on "Conversation" ("businessId", "directKey")
  where "directKey" is not null;

create index if not exists "Conversation_business_directKey_idx"
  on "Conversation" ("businessId", "directKey");
