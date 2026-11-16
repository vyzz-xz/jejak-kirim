import { JsonRpcProvider, Contract, ZeroHash } from 'ethers'
import abi from '../contracts/abi.json'
import deployed from '../contracts/address.json'
import { ACCOUNTS } from '../constants'

// PENTING: objek ethers disimpan sebagai variabel biasa, jangan dimasukkan ke ref/reactive.
// Alamat RPC default mengikuti alamat web, jadi device lain otomatis menunjuk ke laptop host.
const rpcUrl = import.meta.env.VITE_RPC_URL || `http://${window.location.hostname}:8545`
const provider = new JsonRpcProvider(rpcUrl, undefined, { batchMaxCount: 1 })
const contract = new Contract(deployed.address, abi, provider)

// Mengambil alasan penolakan dari contract supaya pesan di layar jelas
function pesanError(e) {
    const sumber = [e?.reason, e?.revert?.args?.[0], e?.info?.error?.message, e?.shortMessage, e?.message]
    for (const s of sumber) {
        if (typeof s !== 'string') continue
        const m = s.match(/reason string '([^']+)'/)
        if (m) return m[1]
    }
    if (typeof e?.reason === 'string') return e.reason
    if (typeof e?.revert?.args?.[0] === 'string') return e.revert.args[0]

    const teks = String(e?.shortMessage || e?.message || '')
    if (e?.code === 'NETWORK_ERROR' || /fetch|network|ECONNREFUSED|detect network/i.test(teks)) {
        return 'Tidak bisa terhubung ke node blockchain. Pastikan node berjalan dan alamat RPC benar'
    }
    if (/could not decode result data/i.test(teks)) {
        return 'Contract tidak ditemukan di node. Jalankan deploy ulang lalu muat ulang halaman'
    }
    return teks || 'Transaksi gagal'
}

// Menjalankan transaksi memakai akun sesuai peran, lalu menunggu konfirmasi
async function tulis(role, fn, ...args) {
    try {
        const signer = await provider.getSigner(ACCOUNTS[role])
        const tx = await contract.connect(signer)[fn](...args)
        await tx.wait()
    } catch (e) {
        throw new Error(pesanError(e))
    }
}

async function baca(fn) {
  try {
    return await fn()
  } catch (e) {
    throw new Error(pesanError(e))
  }
}

// Mengubah data dari contract ke bentuk yang dipakai tampilan
async function bacaShipment(id, denganRiwayat) {
  const s = await contract.getShipment(id)
  let history = []
  if (denganRiwayat) {
    const h = await contract.getHistory(id)
    history = Array.from(h).map((e) => ({
      status: Number(e.status),
      actor: e.actor,
      time: Number(e.timestamp) * 1000, // contract memakai detik, tampilan memakai milidetik
      hash: e.evidenceHash === ZeroHash ? '' : e.evidenceHash,
    }))
  }
  return {
    id: s.id,
    deskripsi: s.deskripsi,
    pengirim: s.pengirim,
    penerima: s.penerima,
    status: Number(s.status),
    history,
  }
}

export const createShipment = (role, id, deskripsi, penerima) =>
  tulis(role, 'createShipment', id, deskripsi, penerima)
export const receiveAtWarehouse = (role, id) => tulis(role, 'receiveAtWarehouse', id, ZeroHash)
export const startDelivery = (role, id) => tulis(role, 'startDelivery', id)
export const markDelivered = (role, id) => tulis(role, 'markDelivered', id, ZeroHash)
export const confirmReceived = (role, id) => tulis(role, 'confirmReceived', id)

export const listShipments = () =>
  baca(async () => {
    const ids = Array.from(await contract.getShipmentIds())
    return Promise.all(ids.map((id) => bacaShipment(id, false)))
  })
export const getShipment = (id) => baca(() => bacaShipment(id, true))
export const getHistory = (id) => baca(async () => (await bacaShipment(id, true)).history)