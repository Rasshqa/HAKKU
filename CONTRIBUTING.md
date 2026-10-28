# Panduan Kontribusi (Contributing Guide)

Terima kasih atas ketertarikan Anda untuk berkontribusi pada pengembangan HAKKU! Kami menyambut baik kontribusi berupa perbaikan bug, peningkatan fitur, perbaikan dokumentasi, atau penambahan basis regulasi hukum Indonesia.

---

## 🛠️ Alur Kerja Pengembangan

### 1. Fork & Clone
```bash
git clone https://github.com/Rasshqa/HAKKU.git
cd HAKKU
```

### 2. Buat Cabang Baru (Branch)
Gunakan format nama cabang deskriptif:
- `feat/<fitur-singkat>` (contoh: `feat/mobile-biometric-auth`)
- `fix/<perbaikan-singkat>` (contoh: `fix/severance-rounding-issue`)
- `docs/<dokumen-singkat>` (contoh: `docs/api-security-guide`)

### 3. Standar Kualitas Wajib Lolos Lokal
Sebelum membuat Pull Request, pastikan seluruh gate kualitas lokal lolos tanpa kesalahan:

**Untuk HAKKU-WEB:**
```bash
cd HAKKU-WEB
npm run lint          # Bebas peringatan & error lint
npm run typecheck     # Validasi tipe TypeScript bebas error
npm test              # 65/65 unit & domain tests lolos
```

**Untuk HAKKU-MOBILE:**
```bash
cd HAKKU-MOBILE
flutter analyze       # Analisis Dart bebas issue
flutter test          # Seluruh widget & unit test lolos
```

### 4. Standar Commit (Conventional Commits)
Gunakan konvensi pesan komit terstruktur:
- `feat(web): ...` atau `feat(mobile): ...`
- `fix(engine): ...`
- `refactor(...): ...`
- `test(...): ...`
- `docs(...): ...`

### 5. Buat Pull Request (PR)
- Berikan deskripsi ringkas mengenai apa yang diubah, dasar hukum (jika terkait pasal), dan bukti pengujian.
- Seluruh pemeriksaan otomatis di GitHub Actions CI/CD wajib berstatus hijau (pass) sebelum PR dapat ditinjau dan digabungkan (*merged*).
