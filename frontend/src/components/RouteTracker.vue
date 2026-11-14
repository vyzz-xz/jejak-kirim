<script setup>
import { STATUS_LABEL } from '../constants'

const props = defineProps({ status: Number, compact: Boolean })
const stops = STATUS_LABEL.slice(1) // buang "-" di indeks 0

function state(i) {
  if (props.status > i + 1 || props.status === 5) return 'done'
  if (props.status === i + 1) return 'current'
  return 'todo'
}
</script>

<template>
  <ol class="route" :class="{ compact }" :aria-label="'Tahap pengiriman: ' + STATUS_LABEL[status]">
    <li v-for="(label, i) in stops" :key="label" class="stop" :class="state(i)" :title="label">
      <span class="dot"></span>
      <span class="label">{{ label }}</span>
    </li>
  </ol>
</template>

<style scoped>
.route { --d: 18px; list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(5, 1fr); }
.route.compact { --d: 11px; }
.stop { position: relative; text-align: center; font-size: 0.78rem; color: var(--muted); }
.stop::before {
  content: ''; position: absolute; left: -50%; width: 100%; height: 3px;
  top: calc(var(--d) / 2 - 1.5px); background: var(--line); transition: background-color 0.3s;
}
.stop:first-child::before { display: none; }
.stop.done::before, .stop.current::before { background: var(--teal); }
.dot {
  position: relative; z-index: 1; display: block; margin: 0 auto 0.5rem;
  width: var(--d); height: var(--d); border-radius: 50%;
  background: #fff; border: 3px solid var(--line); transition: all 0.3s;
}
.done .dot { background: var(--teal); border-color: var(--teal); }
.current .dot { border-color: var(--teal); box-shadow: 0 0 0 4px var(--teal-soft); }
.current { color: var(--ink); font-weight: 700; }
.compact .label { display: none; }
.compact .dot { margin-bottom: 0; }
.compact .current .dot { box-shadow: 0 0 0 3px var(--teal-soft); }
</style>