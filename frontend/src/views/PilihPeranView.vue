<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '../stores/session'
import { isMock, getRoleOf } from '../services/shipmentService'
import { daftarIdentitas, buatIdentitas, imporIdentitas } from '../services/identity'
import { ROLES, ROLE_DESC, ROLE_DARI_NUM, CHAIN, ACCOUNTS, short } from '../constants'

const session = useSessionStore()
const router = useRouter()

function buka(role) {
  router.push(role === 'admin' ? '/admin' : '/dashboard')
}

// Mode dummy: pilih peran langsung
function masukDemo(r) {
  session.login(r)
  buka(r)
}

// Mode blockchain: masuk memakai identitas yang tersimpan di perangkat ini
const identitas = ref([])
const info = ref('')
const galat = ref('')
const kunci = ref('')
const imporTerbuka = ref(false)
let timer

async function muat() {
  identitas.value = await Promise.all(
    daftarIdentitas().map(async (i) => {
      try {
        return { ...i, role: await getRoleOf(i.address) }
      } catch {
        return { ...i, role: null }
      }
    })
  )
}

function buat() {
  buatIdentitas()
  info.value = 'Identitas dibuat. Salin alamatnya, lalu minta Admin mendaftarkannya.'
  galat.value = ''
  muat()
}

function impor() {
  try {
    imporIdentitas(kunci.value)
    kunci.value = ''
    imporTerbuka.value = false
    galat.value = ''
    info.value = 'Kunci diimpor.'
    muat()
  } catch (e) {
    galat.value = e.message
  }
}

function masukIdentitas(i) {
  const r = ROLE_DARI_NUM[i.role]
  if (!r) return
  session.login(r, i.address)
  buka(r)
}

function keterangan(i) {
  if (i.role === null) return 'Node tidak terjangkau'
  return ROLES[ROLE_DARI_NUM[i.role]] || 'Menunggu pendaftaran oleh Admin'
}

// Clipboard API butuh HTTPS, jadi ada cadangan untuk akses lewat alamat IP
async function salin(teks) {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(teks)
      info.value = 'Alamat disalin.'
      return
    }
  } catch { /* lanjut ke cadangan */ }
  const t = document.createElement('textarea')
  t.value = teks
  document.body.appendChild(t)
  t.select()
  try {
    document.execCommand('copy')
    info.value = 'Alamat disalin.'
  } catch {
    galat.value = 'Gagal menyalin. Pilih alamat lalu salin manual.'
  }
  document.body.removeChild(t)
}

onMounted(() => {
  if (!isMock) {
    muat()
    timer = setInterval(muat, 3000)
  }
})
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <h1>Masuk sebagai siapa?</h1>

  <!-- Mode dummy -->
  <template v-if="isMock">
    <p class="lead">Mode dummy: pilih peran langsung. Pada mode blockchain, peran ditentukan oleh akun yang terdaftar di perangkat ini.</p>
    <h2>Rantai pengiriman</h2>
    <ol class="panel tugas">
      <li v-for="(r, i) in CHAIN" :key="r">
        <span class="no">{{ i + 1 }}</span>
        <div class="who"><strong>{{ ROLES[r] }}</strong><span>{{ ROLE_DESC[r] }}</span></div>
        <span class="akun-id">{{ short(ACCOUNTS[r]) }}</span>
        <button :aria-label="'Masuk sebagai ' + ROLES[r]" @click="masukDemo(r)">Masuk</button>
      </li>
    </ol>
    <h2>Pengelola</h2>
    <div class="panel admin">
      <div class="who"><strong>{{ ROLES.admin }}</strong><span>{{ ROLE_DESC.admin }}</span></div>
      <span class="akun-id">{{ short(ACCOUNTS.admin) }}</span>
      <button class="ghost" @click="masukDemo('admin')">Masuk</button>
    </div>
  </template>

  <!-- Mode blockchain -->
  <template v-else>
    <p class="lead">
      Perangkat ini hanya bisa masuk dengan identitas yang tersimpan di sini dan sudah didaftarkan Admin.
      Peran dicatat di smart contract, bukan di browser.
    </p>
    <p v-if="info" class="msg ok" role="status">{{ info }}</p>
    <p v-if="galat" class="msg error" role="alert">{{ galat }}</p>

    <h2>Identitas di perangkat ini</h2>
    <div class="panel">
      <p v-if="!identitas.length" class="kosong">
        Belum ada identitas. Buat identitas baru, lalu kirim alamatnya ke Admin untuk didaftarkan.
      </p>
      <ul v-else class="daftar">
        <li v-for="i in identitas" :key="i.address">
          <div class="isi">
            <strong>{{ keterangan(i) }}</strong>
            <span class="addr">{{ i.address }}</span>
          </div>
          <div class="tombol">
            <button class="ghost kecil" @click="salin(i.address)">Salin alamat</button>
            <button :disabled="!ROLE_DARI_NUM[i.role]" @click="masukIdentitas(i)">Masuk</button>
          </div>
        </li>
      </ul>
    </div>

    <div class="aksi">
      <button @click="buat">Buat identitas baru</button>
      <button class="ghost" @click="imporTerbuka = !imporTerbuka">Impor kunci Admin</button>
    </div>

    <div v-if="imporTerbuka" class="panel panel-pad impor">
      <label for="kunci">Kunci privat akun Admin</label>
      <input id="kunci" v-model="kunci" type="password" placeholder="0x…" autocomplete="off" />
      <p class="hint">Salin dari terminal node, bagian Account #0 (Private Key). Kunci hanya disimpan di browser perangkat ini.</p>
      <div class="form-actions"><button @click="impor">Impor kunci</button></div>
    </div>
  </template>
</template>

<style scoped>
.tugas { list-style: none; margin: 0 0 2rem; padding: 0; }
.tugas li { display: grid; grid-template-columns: 3rem 1fr auto auto; align-items: center; gap: 1rem; padding: 1rem 1.25rem; }
.tugas li + li { border-top: 2px dashed var(--garis); }
.no { font-family: var(--font-papan); font-weight: 700; font-size: 2.4rem; line-height: 1; color: var(--biru); }
.who { display: grid; }
.who span { color: var(--muted); font-size: 0.9rem; }
.akun-id { color: var(--muted); font-size: 0.85rem; font-variant-numeric: tabular-nums; }
.admin { display: grid; grid-template-columns: 1fr auto auto; align-items: center; gap: 1rem; padding: 1rem 1.25rem; }

.kosong { margin: 0; padding: 1.5rem 1.25rem; color: var(--muted); }
.daftar { list-style: none; margin: 0; padding: 0; }
.daftar li { display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; padding: 1rem 1.25rem; }
.daftar li + li { border-top: 2px dashed var(--garis); }
.isi { display: grid; gap: 0.2rem; min-width: 0; }
.isi strong { font-size: 1.05rem; }
.tombol { display: flex; gap: 0.5rem; }
.aksi { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
.impor { max-width: 560px; }

@media (max-width: 640px) {
  .akun-id { display: none; }
  .tugas li { grid-template-columns: 2.2rem 1fr auto; }
  .admin { grid-template-columns: 1fr auto; }
}
</style>