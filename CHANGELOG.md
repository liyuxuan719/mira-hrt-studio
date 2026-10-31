# Changelog

## 2.0.0 — 2026-11-01

- Export all laboratory results as a UTF-8 CSV with explicit canonical units, timestamps, notes, and demo provenance.
- Validate JSON backups before replacement: reject unrelated files, unsupported schemas, malformed measurements, unknown medications, and duplicate record IDs.
- Show incoming/current record counts before import, retain demo labels, and commit browser storage before replacing the displayed records.
- Harden CSV formula escaping for notes beginning with whitespace or control characters.
- Retain v1 backup/storage compatibility and existing clinical models and reference information.
