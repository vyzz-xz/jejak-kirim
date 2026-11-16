<script setup>
import { useAutoRefresh } from '../composables/useAutoRefresh'
import ShipmentTable from '../components/ShipmentTable.vue'
import MessageBar from '../components/MessageBar.vue'

const store = useAutoRefresh()
</script>

<template>
  <h1>Kurir</h1>
  <p class="lead">Mulai pengiriman dari gudang, lalu tandai saat paket tiba di tujuan.</p>
  <MessageBar />
  <ShipmentTable :items="store.list">
    <template #default="{ item }">
      <button :disabled="store.loading" @click="store.start(item.id)">Mulai kirim</button>
      <button class="ghost" :disabled="store.loading" @click="store.deliver(item.id)">Tandai terkirim</button>
    </template>
  </ShipmentTable>
</template>