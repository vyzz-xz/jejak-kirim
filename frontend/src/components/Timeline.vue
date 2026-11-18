<script setup>
import { STATUS_LABEL, short } from '../constants'

defineProps({ history: Array })
const fmt = (t) => new Date(t).toLocaleString('id-ID')
</script>

<template>
  <ol class="tl">
    <li v-for="(h, i) in history" :key="i">
      <strong>{{ STATUS_LABEL[h.status] }}</strong>
      <div class="meta"><time>{{ fmt(h.time) }}</time>, oleh akun {{ short(h.actor) }}</div>
    </li>
  </ol>
</template>

<style scoped>
.tl { list-style: none; margin: 0; padding: 0; }
.tl li { position: relative; padding: 0 0 1.25rem 1.9rem; }
.tl li::before { content: ''; position: absolute; left: 6px; top: 10px; bottom: -10px; width: 3px; background: var(--garis); }
.tl li:last-child { padding-bottom: 0; }
.tl li:last-child::before { display: none; }
.tl li::after { content: ''; position: absolute; left: 0; top: 5px; width: 15px; height: 15px; border-radius: 50%; background: var(--biru); }
.meta { color: var(--muted); font-size: 0.85rem; }
</style>