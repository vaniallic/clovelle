# Clovelle — Keuangan

Web app buat catat belanja, penjualan, HPP, dan kas usaha yang berputar tiap batch Clovelle.
Datanya tersimpan di database (Supabase) jadi kamu dan temen kamu bisa buka dan input bareng,
dari device masing-masing, dan langsung sinkron.

## 1. Setup database (Supabase, gratis)

1. Buka [supabase.com](https://supabase.com), daftar/login (bisa pakai GitHub).
2. Klik **New Project**. Kasih nama bebas (misal `clovelle`), bikin password database (simpan aja,
   jarang kepake), pilih region Singapore biar paling deket. Tunggu ±2 menit sampai project siap.
3. Di sidebar kiri, klik **SQL Editor** > **New query**. Buka file `supabase/schema.sql` di folder
   ini, copy semua isinya, paste ke situ, klik **Run**. Ini bikin semua tabel yang dibutuhin.
4. Di sidebar kiri, klik **Project Settings** (ikon gear) > **API**. Kamu bakal butuh dua hal:
   - **Project URL** → ini buat `VITE_SUPABASE_URL`
   - **anon public key** → ini buat `VITE_SUPABASE_ANON_KEY`

## 2. Jalanin di komputer sendiri

```bash
cp .env.example .env
```

Buka file `.env`, isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` dengan nilai dari langkah 1.
`VITE_APP_PASSWORD` opsional — isi kalau mau app-nya dikunci kata sandi bareng (biar nggak
sembarang orang yang punya link bisa buka & edit data).

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`.

## 3. Deploy ke Vercel biar temenmu bisa akses

1. Push folder ini ke repo GitHub (lihat panduan push yang udah aku kasih sebelumnya).
2. Buka [vercel.com](https://vercel.com), login pakai GitHub, klik **Add New → Project**, pilih
   repo-nya.
3. Sebelum klik Deploy, buka bagian **Environment Variables**, tambahin tiga ini (nilai yang sama
   kayak di `.env`):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_APP_PASSWORD` (kalau dipakai)
4. Klik **Deploy**. Setelah jadi, link-nya tinggal dikasih ke temen kamu. Kalau pakai kata sandi,
   kasih tau juga kata sandinya sekali — dia cuma perlu masukin sekali per browser.

Kalau nanti ganti/nambah environment variable di Vercel, project perlu di-**Redeploy** ulang biar
kebaca (menu Deployments > titik tiga di deployment terakhir > Redeploy).

## Soal data & keamanan

- Semua orang yang buka link app-nya dan tau kata sandi bisa lihat dan ubah data yang sama
  (itu yang bikin kamu & temenmu bisa kerja bareng).
- Kata sandi di `VITE_APP_PASSWORD` itu level sederhana (nggak ter-enkripsi, cuma dicek di
  browser), cukup buat jagain dari orang random yang nemu link, tapi bukan keamanan tingkat
  bank. Jangan pakai buat data yang sangat sensitif.
- Supabase free tier cukup buat skala usaha kecil-menengah (500MB database, no expiry selama
  project aktif dipakai).
