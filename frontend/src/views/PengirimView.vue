<script setup>
import { ref, onMounted } from 'vue'
import { useShipmentStore } from '../stores/shipments'
import { ACCOUNTS, short } from '../constants'
import ShipmentTable from '../components/ShipmentTable.vue'
import MessageBar from '../components/MessageBar.vue'

const store = useShipmentStore()
const id = ref('')
const deskripsi = ref('')

onMounted(store.enter)

async function submit() {
  if (!id.value.trim() || !deskripsi.value.trim()) return
  await store.create(id.value.trim(), deskripsi.value.trim(), ACCOUNTS.penerima)
  if (store.message?.type === 'ok') { id.value = ''; deskripsi.value = '' }
}
</script>

<template>
  <h1>Pengirim</h1>
  <p class="lead">Buat pengiriman baru. Paket langsung tercatat dengan status Dibuat.</p>
  <MessageBar />
  <div class="split">
    <section>
      <h2>Buat pengiriman</h2>
      <div class="panel panel-pad">
        <label for="id">ID paket</label>
        <input id="id" v-model="id" placeholder="contoh: PKT-002" />
        <label for="desk">Deskripsi singkat</label>
        <input id="desk" v-model="deskripsi" placeholder="contoh: Paket elektronik" />
        <label for="pen">Penerima</label>
        <input id="pen" :value="'Penerima · ' + short(ACCOUNTS.penerima)" disabled />
        <div class="form-actions">
          <button :disabled="store.loading" @click="submit">Buat pengiriman</button>
        </div>
      </div>
    </section>
    <section>
      <h2>Daftar pengiriman</h2>
      <ShipmentTable :items="store.list" empty="Belum ada pengiriman. Buat yang pertama lewat formulir." />
    </section>
  </div>
</template>