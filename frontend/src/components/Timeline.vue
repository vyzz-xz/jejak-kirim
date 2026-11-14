<script setup>
import { STATUS_LABEL, short } from '../constants'

defineProps({ history: Array })
const fmt = (t) => new Date(t).toLocaleString('id-ID')
</script>

<template>
  <ol class="tl">
    <li v-for="(h, i) in history" :key="i">
      <strong>{{ STATUS_LABEL[h.status] }}</strong>
      <div class="meta"><time>{{ fmt(h.time) }}</time> oleh {{ short(h.actor) }}</div>
    </li>
  </ol>
</template>

<style scoped>
.tl { list-style: none; margin: 0; padding: 0; }
.tl li { position: relative; padding: 0 0 1.25rem 1.75rem; }
.tl li::before { content: ''; position: absolute; left: 5px; top: 8px; bottom: -8px; width: 2px; background: var(--line); }
.tl li:last-child { padding-bottom: 0; }
.tl li:last-child::before { display: none; }
.tl li::after { content: ''; position: absolute; left: 0; top: 5px; width: 12px; height: 12px; border-radius: 50%; background: var(--teal); }
.meta { color: var(--muted); font-size: 0.85rem; }
</style>