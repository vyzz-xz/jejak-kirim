<script setup>
import { computed } from 'vue'
import { useNetworkStore } from '../stores/network'
import { short } from '../constants'

const net = useNetworkStore()

const state = computed(() => {
  if (!net.checkedAt) return { tone: 'idle', text: 'Memeriksa jaringan' }
  if (!net.online) return { tone: 'bad', text: 'Node terputus' }
  if (net.info?.mode === 'dummy') return { tone: 'warn', text: 'Mode dummy' }
  return { tone: 'ok', text: `Blok #${net.info.blockNumber}` }
})

const mode = computed(() => {
  if (!net.info) return '-'
  return net.info.mode === 'dummy' ? 'Data dummy, belum di blockchain' : 'Blockchain lokal'
})
const contract = computed(() =>
  net.info?.contract && net.info.contract !== '-' ? short(net.info.contract) : '-'
)
const diperiksa = computed(() =>
  net.checkedAt ? new Date(net.checkedAt).toLocaleTimeString('id-ID') : '-'
)
</script>

<template>
  <details class="jaringan">
    <summary :class="state.tone">
      <span class="lampu" aria-hidden="true"></span>{{ state.text }}
    </summary>
    <dl class="rincian">
      <dt>Mode</dt><dd>{{ mode }}</dd>
      <dt>Alamat RPC</dt><dd>{{ net.info?.rpc || '-' }}</dd>
      <dt>Chain ID</dt><dd>{{ net.info?.chainId ?? '-' }}</dd>
      <dt>Contract</dt><dd>{{ contract }}</dd>
      <dt>Blok terbaru</dt><dd>{{ net.info?.blockNumber ?? '-' }}</dd>
      <dt>Diperiksa</dt><dd>{{ diperiksa }}</dd>
    </dl>
  </details>
</template>

<style scoped>
.jaringan { position: relative; }
summary { list-style: none; cursor: pointer; display: flex; align-items: center; gap: 0.45rem; font-size: 0.85rem; font-weight: 600; padding: 0.3rem 0.65rem; border: 2px solid var(--garis); border-radius: 999px; background: var(--kertas); }
summary::-webkit-details-marker { display: none; }
.lampu { width: 0.6rem; height: 0.6rem; border-radius: 50%; background: var(--muted); }
.ok .lampu { background: var(--hijau); }
.warn .lampu { background: var(--rompi); outline: 1px solid var(--tinta); }
.bad { border-color: var(--merah); }
.bad .lampu { background: var(--merah); }
.rincian { position: absolute; right: 0; top: calc(100% + 0.5rem); z-index: 20; width: min(330px, 90vw); margin: 0; padding: 1rem; background: var(--kertas); border: 2px solid var(--tinta); border-radius: 4px; display: grid; grid-template-columns: auto 1fr; gap: 0.4rem 1rem; font-size: 0.85rem; }
dt { color: var(--muted); }
dd { margin: 0; word-break: break-all; }
</style>