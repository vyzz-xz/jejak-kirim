export const ROLES = {
    admin: 'Admin',
    pengirim: 'Pengirim',
    gudang: 'Gudang',
    kurir: 'Kurir',
    penerima: 'Penerima',
}

// Urutan sama dengan enum Status di smart contract (0 = belum ada)
export const STATUS_LABEL = ['-', 'Dibuat', 'Di Gudang', 'Dalam Perjalanan', 'Tiba di Tujuan', 'Diterima']

// DUMMY: alamat palsu. Nanti diganti alamat akun dari node blockchain.
const addr = (n) => '0x' + String(n).padStart(40, '0')
export const ACCOUNTS = {
    admin: addr(1),
    pengirim: addr(2),
    gudang: addr(3),
    kurir: addr(4),
    penerima: addr(5),
}

export const short = (a) => a.slice(0, 6) + '…' + a.slice(-4)

export const ROLE_DESC = {
    admin: 'Memberi peran ke akun lain.',
    pengirim: 'Membuat pengiriman baru.',
    gudang: 'Menerima paket yang baru dibuat.',
    kurir: 'Membawa paket dan menandai saat tiba.',
    penerima: 'Mengonfirmasi paket sudah diterima.',
}

// Urutan peran sesuai perjalanan paket
export const CHAIN = ['pengirim', 'gudang', 'kurir', 'penerima']