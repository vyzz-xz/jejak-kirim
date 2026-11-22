    import { Wallet } from 'ethers'

    // Identitas perangkat = pasangan alamat dan kunci privat yang tersimpan di browser ini.
    // Cukup untuk jaringan uji. Sistem sungguhan memakai wallet seperti MetaMask atau perangkat keras.
    const KEY_DAFTAR = 'jejakkirim.identitas'
    const KEY_AKTIF = 'jejakkirim.aktif'

    function bacaDaftar() {
    try {
        const d = JSON.parse(localStorage.getItem(KEY_DAFTAR))
        return Array.isArray(d) ? d : []
    } catch {
        return []
    }
    }
    function simpanDaftar(d) {
    try { localStorage.setItem(KEY_DAFTAR, JSON.stringify(d)) } catch { /* abaikan */ }
    }

    // Hanya alamat yang dikembalikan, kunci privat tidak pernah keluar dari file ini
    export function daftarIdentitas() {
    return bacaDaftar().map((i) => ({ address: i.address }))
    }

    export function buatIdentitas() {
    const w = Wallet.createRandom()
    simpanDaftar([...bacaDaftar(), { address: w.address, key: w.privateKey }])
    return w.address
    }

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

    export function setAktif(address) {
    try {
        if (address) localStorage.setItem(KEY_AKTIF, address)
        else localStorage.removeItem(KEY_AKTIF)
    } catch { /* abaikan */ }
    }

    // Kunci identitas yang sedang dipakai, dipakai layanan untuk menandatangani transaksi
    export function aktifKey() {
    try {
        const a = localStorage.getItem(KEY_AKTIF)
        return bacaDaftar().find((i) => i.address === a)?.key ?? null
    } catch {
        return null
    }
    }