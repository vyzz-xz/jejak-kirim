import accounts from './contracts/accounts.json'

export const ROLES = {
  admin: 'Admin',
  pengirim: 'Pengirim',
  gudang: 'Gudang',
  kurir: 'Kurir',
  penerima: 'Penerima',
}

// Urutan sama dengan enum Status di smart contract (0 = belum ada)
export const STATUS_LABEL = ['-', 'Dibuat', 'Di Gudang', 'Dalam Perjalanan', 'Tiba di Tujuan', 'Diterima']

// Alamat akun demo, dibuat otomatis oleh skrip deploy Iqbal
export const ACCOUNTS = accounts

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