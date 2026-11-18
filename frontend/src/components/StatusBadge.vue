<script setup>
import { STATUS_LABEL } from '../constants'
defineProps({ status: Number })
</script>

<template>
  <span class="badge" :class="'s' + status">{{ STATUS_LABEL[status] }}</span>
</template>

<style scoped>
.badge { display: inline-block; padding: 0.15rem 0.7rem; border-radius: 999px; font-size: 0.8rem; font-weight: 700; background: var(--beton); color: var(--tinta); border: 1px solid var(--garis); }
.s2, .s3, .s4 { background: var(--biru-muda); color: var(--biru-gelap); border-color: #b7cde2; }
.s5 { background: var(--hijau-muda); color: var(--hijau); border-color: #b7e4cb; }
</style>