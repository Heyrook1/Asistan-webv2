# AI Clinical Note Generator — boundary (parked)

**Status:** Parked (18 Temmuz 2026)  
**Shipped instead:** Editable **SOAP template** on the patient chart (no speech, no model)

## Request (aspirational)

Doctor speaks during/after appointment → real-time transcription → structured SOAP note in chart. Claimed “30 min/doctor/day.”

## Why parked

| Reason | Detail |
|--------|--------|
| Claim-bank | Present-tense **“AI-powered”** is forbidden |
| Product boundary | Clinical light = notes / files / printable Rx — not ambient scribe |
| KVKK / processors | Live voice PHI → STT + LLM vendors needs DPA, consent, audit, retention |
| Clinical risk | Auto-SOAP into chart without explicit doctor edit/sign-off is unsafe |
| Unproven claim | “30 min/day” requires a measured pilot — do not market |

## What we ship now

- Structured **SOAP** fields (S/O/A/P) → existing `PatientNote` as formatted text
- Doctor (or staff with `medical_note.create`) edits and saves — human-authored
- Display parses SOAP markers for a clear chart layout
- Code: `lib/clinical-notes/soap.ts`, note dialog on `/dashboard/hastalar/[id]`

**Say:** “Yapılandırılmış SOAP not şablonu”  
**Do not say:** AI scribe, real-time transcription, auto-chart, “paper’dan geçme sebebi”

## Unlock conditions (all required)

1. Written processor list + DPA for STT/LLM; patient/clinic consent UX  
2. Human-in-the-loop: draft only until doctor confirms into chart  
3. Feature flag off by default; clinic opt-in  
4. Measured time study before any “minutes saved” claim  
5. Explicit claim-bank amendment

Until then: template only.

## Related

- [`product-boundary.md`](./product-boundary.md)
- [`claim-bank.md`](./claim-bank.md)
- [`patient-health-timeline.md`](./patient-health-timeline.md) — notes appear on clinic timeline as `note` kind
