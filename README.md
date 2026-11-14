# JejakKirim

Sistem pelacakan dan verifikasi pengiriman barang berbasis blockchain.

## Tentang Proyek

JejakKirim adalah prototipe sistem yang mencatat perjalanan paket dari pengirim sampai penerima pada blockchain menggunakan smart contract. Setiap pihak (pengirim, gudang, kurir, dan penerima) hanya bisa memperbarui status sesuai perannya dan urutan yang ditetapkan, sehingga riwayat pengiriman dapat diverifikasi dan sulit diubah sepihak. Proyek ini dibuat untuk UAS mata kuliah Blockchain dengan tema Blockchain di Bidang Logistik, dan mencakup pencatatan riwayat antar-pihak (B2B) pada jaringan uji lokal, tanpa fitur pembayaran.

## Alur

1. **Pengirim** membuat pengiriman (status *Dibuat*)
2. **Gudang** menerima paket (status *Di Gudang*)
3. **Kurir** memulai pengiriman (status *Dalam Perjalanan*)
4. **Kurir** menandai paket tiba (status *Tiba di Tujuan*)
5. **Penerima** mengonfirmasi (status *Diterima*)
6. Siapa saja dapat memeriksa riwayatnya di halaman **Verifikasi Riwayat**

## Teknologi

| Bagian | Teknologi |
|---|---|
| Frontend | Vue.js, Vue Router, Pinia, Vite |
| Smart contract | Solidity, Hardhat |
| Jaringan uji lokal | Ganache atau Hardhat node |
| Koneksi ke blockchain | ethers.js |

## Struktur Folder

```
jejak-kirim/
├── frontend/     Aplikasi web Vue.js
├── blockchain/   Smart contract, test, skrip deploy
├── docs/         Laporan dan dokumentasi
└── README.md
```

## Panduan Instalasi Lokal (Untuk Tim Developer)
### 1. Install tools yang dibutuhkan

| Tools | Unduh |
|---|---|---|
| Node.js | https://nodejs.org | 
| Git | https://git-scm.com | 
| Visual Studio Code | https://code.visualstudio.com |

### 2. Cek instalasi

Buka terminal **baru**, lalu jalankan:

```
node -v
npm -v
git --version
```

### 3. Atur identitas Git (sekali saja per laptop)

```
git config --global user.name "Nama Lengkap"
git config --global user.email "email-akun-github@contoh.com"
```

### 4. Clone repositori

Pindah ke folder tempat menyimpan proyek (misalnya `C:\`), lalu:

```
git clone https://github.com/vyzz-xz/jejak-kirim.git
cd jejak-kirim
code .
```

### 5. Masuk ke folder frontend

```
cd frontend
```

### 6. Install semua library

```
npm install
```

### 7. Jalankan aplikasi

```
npm run dev
```

### 8. Coba alur aplikasi

1. Pilih **Pengirim**, buat paket baru (misalnya `PKT-002`).
2. Pindah ke **Gudang**, klik **Terima di gudang**.
3. Pindah ke **Kurir**, klik **Mulai kirim**, lalu **Tandai terkirim**.
4. Pindah ke **Penerima**, klik **Konfirmasi diterima**.
5. Buka **Verifikasi Riwayat**, cari `PKT-002`.

## Tim Pengembang
Muhamad Hafiz, Muhammad Iqbal Febrian, Imas Anisa