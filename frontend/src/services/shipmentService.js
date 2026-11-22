import * as mock from './shipmentService.mock'
import * as chain from './shipmentService.chain'

// Mode dummy aktif kecuali VITE_USE_MOCK diisi "false"
export const isMock = import.meta.env.VITE_USE_MOCK !== 'false'
const impl = isMock ? mock : chain

export const createShipment = impl.createShipment
export const receiveAtWarehouse = impl.receiveAtWarehouse
export const startDelivery = impl.startDelivery
export const markDelivered = impl.markDelivered
export const confirmReceived = impl.confirmReceived
export const listShipments = impl.listShipments
export const getShipment = impl.getShipment
export const getHistory = impl.getHistory
export const getNetworkInfo = impl.getNetworkInfo
export const getRoleOf = impl.getRoleOf
export const listParticipants = impl.listParticipants
export const registerParticipant = impl.registerParticipant