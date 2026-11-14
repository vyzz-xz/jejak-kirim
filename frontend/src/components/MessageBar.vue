<script setup>
import { useShipmentStore } from '../stores/shipments'
const store = useShipmentStore()
</script>

<template>
  <p v-if="store.message" class="msg" :class="store.message.type" role="status">{{ store.message.text }}</p>
</template>