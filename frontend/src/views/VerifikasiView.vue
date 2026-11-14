<script setup>
import { ref } from 'vue'
import * as api from '../services/shipmentService'
import StatusBadge from '../components/StatusBadge.vue'
import RouteTracker from '../components/RouteTracker.vue'
import Timeline from '../components/Timeline.vue'

const id = ref('')
const result = ref(null)
const error = ref('')

async function cari() {
  if (!id.value.trim()) return
  error.value = ''
  result.value = null
  try {
    result.value = await api.getShipment(id.value.trim())
  } catch (e) {
    error.value = e.message
  }
}
</script>

<template>
  <h1>Verifikasi riwayat</h1>
  <p class="lead">Halaman terbuka untuk siapa saja. Masukkan ID paket untuk melihat perjalanannya.</p>

  <div class="panel panel-pad">
    <label for="idpaket">ID paket</label>
    <div class="search">
      <input id="idpaket" v-model="id" placeholder="contoh: PKT-001" @keyup.enter="cari" />
      <button :disabled="!id.trim()" @click="cari">Cari paket</button>
    </div>
  </div>

  <p v-if="error" class="msg error" role="alert">{{ error }}. Periksa kembali ID paket.</p>

  <section v-if="result" class="panel panel-pad">
    <header class="head">
      <div>
        <h2>{{ result.id }}</h2>
        <p class="desc">{{ result.deskripsi }}</p>
      </div>
      <StatusBadge :status="result.status" />
    </header>
    <RouteTracker :status="result.status" />
    <h3>Riwayat perubahan</h3>
    <Timeline :history="result.history" />
  </section>
</template>

<style scoped>
.head { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 1.5rem; }
.head h2 { margin: 0; font-size: 1.4rem; }
.desc { margin: 0.15rem 0 0; color: var(--muted); }
</style>