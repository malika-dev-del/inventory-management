import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: BASE_URL,
})

// Products
export const getProducts = () => api.get('/api/products/')
export const createProduct = (data) => api.post('/api/products/', data)
export const updateProduct = (id, data) => api.put(`/api/products/${id}`, data)
export const deleteProduct = (id) => api.delete(`/api/products/${id}`)

// Customers
export const getCustomers = () => api.get('/api/customers/')
export const createCustomer = (data) => api.post('/api/customers/', data)
export const updateCustomer = (id, data) => api.put(`/api/customers/${id}`, data)
export const deleteCustomer = (id) => api.delete(`/api/customers/${id}`)

// Orders
export const getOrders = () => api.get('/api/orders/')
export const createOrder = (data) => api.post('/api/orders/', data)
export const updateOrderStatus = (id, status) => api.patch(`/api/orders/${id}/status`, { status })
export const deleteOrder = (id) => api.delete(`/api/orders/${id}`)
