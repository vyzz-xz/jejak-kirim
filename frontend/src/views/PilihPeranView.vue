<script setup>
import { useRouter } from 'vue-router'
import { useSessionStore } from '../stores/session'
import { ROLES, ROLE_DESC, CHAIN, ACCOUNTS, short } from '../constants'

const session = useSessionStore()
const router = useRouter()

function pilih(r) {
  session.setRole(r)
  router.push('/' + r)
}
</script>

<template>
  <h1>Masuk sebagai siapa?</h1>
  <p class="lead">
    Pilih peran yang dipegang perangkat ini. Setiap peran hanya bisa menjalankan langkahnya sendiri dalam perjalanan paket.
  </p>

  <h2>Rantai pengiriman</h2>
  <ol class="chain panel">
    <li v-for="r in CHAIN" :key="r">
      <span class="node" aria-hidden="true"></span>
      <div class="who">
        <strong>{{ ROLES[r] }}</strong>
        <span>{{ ROLE_DESC[r] }}</span>
      </div>
      <span class="addr">{{ short(ACCOUNTS[r]) }}</span>
      <button @click="pilih(r)">Masuk</button>
    </li>
  </ol>

  <h2>Pengelola</h2>
  <div class="panel admin">
    <div class="who">
      <strong>{{ ROLES.admin }}</strong>
      <span>{{ ROLE_DESC.admin }}</span>
    </div>
    <span class="addr">{{ short(ACCOUNTS.admin) }}</span>
    <button class="ghost" @click="pilih('admin')">Masuk</button>
  </div>
</template>

<style scoped>
.chain { list-style: none; margin: 0 0 2rem; padding: 0.25rem 1.25rem; }
.chain li { position: relative; display: grid; grid-template-columns: 22px 1fr auto auto; align-items: center; gap: 1rem; padding: 1rem 0; }
.chain li:not(:last-child)::after {
  content: ''; position: absolute; left: 10px; width: 2px; background: var(--line);
  top: calc(50% + 11px); height: calc(100% - 22px);
}
.node { position: relative; z-index: 1; width: 22px; height: 22px; border-radius: 50%; border: 3px solid var(--teal); background: #fff; }
.who { display: grid; }
.who span { color: var(--muted); font-size: 0.9rem; }
.admin { display: grid; grid-template-columns: 1fr auto auto; align-items: center; gap: 1rem; padding: 1rem 1.25rem; }
@media (max-width: 640px) {
  .addr { display: none; }
  .chain li { grid-template-columns: 22px 1fr auto; }
  .admin { grid-template-columns: 1fr auto; }
}
</style>