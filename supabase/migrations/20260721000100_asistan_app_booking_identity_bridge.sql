-- ============================================================================
-- S2 follow-up: asistan_app must book + resolve identity safely
-- Date: 2026-07-21
-- ============================================================================

grant asistan_identity to asistan_app;

-- BookingIdempotency is claimed on the public booking path (asistan_app).
drop policy if exists bookingidempotency_deny_app on public."BookingIdempotency";
drop policy if exists bookingidempotency_app on public."BookingIdempotency";
create policy bookingidempotency_app on public."BookingIdempotency"
  for all to asistan_app
  using (true)
  with check (true);
