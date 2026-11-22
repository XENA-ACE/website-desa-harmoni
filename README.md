# Website Informasi dan Pelayanan Publik Desa Harmoni

Prototype statis berbasis HTML, CSS, JavaScript, Bootstrap 5.3.8, dan Bootstrap Icons 1.13.1.

## Menjalankan secara lokal

Buka folder proyek melalui Visual Studio Code, lalu jalankan `index.html` menggunakan Live Server. Halaman awal akan mengarahkan ke `users/index.html`.

## Publikasi dengan GitHub Pages

1. Buat repository GitHub bernama `website-desa-harmoni`.
2. Unggah **isi folder proyek ini** ke root repository (file `index.html`, folder `admin`, `assets`, `css`, `js`, dan `users` harus terlihat langsung di halaman utama repository).
3. Buka **Settings → Pages**.
4. Pada **Build and deployment**, pilih **Deploy from a branch**.
5. Pilih branch `main` dan folder `/(root)`, lalu klik **Save**.
6. Tunggu proses publikasi selesai. URL situs biasanya berbentuk `https://USERNAME.github.io/website-desa-harmoni/`.

## Batasan prototype

- Situs ini merupakan prototype frontend statis; tidak menggunakan backend atau database.
- Data pengajuan, pengumuman, informasi, dan kunjungan disimpan di `localStorage` browser. Data tidak tersinkron antarperangkat, browser, atau pengguna.
- Login Admin hanya simulasi frontend, bukan sistem autentikasi yang aman. Jangan gunakan untuk melindungi data atau layanan sungguhan.
- Gunakan data fiktif untuk demonstrasi. Jangan memasukkan NIK, nomor telepon, atau data pribadi nyata.
- Bootstrap dan Bootstrap Icons dimuat dari CDN sehingga koneksi internet diperlukan agar tampilannya lengkap.
