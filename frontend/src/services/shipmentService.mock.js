import { ACCOUNTS } from '../constants'

// DUMMY: meniru perilaku smart contract. Nama fungsi sengaja sama dengan fungsi contract
// supaya nanti cukup mengganti isi file ini dengan versi ethers.js.
// Catatan: contract asli mengenali pemanggil lewat akun (signer), bukan string peran.

let shipments = [
{
    id: 'PKT-001',
    deskripsi: 'Contoh paket (data simulasi)',
    pengirim: ACCOUNTS.pengirim,
    penerima: ACCOUNTS.penerima,
    status: 1,
    history: [{ status: 1, actor: ACCOUNTS.pengirim, time: Date.now(), hash: '' }],
},
]

const wait = () => new Promise((r) => setTimeout(r, 300)) // meniru waktu transaksi
const copy = (x) => JSON.parse(JSON.stringify(x)) // supaya data asli tidak terubah dari luar

function need(role, required) {
    if (role !== required) throw new Error('Peran tidak berwenang untuk aksi ini')
}

function find(id) {
    const s = shipments.find((x) => x.id === id)
    if (!s) throw new Error('Pengiriman tidak ditemukan')
    return s
}

// Menggeser status hanya jika urutannya benar (state machine)
function step(s, from, to, actor) {
    if (s.status !== from) throw new Error('Status belum sesuai urutan')
    s.status = to
    s.history.push({ status: to, actor, time: Date.now(), hash: '' })
}

export async function createShipment(role, id, deskripsi, penerima) {
    await wait()
    need(role, 'pengirim')
    if (!id) throw new Error('ID wajib diisi')
    if (shipments.some((x) => x.id === id)) throw new Error('ID pengiriman sudah dipakai')
    shipments.push({
    id, deskripsi, pengirim: ACCOUNTS.pengirim, penerima, status: 1,
    history: [{ status: 1, actor: ACCOUNTS.pengirim, time: Date.now(), hash: '' }],
    })
}

export async function receiveAtWarehouse(role, id) {
    await wait(); need(role, 'gudang'); step(find(id), 1, 2, ACCOUNTS.gudang)
}
export async function startDelivery(role, id) {
    await wait(); need(role, 'kurir'); step(find(id), 2, 3, ACCOUNTS.kurir)
}
export async function markDelivered(role, id) {
    await wait(); need(role, 'kurir'); step(find(id), 3, 4, ACCOUNTS.kurir)
}
export async function confirmReceived(role, id) {
    await wait(); need(role, 'penerima'); step(find(id), 4, 5, ACCOUNTS.penerima)
}

export async function listShipments() { await wait(); return shipments.map(copy) }
export async function getShipment(id) { await wait(); return copy(find(id)) }
export async function getHistory(id) { await wait(); return copy(find(id)).history }

// Jumlah "transaksi" dummy = jumlah entri riwayat, supaya angka blok ikut naik
export async function getNetworkInfo() {
  const blok = shipments.reduce((n, s) => n + s.history.length, 0)
  return { mode: 'dummy', rpc: '-', chainId: '-', blockNumber: blok, contract: '-' }
}

// Mode dummy: pendaftaran akun hanya ada di mode blockchain
export async function getRoleOf() {
  return 0
}
export async function listParticipants() {
  return [{ address: ACCOUNTS.penerima, role: 5, balance: '-' }]
}
export async function registerParticipant() {
  throw new Error('Pendaftaran akun hanya tersedia di mode blockchain')
}