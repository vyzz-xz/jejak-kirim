import { Wallet } from 'ethers'

// Identitas = alamat + kunci privat, disimpan di browser
const KEY_DAFTAR = 'jejakkirim.identitas'
const KEY_AKTIF = 'jejakkirim.aktif'

// Membaca daftar identitas dari browser (kosong kalau belum ada)
function bacaDaftar() {
    try {
        const d = JSON.parse(localStorage.getItem(KEY_DAFTAR))
        return Array.isArray(d) ? d : []
    } catch {
        return []
    }
}

// Menyimpan daftar identitas ke browser
function simpanDaftar(d) {
  try { localStorage.setItem(KEY_DAFTAR, JSON.stringify(d)) } catch { /* abaikan */ }
}

// Daftar alamat publik untuk tampilan (kunci privat tidak ikut)
export function daftarIdentitas() {
    return bacaDaftar().map((i) => ({ address: i.address }))
}

// Membuat pasangan alamat dan kunci baru langsung di browser
export function buatIdentitas() {
    const w = Wallet.createRandom()
    simpanDaftar([...bacaDaftar(), { address: w.address, key: w.privateKey }])
    return w.address
}

// Memasukkan kunci akun yang sudah ada, misalnya kunci Admin
export function imporIdentitas(kunciPrivat) {
    const mentah = kunciPrivat.trim()
    const hex = mentah.startsWith('0x') ? mentah : '0x' + mentah
    let w
    try {
        w = new Wallet(hex)
    } catch {
        throw new Error('Kunci privat tidak valid')
    }
    const daftar = bacaDaftar()
    if (!daftar.some((i) => i.address === w.address)) {
        simpanDaftar([...daftar, { address: w.address, key: w.privateKey }])
    }
    return w.address
}

// Menandai identitas yang sedang dipakai masuk
export function setAktif(address) {
    try {
    if (address) localStorage.setItem(KEY_AKTIF, address)
    else localStorage.removeItem(KEY_AKTIF)
  } catch { /* abaikan */ }
}

// Mengambil kunci identitas aktif untuk menandatangani transaksi
export function aktifKey() {
    try {
        const a = localStorage.getItem(KEY_AKTIF)
        return bacaDaftar().find((i) => i.address === a)?.key ?? null
    } catch {
        return null
    }
}