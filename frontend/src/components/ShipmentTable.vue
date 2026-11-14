<script setup>
import StatusBadge from './StatusBadge.vue'
import RouteTracker from './RouteTracker.vue'

defineProps({
  items: Array,
  empty: { type: String, default: 'Belum ada paket. Paket muncul di sini setelah pengirim membuat pengiriman.' },
})
</script>

<template>
  <div class="panel list">
    <p v-if="!items.length" class="empty">{{ empty }}</p>
    <article v-for="s in items" :key="s.id" class="row">
      <div class="info">
        <strong class="id">{{ s.id }}</strong>
        <span class="desc">{{ s.deskripsi }}</span>
      </div>
      <div class="track">
        <StatusBadge :status="s.status" />
        <RouteTracker :status="s.status" compact />
      </div>
      <div v-if="$slots.default" class="act">
        <slot :item="s" />
      </div>
    </article>
  </div>
</template>

<style scoped>
.list { padding: 0; overflow: hidden; }
.row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr) auto; gap: 1rem 1.5rem; align-items: center; padding: 1rem 1.25rem; }
.row + .row { border-top: 1px solid var(--line); }
.id { display: block; font-weight: 700; }
.desc { color: var(--muted); font-size: 0.9rem; }
.track { display: grid; gap: 0.6rem; }
.track > :first-child { justify-self: start; }
.act { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.empty { margin: 0; padding: 2rem 1.25rem; color: var(--muted); }
@media (max-width: 720px) { .row { grid-template-columns: 1fr; } }
</style>