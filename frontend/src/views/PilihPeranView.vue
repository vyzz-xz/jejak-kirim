<script setup>
import { useRouter } from 'vue-router'
import { useSessionStore } from '../stores/session'
import { ROLES, ROLE_DESC, CHAIN, ACCOUNTS, short } from '../constants'

const session = useSessionStore()
const router = useRouter()

function masuk(r) {
  session.login(r)
  router.push(r === 'admin' ? '/admin' : '/dashboard')
}
</script>

<template>
  <h1>Masuk sebagai siapa?</h1>
  <p class="lead">
    Satu perangkat memegang satu peran. Smart contract mengenali peran dari alamat akun, bukan dari kata sandi.
    Pada demo ini, akun diambil dari node uji lokal.
  </p>

  <h2>Rantai pengiriman</h2>
  <ol class="panel tugas">
    <li v-for="(r, i) in CHAIN" :key="r">
      <span class="no">{{ i + 1 }}</span>
      <div class="who">
        <strong>{{ ROLES[r] }}</strong>
        <span>{{ ROLE_DESC[r] }}</span>
      </div>
      <span class="akun-id">{{ short(ACCOUNTS[r]) }}</span>
      <button :aria-label="'Masuk sebagai ' + ROLES[r]" @click="masuk(r)">Masuk</button>
    </li>
  </ol>

  <h2>Pengelola</h2>
  <div class="panel admin">
    <div class="who">
      <strong>{{ ROLES.admin }}</strong>
      <span>{{ ROLE_DESC.admin }}</span>
    </div>
    <span class="akun-id">{{ short(ACCOUNTS.admin) }}</span>
    <button class="ghost" aria-label="Masuk sebagai Admin" @click="masuk('admin')">Masuk</button>
  </div>
</template>

<style scoped>
.tugas { list-style: none; margin: 0 0 2rem; padding: 0; }
.tugas li { display: grid; grid-template-columns: 3rem 1fr auto auto; align-items: center; gap: 1rem; padding: 1rem 1.25rem; }
.tugas li + li { border-top: 2px dashed var(--garis); }
.no { font-family: var(--font-papan); font-weight: 700; font-size: 2.4rem; line-height: 1; color: var(--biru); }
.who { display: grid; }
.who strong { font-size: 1.05rem; }
.who span { color: var(--muted); font-size: 0.9rem; }
.akun-id { color: var(--muted); font-size: 0.85rem; font-variant-numeric: tabular-nums; }
.admin { display: grid; grid-template-columns: 1fr auto auto; align-items: center; gap: 1rem; padding: 1rem 1.25rem; }
@media (max-width: 640px) {
  .akun-id { display: none; }
  .tugas li { grid-template-columns: 2.2rem 1fr auto; }
  .admin { grid-template-columns: 1fr auto; }
}
</style>