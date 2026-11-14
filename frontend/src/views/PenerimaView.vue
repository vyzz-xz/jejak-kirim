<script setup>
import { onMounted } from 'vue'
import { useShipmentStore } from '../stores/shipments'
import ShipmentTable from '../components/ShipmentTable.vue'
import MessageBar from '../components/MessageBar.vue'

const store = useShipmentStore()
onMounted(store.enter)
</script>

<template>
  <h1>Penerima</h1>
  <p class="lead">Konfirmasi setelah paket sampai di tangan Anda. Konfirmasi hanya bisa dilakukan setelah paket tiba di tujuan.</p>
  <MessageBar />
  <ShipmentTable :items="store.list">
    <template #default="{ item }">
      <button :disabled="store.loading" @click="store.confirm(item.id)">Konfirmasi diterima</button>
    </template>
  </ShipmentTable>
</template>