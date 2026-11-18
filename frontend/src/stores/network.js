import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getNetworkInfo } from '../services/shipmentService'

export const useNetworkStore = defineStore('network', () => {
  const info = ref(null) // data terakhir yang berhasil dibaca
  const online = ref(false)
  const checkedAt = ref(null)

  async function refresh() {
    try {
      info.value = await getNetworkInfo()
      online.value = true
    } catch {
      online.value = false
    }
    checkedAt.value = Date.now()
  }

  return { info, online, checkedAt, refresh }
})