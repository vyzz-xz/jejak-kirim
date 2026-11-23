import { JsonRpcProvider, Contract, Wallet, ZeroHash, isAddress, parseEther, formatEther } from 'ethers'
import abi from '../contracts/abi.json'
import deployed from '../contracts/address.json'
import { aktifKey } from './identity'

// Objek ethers disimpan sebagai variabel biasa, bukan ref/reactive Vue (bisa error karena Proxy)
// Alamat node mengikuti alamat web, jadi perangkat lain otomatis tersambung ke laptop host
const rpcUrl = import.meta.env.VITE_RPC_URL || `http://${window.location.hostname}:8545`
// Koneksi ke node blockchain
const provider = new JsonRpcProvider(rpcUrl, undefined, { batchMaxCount: 1 })
// Objek untuk memanggil fungsi smart contract
const contract = new Contract(deployed.address, abi, provider)

// Mengubah error teknis menjadi pesan yang mudah dipahami
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
  if (/insufficient funds/i.test(teks)) {
    return 'Saldo akun kosong. Minta Admin memberi saldo uji'
  }
  if (e?.code === 'NETWORK_ERROR' || /fetch|network|ECONNREFUSED|detect network/i.test(teks)) {
    return 'Tidak bisa terhubung ke node blockchain. Pastikan node berjalan dan alamat RPC benar'
  }
  if (/could not decode result data/i.test(teks)) {
    return 'Contract tidak ditemukan di node. Jalankan deploy ulang lalu muat ulang halaman'
  }
  return teks || 'Transaksi gagal'
}

// Akun yang menandatangani transaksi = identitas aktif di perangkat ini
function penandatangan() {
  const kunci = aktifKey()
  if (!kunci) throw new Error('Belum masuk dengan identitas di perangkat ini')
  return new Wallet(kunci, provider)
}

// Mengirim transaksi ke contract lalu menunggu sampai masuk blok
async function tulis(fn, ...args) {
  try {
    const tx = await contract.connect(penandatangan())[fn](...args)
    await tx.wait()
  } catch (e) {
    throw new Error(pesanError(e))
  }
}

// Membungkus fungsi baca agar error ikut diterjemahkan
async function baca(fn) {
  try {
    return await fn()
  } catch (e) {
    throw new Error(pesanError(e))
  }
}

// Membaca satu paket dan menyesuaikan tipe datanya untuk tampilan
async function bacaShipment(id, denganRiwayat) {
  const s = await contract.getShipment(id)
  let history = []
  if (denganRiwayat) {
    const h = await contract.getHistory(id)
    history = Array.from(h).map((e) => ({
      status: Number(e.status),
      actor: e.actor,
      time: Number(e.timestamp) * 1000, // detik -> milidetik
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

// Lima aksi transaksi, masing-masing memanggil fungsi contract lewat tulis()
export const createShipment = (role, id, deskripsi, penerima) =>
  tulis('createShipment', id, deskripsi, penerima)
export const receiveAtWarehouse = (role, id) => tulis('receiveAtWarehouse', id, ZeroHash)
export const startDelivery = (role, id) => tulis('startDelivery', id)
export const markDelivered = (role, id) => tulis('markDelivered', id, ZeroHash)
export const confirmReceived = (role, id) => tulis('confirmReceived', id)

// Daftar semua paket untuk dashboard
export const listShipments = () =>
  baca(async () => {
    const ids = Array.from(await contract.getShipmentIds())
    return Promise.all(ids.map((id) => bacaShipment(id, false)))
  })
// Satu paket beserta riwayatnya (halaman Verifikasi)
export const getShipment = (id) => baca(() => bacaShipment(id, true))
// Riwayat perubahan satu paket
export const getHistory = (id) => baca(async () => (await bacaShipment(id, true)).history)

// Info jaringan untuk chip di bar atas
export const getNetworkInfo = () =>
  baca(async () => {
    const [blockNumber, net] = await Promise.all([provider.getBlockNumber(), provider.getNetwork()])
    return {
      mode: 'blockchain',
      rpc: rpcUrl,
      chainId: Number(net.chainId),
      blockNumber,
      contract: deployed.address,
    }
  })

// Peran sebuah akun menurut smart contract (0 = belum terdaftar)
export const getRoleOf = (address) => baca(async () => Number(await contract.roles(address)))

// Daftar akun terdaftar beserta peran dan saldonya
export const listParticipants = () =>
  baca(async () => {
    const events = await contract.queryFilter(contract.filters.RoleAssigned(), 0)
    const alamat = [...new Set(events.map((e) => e.args.account))]
    return Promise.all(
      alamat.map(async (a) => ({
        address: a,
        role: Number(await contract.roles(a)),
        balance: formatEther(await provider.getBalance(a)),
      }))
    )
  })

// Admin mendaftarkan akun ke peran, lalu mengirim saldo uji (faucet) jika perlu
export async function registerParticipant(address, roleNum) {
  try {
    if (!isAddress(address)) throw new Error('Alamat akun tidak valid')
    const signer = penandatangan()
    const tx = await contract.connect(signer).assignRole(address, roleNum)
    await tx.wait()
    if (roleNum !== 0 && (await provider.getBalance(address)) < parseEther('0.5')) {
      const kirim = await signer.sendTransaction({ to: address, value: parseEther('1') })
      await kirim.wait()
    }
  } catch (e) {
    throw new Error(pesanError(e))
  }
}