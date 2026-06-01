import { useState, useEffect } from 'react'
import { getOrders, getCustomers, getProducts, createOrder, updateOrderStatus, deleteOrder } from '../api/api'
import Toast from '../components/Toast'

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [statusModal, setStatusModal] = useState(null)
  const [form, setForm] = useState({ customer_id: '', items: [{ product_id: '', quantity: 1 }] })
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)

  const load = () => Promise.all([getOrders(), getCustomers(), getProducts()]).then(([o, c, p]) => {
    setOrders(o.data)
    setCustomers(c.data)
    setProducts(p.data)
  }).finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setForm({ customer_id: '', items: [{ product_id: '', quantity: 1 }] })
    setError(''); setModal(true)
  }

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { product_id: '', quantity: 1 }] }))
  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }))
  const updateItem = (i, field, val) => setForm(f => ({
    ...f, items: f.items.map((item, idx) => idx === i ? { ...item, [field]: val } : item)
  }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.customer_id) { setError('Please select a customer'); return }
    const payload = {
      customer_id: parseInt(form.customer_id),
      items: form.items.map(i => ({ product_id: parseInt(i.product_id), quantity: parseInt(i.quantity) }))
    }
    if (payload.items.some(i => !i.product_id || i.quantity < 1)) {
      setError('Please fill in all order items correctly'); return
    }
    try {
      await createOrder(payload)
      setToast({ msg: 'Order created successfully', type: 'success' })
      setModal(false)
      load()
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'An error occurred')
    }
  }

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status)
      setToast({ msg: 'Order status updated', type: 'success' })
      setStatusModal(null)
      load()
    } catch (err) {
      setToast({ msg: err.response?.data?.detail || 'Error updating status', type: 'error' })
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this order? Stock will be restored.')) return
    try {
      await deleteOrder(id)
      setToast({ msg: 'Order deleted', type: 'success' })
      load()
    } catch (err) {
      setToast({ msg: 'Error deleting order', type: 'error' })
    }
  }

  const getOrderTotal = () => {
    return form.items.reduce((sum, item) => {
      const p = products.find(p => p.id === parseInt(item.product_id))
      return sum + (p ? p.price * (parseInt(item.quantity) || 0) : 0)
    }, 0)
  }

  if (loading) return <div className="loading">Loading orders...</div>

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Orders</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ New Order</button>
      </div>

      <div className="card">
        <div className="table-wrapper">
          {orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🛒</div>
              <p>No orders yet. Create your first order!</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td><strong>#{o.id}</strong></td>
                    <td>{o.customer?.name || `Customer #${o.customer_id}`}</td>
                    <td>{o.items?.length || 0} item(s)</td>
                    <td><strong>${o.total_amount.toFixed(2)}</strong></td>
                    <td>
                      <span className={`badge badge-${o.status}`}>{o.status}</span>
                    </td>
                    <td>{new Date(o.created_at).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-edit btn-sm" onClick={() => setStatusModal(o)}>Status</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(o.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create Order Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">New Order</h2>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="error-msg">{error}</div>}
                <div className="form-group">
                  <label>Customer *</label>
                  <select required value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value })}>
                    <option value="">Select a customer...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Order Items *</label>
                  <div className="order-items-section">
                    {form.items.map((item, i) => {
                      const prod = products.find(p => p.id === parseInt(item.product_id))
                      return (
                        <div key={i} className="order-item-row">
                          <div>
                            <select value={item.product_id} onChange={e => updateItem(i, 'product_id', e.target.value)} required>
                              <option value="">Select product...</option>
                              {products.map(p => (
                                <option key={p.id} value={p.id} disabled={p.stock_quantity === 0}>
                                  {p.name} (SKU: {p.sku}) - ${p.price} | Stock: {p.stock_quantity}
                                </option>
                              ))}
                            </select>
                            {prod && <small style={{ color: '#6b7280', marginTop: 4, display: 'block' }}>Available: {prod.stock_quantity}</small>}
                          </div>
                          <div>
                            <input
                              type="number"
                              min="1"
                              max={prod?.stock_quantity || 9999}
                              value={item.quantity}
                              onChange={e => updateItem(i, 'quantity', e.target.value)}
                              style={{ width: 80 }}
                              required
                            />
                          </div>
                          {form.items.length > 1 && (
                            <button type="button" className="remove-item-btn" onClick={() => removeItem(i)}>✕</button>
                          )}
                        </div>
                      )
                    })}
                    <button type="button" className="add-item-btn" onClick={addItem}>+ Add Item</button>
                  </div>
                </div>
                <div style={{ background: '#f8f9fa', padding: '12px 16px', borderRadius: 8 }}>
                  <strong>Estimated Total: ${getOrderTotal().toFixed(2)}</strong>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Place Order</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {statusModal && (
        <div className="modal-overlay" onClick={() => setStatusModal(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Update Order #{statusModal.id}</h2>
              <button className="modal-close" onClick={() => setStatusModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: 16, color: '#6b7280' }}>Current status: <span className={`badge badge-${statusModal.status}`}>{statusModal.status}</span></p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {STATUS_OPTIONS.map(s => (
                  <button
                    key={s}
                    className={`btn ${s === statusModal.status ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => handleStatusUpdate(statusModal.id, s)}
                    disabled={s === statusModal.status}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                    {s === statusModal.status ? ' (current)' : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
