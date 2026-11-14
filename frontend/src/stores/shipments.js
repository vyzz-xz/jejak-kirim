import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '../services/shipmentService'
import { useSessionStore } from './session'

export const useShipmentStore = defineStore('shipments', () => {
    const list = ref([])
    const message = ref(null) // { type: 'ok' | 'error', text }
    const loading = ref(false)

    async function refresh() { list.value = await api.listShipments() }
    async function enter() { message.value = null; await refresh() }

  // Menjalankan satu aksi, menangkap error dari "contract", lalu memuat ulang daftar
    async function run(fn, okText) {
    const session = useSessionStore()
    loading.value = true
    try {
        await fn(session.role)
        message.value = { type: 'ok', text: okText }
    } catch (e) {
        message.value = { type: 'error', text: e.message }
    } finally {
        await refresh()
        loading.value = false
    }
}

    const create = (id, d, p) => run((r) => api.createShipment(r, id, d, p), `Pengiriman ${id} dibuat`)
    const receive = (id) => run((r) => api.receiveAtWarehouse(r, id), `${id}: diterima di gudang`)
    const start = (id) => run((r) => api.startDelivery(r, id), `${id}: mulai dikirim`)
    const deliver = (id) => run((r) => api.markDelivered(r, id), `${id}: tiba di tujuan`)
    const confirm = (id) => run((r) => api.confirmReceived(r, id), `${id}: diterima`)

    return { list, message, loading, refresh, enter, create, receive, start, deliver, confirm }
})