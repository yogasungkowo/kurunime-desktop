# Kurunime Desktop

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Windows%20%7C%20Linux%20%7C%20macOS-blue.svg?style=for-the-badge&logo=tauri" alt="Platform" />
  <img src="https://img.shields.io/badge/Framework-Tauri%20v2-orange.svg?style=for-the-badge&logo=tauri" alt="Tauri v2" />
  <img src="https://img.shields.io/badge/Frontend-React%2019-61DAFB.svg?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Language-TypeScript-3178C6.svg?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38B2AC.svg?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Author-yogasungkowo-purple.svg?style=for-the-badge" alt="Author" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="License" />
</p>

Aplikasi desktop modern, elegan, dan sangat ringan untuk streaming anime subtitle Indonesia serta membaca komik (manga, manhwa, manhua) secara gratis tanpa gangguan iklan pop-up. Dibangun dengan performa tinggi menggunakan arsitektur **Tauri 2**, **React 19**, **TypeScript**, dan **Tailwind CSS v4**.

Dibuat & dikembangkan oleh **[@yogasungkowo](https://github.com/yogasungkowo)**.

---

## ✨ Fitur Utama

- **🚀 Ultra-Lightweight & Hemat Memori**: Memanfaatkan native webview via runtime **Tauri 2 (Rust)** dengan konsumsi RAM yang jauh lebih minim dibandingkan Electron (~50–90 MB RAM).
- **📺 Streaming Anime Subtitle Indonesia**: Tonton anime ongoing dan completed dengan embed player responsif, multi-server mirror, serta navigasi episode berikutnya/sebelumnya.
- **📥 Panel Unduhan (Download Links) Terstruktur**: Menyediakan tautan download per episode berdasarkan resolusi (1080p, 720p, 480p, 360p) dan format (MP4/MKV), lengkap dengan info ukuran file dan tombol salin link untuk *Internet Download Manager (IDM)* atau *Free Download Manager (FDM)*.
- **📖 Pembaca Komik (Manga/Manhwa/Manhua)**: Reader komik vertikal (webtoon-style) terintegrasi dengan lazy-loading gambar, dropdown navigasi chapter, dan mode layar penuh (*fullscreen*).
- **📅 Jadwal Rilis Anime Terjadwal**: Pantau update anime mingguan dari hari Senin hingga Minggu yang diperbarui secara berkala.
- **🔖 Bookmark & Riwayat Lokal**: Simpan judul anime dan komik favorit serta riwayat tontonan/bacaan terakhir secara instan di penyimpanan lokal (*localStorage*) tanpa perlu login akun.
- **🎨 UI Modern & Dark Theme Premium**: Antarmuka gelap estetik dengan hero carousel interaktif, badge status, modal responsif yang dapat ditutup dengan klik luar atau tombol `Esc`, serta kontrol pencarian instan.

---

## 🛠️ Tech Stack

- **Desktop Framework**: [Tauri v2](https://v2.tauri.app/) (Rust Core)
- **Frontend Library**: [React 19](https://react.dev/)
- **Programming Language**: [TypeScript](https://www.typescriptlang.org/) (v6)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Build Tool & Bundler**: [Vite](https://vitejs.dev/)
- **Storage**: Browser LocalStorage API (zero-configuration, offline cache)
- **Target OS**: Windows 10/11 (x64), Linux, macOS

---

## 📱 Modul & Tampilan Aplikasi

| Modul | Fungsi Utama |
|---|---|
| **Beranda Anime** | Hero banner interaktif, daftar anime Ongoing & Completed, pencarian anime instan |
| **Katalog Komik** | Eksplorasi manga/manhwa/manhua, filter tipe, genre, status, sorting, dan peringkat terpopuler |
| **Jadwal Rilis** | Informasi jadwal penayangan episode anime per hari (Senin – Minggu) |
| **Bookmark Saya** | Koleksi anime dan komik yang disimpan untuk akses cepat beserta aksi hapus langsung |
| **Riwayat Terakhir** | Riwayat tontonan episode anime dan bacaan chapter komik terakhir secara kronologis |
| **Video Player Modal** | Pemutar streaming multi-server mirror, navigasi episode, dan panel download multi-resolusi |
| **Comic Reader Modal** | Pembaca chapter komik mode vertikal yang mulus dengan navigasi chapter cepat |

---

## 🚀 Cara Menjalankan (Getting Started)

### Prasyarat Sistem
Pastikan perangkat Anda telah terpasang:
- [Node.js](https://nodejs.org/) (v18.0 atau yang lebih baru)
- [Rust & Cargo](https://www.rust-lang.org/tools/install) (versi stable terbaru)
- Untuk pengguna Windows: **C++ Build Tools** (via Visual Studio Installer dengan workload *"Desktop development with C++"*)

### Instalasi & Menjalankan Mode Development

1. **Clone repository ini:**
   ```bash
   git clone https://github.com/yogasungkowo/kurunime-desktop.git
   cd kurunime-desktop
   ```

2. **Install dependensi frontend:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variable:**
   Salin file template `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
   *(Atau salin secara manual di Windows Explorer)*

4. **Jalankan aplikasi desktop dalam mode development:**
   ```bash
   npm run tauri dev
   ```
   *Vite dan Tauri akan mengompilasi backend Rust serta frontend React, lalu membuka window aplikasi Kurunime Desktop.*

---

## ⚙️ Konfigurasi Environment (`.env`)

Aplikasi menggunakan REST API eksternal untuk sumber data anime dan komik:

| Variabel | Nilai Default | Deskripsi |
|---|---|---|
| `VITE_ANIME_API_URL` | `https://anime-api.prasunk.my.id` | URL base endpoint API scraping anime (Otakudesu) |
| `VITE_COMIC_API_URL` | `https://manga-api.prasunk.my.id` | URL base endpoint API scraping komik (Komikcast) |

> **Catatan:** Anda dapat mengarahkan URL ke backend lokal (misal: `http://localhost:3001` atau `http://localhost:3002`) jika Anda menjalankan service backend scraper sendiri.

---

## 📦 Build Installer Aplikasi (Production)

Untuk menghasilkan binary `.msi` / `.exe` (installer mandiri) yang siap didistribusikan:

```bash
npm run tauri build
```

Installer yang telah selesai di-bundle akan otomatis tersedia di folder:
```
src-tauri/target/release/bundle/msi/
src-tauri/target/release/bundle/nsis/
```

---

## 👨‍💻 Author

- **yogasungkowo**
  - GitHub: [@yogasungkowo](https://github.com/yogasungkowo)

---

## 📄 Lisensi

Proyek ini didistribusikan di bawah lisensi [MIT](LICENSE). Bebas digunakan, dimodifikasi, dan dikembangkan untuk keperluan pribadi atau edukasi.

---

## ⚠️ Disclaimer

Aplikasi ini merupakan aplikasi client tidak resmi (*unofficial client*) yang dibuat untuk tujuan pembelajaran, eksperimen teknologi desktop modern (Tauri & React), dan edukasi open-source. Seluruh data konten media, video streaming, subtitle, gambar cover, dan komik adalah hak milik masing-masing penerbit, lisensi, dan pemilik hak cipta aslinya.
