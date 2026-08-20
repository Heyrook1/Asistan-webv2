# KKTC e-Fatura / e-SMM boundary (Q4)

**Status:** Shipped 21 Temmuz 2026 (draft + optional API)  
**Not shipped:** TR GİB e-SMM / e-Fatura as present-tense product claim

## Acceptance

Clinic can:

1. Store tax profile (VKN, office, title, address) under **Ayarlar → Fatura**
2. Create a **DRAFT** `ClinicInvoice` from a **COMPLETED** appointment (Ajanda menü → Fatura taslağı)
3. Print / Save as PDF from **Faturalar**
4. Optionally POST to KKTC Maliye when env is set; otherwise stay **READY** (print-only)

## Honest claims

| Say | Do not say |
|-----|------------|
| KKTC e-Fatura taslağı / yazdırılabilir | “e-SMM hazır”, “GİB entegre” |
| API env ile Maliye gönderimi (opsiyonel) | Resmi TR e-Fatura / e-SMM sertifikasyonu |

Claim-bank forbids present-tense `e-SMM hazır` / `GİB entegre`.

## Env (optional submit)

```bash
KKTC_EFATURA_BASE_URL=https://efatura-test.maliye.gov.ct.tr   # or prod
KKTC_EFATURA_BEARER_TOKEN=...   # Keycloak access token
KKTC_EFATURA_VKN=...            # optional override; else Business.taxVkn
```

Adapter: `POST {base}/api/mukellefler/{VKN}/faturalar` with JSON document (`asistan.clinic-invoice.v1`).

Payload shape may need alignment with Maliye’s published schema before production go-live — treat env submit as **pilot**.

## Migrate

```bash
# apply
node scripts/apply-clinic-invoice-kktc.mjs
pnpm prisma generate
```

SQL: `supabase/migrations/20260721000300_clinic_invoice_kktc.sql`

## Code

- `lib/invoicing/*` — calc, document, create-from-appointment, kktc-adapter
- `lib/actions/invoices.ts`
- `/dashboard/faturalar`
- Ayarlar → Fatura
