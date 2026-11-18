<script setup>
import { RouterLink } from 'vue-router'
import StatusBadge from './StatusBadge.vue'
import RouteTracker from './RouteTracker.vue'

defineProps({
  items: Array,
  empty: { type: String, default: 'Belum ada paket.' },
  isWaiting: { type: Function, default: () => false },
})
</script>

<template>
  <div class="panel list">
    <p v-if="!items.length" class="empty">{{ empty }}</p>
    <article v-for="s in items" :key="s.id" class="row" :class="{ menunggu: isWaiting(s) }">
      <div class="info">
        <strong class="id">{{ s.id }}</strong>
        <span class="desc">{{ s.deskripsi }}</span>
        <RouterLink class="lihat" :to="{ path: '/verifikasi', query: { id: s.id } }">Lihat riwayat</RouterLink>
      </div>
      <div class="track">
        <StatusBadge :status="s.status" />
        <RouteTracker :status="s.status" compact />
      </div>
      <div class="act"><slot :item="s" /></div>
    </article>
  </div>
</template>

<style scoped>
.list { padding: 0; overflow: hidden; }
.row { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.3fr) auto; gap: 1rem 1.5rem; align-items: center; padding: 1rem 1.25rem; }
.row + .row { border-top: 2px dashed var(--garis); }
.row.menunggu { background: var(--rompi-muda); box-shadow: inset 6px 0 0 var(--rompi); }
.id { display: block; font-family: var(--font-papan); font-weight: 700; font-size: 1.7rem; line-height: 1.05; }
.desc { display: block; color: var(--muted); font-size: 0.9rem; }
.lihat { font-size: 0.85rem; font-weight: 600; color: var(--biru); }
.track { display: grid; gap: 0.6rem; }
.track > :first-child { justify-self: start; }
.act { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.act:empty { display: none; }
.empty { margin: 0; padding: 2rem 1.25rem; color: var(--muted); }
@media (max-width: 720px) { .row { grid-template-columns: 1fr; } }
</style>