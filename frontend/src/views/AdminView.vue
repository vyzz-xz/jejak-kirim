<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { isMock, listParticipants, registerParticipant } from '../services/shipmentService'
import { ROLES, ROLE_DESC, ROLE_NUM, ROLE_DARI_NUM, ACCOUNTS } from '../constants'

const PERAN_DAFTAR = ['pengirim', 'gudang', 'kurir', 'penerima']
const RIWAYAT = 'jejakkirim.pendaftaran'
const DIHAPUS = 'jejakkirim.dihapus'

function bacaRiwayat() {
  try {
    const d = JSON.parse(localStorage.getItem(RIWAYAT))
    return Array.isArray(d) ? d : []
  } catch {
    return []
  }
}

function bacaDihapus() {
  try {
    const d = JSON.parse(localStorage.getItem(DIHAPUS))
    return Array.isArray(d) ? d : []
  } catch {
    return []
  }
}

const alamat = ref('')
const peran = ref('pengirim')
const peserta = ref([])
const pesan = ref(null)
const sibuk = ref(false)
const riwayat = ref(bacaRiwayat())
const dihapus = ref(bacaDihapus())
let timer

// Riwayat pendaftaran disimpan di browser Admin, supaya bisa dipulihkan setelah contract dideploy ulang
function catat(addr, r) {
  const sisa = riwayat.value.filter((x) => x.address.toLowerCase() !== addr.toLowerCase())
  riwayat.value = [...sisa, { address: addr, role: r }]
  try { localStorage.setItem(RIWAYAT, JSON.stringify(riwayat.value)) } catch { /* abaikan */ }

  // Kalau sebelumnya pernah dihapus lalu didaftarkan ulang, keluarkan dari daftar dihapus
  dihapus.value = dihapus.value.filter((x) => x.toLowerCase() !== addr.toLowerCase())
  try { localStorage.setItem(DIHAPUS, JSON.stringify(dihapus.value)) } catch { /* abaikan */ }
}

function hapusRiwayat(addr) {
  riwayat.value = riwayat.value.filter(
    (x) => x.address.toLowerCase() !== addr.toLowerCase()
  )
  try {
    localStorage.setItem(RIWAYAT, JSON.stringify(riwayat.value))
  } catch { /* abaikan */ }

  if (!dihapus.value.some((x) => x.toLowerCase() === addr.toLowerCase())) {
    dihapus.value = [...dihapus.value, addr]
    try {
      localStorage.setItem(DIHAPUS, JSON.stringify(dihapus.value))
    } catch { /* abaikan */ }
  }
}

async function muat() {
  if (isMock) return
  try {
    const daftar = await listParticipants()
    peserta.value = daftar.filter(
      (p) => !dihapus.value.some((d) => d.toLowerCase() === p.address.toLowerCase())
    )
  } catch { /* node tidak terjangkau, tampilkan data terakhir */ }
}

async function jalankan(fn, ok) {
  sibuk.value = true
  pesan.value = null
  try {
    await fn()
    pesan.value = { tipe: 'ok', teks: ok }
  } catch (e) {
    pesan.value = { tipe: 'error', teks: e.message }
  } finally {
    sibuk.value = false
    await muat()
  }
}

function daftar() {
  const a = alamat.value.trim()
  if (!a) return
  jalankan(async () => {
    await registerParticipant(a, ROLE_NUM[peran.value])
    catat(a, peran.value)
    alamat.value = ''
  }, `Akun didaftarkan sebagai ${ROLES[peran.value]} dan diberi saldo uji`)
}

function cabut(p) {
  jalankan(() => registerParticipant(p.address, 0), 'Peran dicabut')
}

function hapus(p) {
  jalankan(async () => {
    await registerParticipant(p.address, 0)
    hapusRiwayat(p.address)
    peserta.value = peserta.value.filter(
      (item) => item.address.toLowerCase() !== p.address.toLowerCase()
    )
  }, 'Alamat akun dihapus dari daftar')
}

function pulihkan() {
  jalankan(async () => {
    for (const r of riwayat.value) {
      const ada = peserta.value.find((p) => p.address.toLowerCase() === r.address.toLowerCase())
      if (ada && ROLE_DARI_NUM[ada.role] === r.role) continue
      await registerParticipant(r.address, ROLE_NUM[r.role])
    }
  }, 'Pendaftaran dipulihkan dari riwayat')
}

const label = (p) => ROLES[ROLE_DARI_NUM[p.role]] ?? 'Dicabut'
const saldo = (p) => (Number.isFinite(Number(p.balance)) ? Number(p.balance).toFixed(2) + ' ETH' : '-')

onMounted(() => {
  muat()
  timer = setInterval(muat, 4000)
})
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <h1>Admin</h1>
  <p class="lead">Admin mendaftarkan akun ke peran lewat smart contract. Akun yang belum didaftarkan tidak bisa masuk sebagai petugas.</p>

  <!-- Mode dummy -->
  <template v-if="isMock">
    <div class="panel table-wrap">
      <table class="table">
        <thead><tr><th>Peran</th><th>Tugas</th><th>Alamat akun</th></tr></thead>
        <tbody>
          <tr v-for="(label, r) in ROLES" :key="r">
            <td><strong>{{ label }}</strong></td>
            <td>{{ ROLE_DESC[r] }}</td>
            <td class="addr">{{ ACCOUNTS[r] }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="hint">Pendaftaran akun hanya tersedia di mode blockchain.</p>
  </template>

  <!-- Mode blockchain -->
  <template v-else>
    <p v-if="pesan" class="msg" :class="pesan.tipe" role="status">{{ pesan.teks }}</p>
    <div class="split">
      <section>
        <h2>Daftarkan akun</h2>
        <div class="panel panel-pad">
          <label for="alamat">Alamat akun</label>
          <input id="alamat" v-model="alamat" placeholder="0x…" @keyup.enter="daftar" />
          <label for="peran">Peran</label>
          <select id="peran" v-model="peran">
            <option v-for="r in PERAN_DAFTAR" :key="r" :value="r">{{ ROLES[r] }}</option>
          </select>
          <p class="hint">Alamat disalin dari halaman Masuk di perangkat tujuan. Akun juga diberi saldo uji untuk biaya transaksi.</p>
          <div class="form-actions">
            <button :disabled="sibuk || !alamat.trim()" @click="daftar">Daftarkan akun</button>
          </div>
        </div>
        <button v-if="riwayat.length" class="ghost" :disabled="sibuk" @click="pulihkan">
          Pulihkan pendaftaran ({{ riwayat.length }} akun)
        </button>
      </section>

      <section>
        <h2>Akun terdaftar</h2>
        <div class="panel table-wrap">
          <table class="table">
            <thead><tr><th>Peran</th><th>Alamat akun</th><th>Saldo</th><th></th></tr></thead>
            <tbody>
              <tr v-if="!peserta.length">
                <td colspan="4">Belum ada akun terdaftar.</td>
              </tr>
              <tr v-for="p in peserta" :key="p.address">
                <td><strong>{{ label(p) }}</strong></td>
                <td class="addr">{{ p.address }}</td>
                <td>{{ saldo(p) }}</td>
                <td>
                  <div v-if="p.role >= 2 || p.role === 0" class="aksi-tombol">
                    <button v-if="p.role >= 2" class="ghost kecil" :disabled="sibuk" @click="cabut(p)">Cabut</button>
                    <button class="ghost kecil" :disabled="sibuk" @click="hapus(p)">Hapus</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </template>
</template>

<style scoped>
.aksi-tombol {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
</style>