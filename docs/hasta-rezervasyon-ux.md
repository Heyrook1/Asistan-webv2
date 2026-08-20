# Hasta Rezervasyon — UX pass (post Sprint 2)

## Shipped in this pass

| Surface | Change |
|---------|--------|
| `/client/profile` | Real login/register + editable profile (`ClientProfilePanel`) |
| `/client/bookings` | Stronger empty/auth gates + “Yeni randevu” + rebook via `/book/{slug}` |
| `/book` success | CTAs → klinik bul / randevularım |
| Appointments API | Returns `clinic.slug` for deep rebook |

## Product paths

1. **Guest:** `/client` → clinics → `/book/{slug}` (3 steps) → clinic panel  
2. **Logged-in:** profile auth → `/client/bookings` manage → rebook  

## Still next (Sprint 3)

SMS/WhatsApp confirm + reminder (table-stakes channel).
