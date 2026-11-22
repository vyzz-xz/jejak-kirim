<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAutoRefresh } from '../composables/useAutoRefresh'
import { useSessionStore } from '../stores/session'
import { listParticipants } from '../services/shipmentService'
import { ROLES, ROLE_DESC, ACTION_STATUS, short } from '../constants'
import StationLine from '../components/StationLine.vue'
import ShipmentTable from '../components/ShipmentTable.vue'
import MessageBar from '../components/MessageBar.vue'

const store = useAutoRefresh()
const session = useSessionStore()

const role = computed(() => session.role)
const perlu = computed(() => ACTION_STATUS[role.value] || [])

// Pengirim hanya melihat paketnya, penerima hanya paket tujuannya. Peran lain melihat semua.
const sama = (a, b) => a?.toLowerCase() === b?.toLowerCase()
const milikSaya = computed(() =>
  store.list.filter((s) => {
    if (role.value === 'pengirim') return sama(s.pengirim, session.account)
    if (role.value === 'penerima') return sama(s.penerima, session.account)
    return true
  })
)

const menunggu = (s) => perlu.value.includes(s.status)
const jumlahMenunggu = computed(() => milikSaya.value.filter(menunggu).length)
const counts = computed(() => [1, 2, 3, 4, 5].map((n) => milikSaya.value.filter((s) => s.status === n).length))

const tab = ref('semua')
const tampil = computed(() => {
  const data = tab.value === 'menunggu' ? milikSaya.value.filter(menunggu) : milikSaya.value
  return [...data].reverse() // paket terbaru di atas
})
const kosong = computed(() => {
  if (tab.value === 'menunggu') return 'Tidak ada paket yang menunggu Anda.'
  return role.value === 'pengirim'
    ? 'Belum ada pengiriman. Buat yang pertama lewat formulir.'
    : 'Belum ada paket. Paket muncul di sini setelah pengirim membuat pengiriman.'
})

// Formulir pengiriman (khusus pengirim): penerima dipilih dari akun yang terdaftar sebagai Penerima
const id = ref('')
const deskripsi = ref('')
const penerimaList = ref([])
const penerima = ref('')
let timerPenerima

async function muatPenerima() {
  try {
    const semua = await listParticipants()
    penerimaList.value = semua.filter((p) => p.role === 5)
    if (!penerimaList.value.some((p) => p.address === penerima.value)) {
      penerima.value = penerimaList.value[0]?.address ?? ''
    }
  } catch { /* abaikan, daftar terakhir tetap dipakai */ }
}

onMounted(() => {
  if (role.value === 'pengirim') {
    muatPenerima()
    timerPenerima = setInterval(muatPenerima, 5000)
  }
})
onUnmounted(() => clearInterval(timerPenerima))

async function submit() {
  if (!id.value.trim() || !deskripsi.value.trim() || !penerima.value) return
  await store.create(id.value.trim(), deskripsi.value.trim(), penerima.value)
  if (store.message?.type === 'ok') { id.value = ''; deskripsi.value = '' }
}
</script>

<template>
  <h1>{{ ROLES[role] }}</h1>
  <p class="lead">{{ ROLE_DESC[role] }}</p>
  <MessageBar />

  <section class="panel panel-pad" aria-labelledby="jalur-judul">
    <h2 id="jalur-judul">Posisi paket di jalur</h2>
    <StationLine :counts="counts" :perlu="perlu" />
    <p v-if="perlu.length" class="hint">Tahap bertanda kuning adalah bagian tugas Anda.</p>
  </section>

  <div :class="{ split: role === 'pengirim' }">
    <section v-if="role === 'pengirim'">
      <h2>Buat pengiriman</h2>
      <div class="panel panel-pad">
        <label for="id">ID paket</label>
        <input id="id" v-model="id" placeholder="contoh: PKT-002" @keyup.enter="submit" />
        <label for="desk">Deskripsi singkat</label>
        <input id="desk" v-model="deskripsi" placeholder="contoh: Paket elektronik" @keyup.enter="submit" />
        <label for="pen">Penerima</label>
        <select id="pen" v-model="penerima" :disabled="!penerimaList.length">
          <option v-for="(p, i) in penerimaList" :key="p.address" :value="p.address">
            Penerima {{ i + 1 }} ({{ short(p.address) }})
          </option>
        </select>
        <p v-if="!penerimaList.length" class="hint">Belum ada penerima terdaftar. Minta Admin mendaftarkan akun penerima.</p>
        <div class="form-actions">
          <button :disabled="store.loading || !penerima" @click="submit">Buat pengiriman</button>
        </div>
      </div>
    </section>

    <section>
      <div class="bar">
        <h2>Daftar paket</h2>
        <div v-if="perlu.length" class="tabs" role="group" aria-label="Filter daftar paket">
          <button :aria-pressed="tab === 'semua'" @click="tab = 'semua'">Semua ({{ milikSaya.length }})</button>
          <button :aria-pressed="tab === 'menunggu'" @click="tab = 'menunggu'">Menunggu Anda ({{ jumlahMenunggu }})</button>
        </div>
      </div>

      <ShipmentTable :items="tampil" :empty="kosong" :is-waiting="menunggu">
        <template #default="{ item }">
          <template v-if="role === 'gudang'">
            <button :disabled="store.loading" @click="store.receive(item.id)">Terima di gudang</button>
          </template>
          <template v-else-if="role === 'kurir'">
            <button :disabled="store.loading" @click="store.start(item.id)">Mulai kirim</button>
            <button class="ghost" :disabled="store.loading" @click="store.deliver(item.id)">Tandai terkirim</button>
          </template>
          <template v-else-if="role === 'penerima'">
            <button :disabled="store.loading" @click="store.confirm(item.id)">Konfirmasi diterima</button>
          </template>
        </template>
      </ShipmentTable>
    </section>
  </div>
</template>