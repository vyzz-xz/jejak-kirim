<script setup>
import { ROLES, ROLE_DESC, ACCOUNTS } from '../constants'
</script>

<template>
  <h1>Admin</h1>
  <p class="lead">Daftar akun dan perannya. Pada versi blockchain, di sini Admin memberi peran lewat smart contract.</p>
  <div class="panel table-wrap">
    <table class="table">
      <thead>
        <tr><th>Peran</th><th>Tugas</th><th>Alamat akun</th></tr>
      </thead>
      <tbody>
        <tr v-for="(label, r) in ROLES" :key="r">
          <td><strong>{{ label }}</strong></td>
          <td>{{ ROLE_DESC[r] }}</td>
          <td class="addr">{{ ACCOUNTS[r] }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>