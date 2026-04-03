import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export const fetchAllData  = ()          => api.get('/data').then(r => r.data)
export const fetchToday    = ()          => api.get('/today').then(r => r.data)
export const fetchStats    = ()          => api.get('/stats').then(r => r.data)
export const saveEntry     = (entry)     => api.post('/entry', entry).then(r => r.data)
export const triggerBackup = ()          => api.post('/backup').then(r => r.data)
