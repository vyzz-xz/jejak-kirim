<script setup>
import { STATUS_LABEL } from '../constants'
defineProps({ status: Number })
</script>

<template>
  <span class="badge" :class="'s' + status">{{ STATUS_LABEL[status] }}</span>
</template>

<style scoped>
.badge { display: inline-block; padding: 0.15rem 0.7rem; border-radius: 999px; font-size: 0.8rem; font-weight: 600; background: #e8edf3; color: #233752; }
.s2, .s3 { background: var(--amber-soft); color: var(--amber); }
.s4 { background: var(--teal-soft); color: var(--teal-dark); }
.s5 { background: var(--green-soft); color: var(--green); }
</style>