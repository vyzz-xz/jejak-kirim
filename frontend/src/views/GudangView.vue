<script setup>
import { onMounted } from 'vue'
import { useShipmentStore } from '../stores/shipments'
import ShipmentTable from '../components/ShipmentTable.vue'
import MessageBar from '../components/MessageBar.vue'

const store = useShipmentStore()
onMounted(store.enter)
</script>

<template>
  <h1>Gudang</h1>
  <p class="lead">Terima paket yang baru dibuat pengirim. Paket bisa dilanjutkan kurir setelah diterima di gudang.</p>
  <MessageBar />
  <ShipmentTable :items="store.list">
    <template #default="{ item }">
      <button :disabled="store.loading" @click="store.receive(item.id)">Terima di gudang</button>
    </template>
  </ShipmentTable>
</template>