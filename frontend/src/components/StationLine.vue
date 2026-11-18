<script setup>
import { STATUS_LABEL } from '../constants'

defineProps({
  counts: Array, // jumlah paket di tiap tahap (5 angka)
  perlu: { type: Array, default: () => [] }, // tahap yang menjadi tugas peran ini
})
const labels = STATUS_LABEL.slice(1)
</script>

<template>
  <ol class="jalur" aria-label="Jumlah paket di tiap tahap">
    <li v-for="(label, i) in labels" :key="label" :class="{ perlu: perlu.includes(i + 1) }">
      <span class="titik" aria-hidden="true"></span>
      <strong class="angka">{{ counts[i] }}</strong>
      <span class="nama">{{ label }}</span>
      <span v-if="perlu.includes(i + 1) && counts[i] > 0" class="catatan">Menunggu Anda</span>
    </li>
  </ol>
</template>

<style scoped>
.jalur { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(5, 1fr); }
li { position: relative; padding-top: 1.75rem; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.1rem; }
li::before { content: ''; position: absolute; top: 8px; left: -50%; width: 100%; height: 4px; background: var(--garis); }
li:first-child::before { display: none; }
.titik { position: absolute; top: 0; width: 20px; height: 20px; border-radius: 50%; background: var(--kertas); border: 4px solid var(--tinta); z-index: 1; }
.angka { font-family: var(--font-papan); font-weight: 700; font-size: clamp(2.4rem, 6vw, 3.4rem); line-height: 1; }
.nama { font-size: 0.85rem; color: var(--muted); }
.perlu .titik { background: var(--rompi); }
.perlu .angka { box-shadow: inset 0 -0.28em 0 var(--rompi); padding: 0 0.2em; }
.catatan { margin-top: 0.35rem; background: var(--rompi); color: var(--tinta); font-size: 0.75rem; font-weight: 700; padding: 0.1rem 0.5rem; border-radius: 2px; }
@media (max-width: 560px) { .nama { font-size: 0.75rem; } }
</style>