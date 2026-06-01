import { useState, useEffect } from 'react'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/api'
import Toast from '../components/Toast'

const EMPTY = { name: '', sku: '', description: '', price: '', stock_quantity: '' }

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'create' | 'edit'
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)

  const load = () => getProducts().then(r => setProducts(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(EMPTY); setEditId(null); setError(''); setModal('edit') }
  const openEdit = (p) => {
    setForm({ name: p.name, sku: p.sku, description: p.description || '', price: p.price, stock_quantity: p.stock_quantity })
    setEditId(p.id); setError(''); setModal('edit')
  }
  const closeModal = () => setModal(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const payload = { ...form, price: parseFloat(form.price), stock_quantity: parseInt(form.stock_quantity) }
    try {
      if (editId) {
        const { sku, ...updatePayload } = payload
        await updateProduct(editId, updatePayload)
        setToast({ msg: 'Product updated', type: 'success' })
      } else {
        await createProduct(payload)
        setToast({ msg: 'Product created', type: 'success' })
      }
      closeModal()
      load()
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'An error occurred')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    try {
      await deleteProduct(id)
      setToast({ msg: 'Product deleted', type: 'success' })
      load()
    } catch (err) {
      setToast({ msg: err.response?.data?.detail || 'Cannot delete product', type: 'error' })
    }
  }

  if (loading) return <div className="loading">Loading products...</div>

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Products</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Product</button>
      </div>

      <div className="card">
        <div className="table-wrapper">
          {products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <p>No products yet. Add your first product!</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.name}</strong><br /><small style={{ color: '#9ca3af' }}>{p.description}</small></td>
                    <td><code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>{p.sku}</code></td>
                    <td>${p.price.toFixed(2)}</td>
                    <td>{p.stock_quantity}</td>
                    <td>
                      <span className={`badge ${p.stock_quantity === 0 ? 'badge-low' : p.stock_quantity < 5 ? 'badge-pending' : 'badge-ok'}`}>
                        {p.stock_quantity === 0 ? 'Out of Stock' : p.stock_quantity < 5 ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-edit btn-sm" onClick={() => openEdit(p)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal === 'edit' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editId ? 'Edit Product' : 'Add Product'}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="error-msg">{error}</div>}
                <div className="form-group">
                  <label>Product Name *</label>
                  <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Wireless Headphones" />
                </div>
                <div className="form-group">
                  <label>SKU *</label>
                  <input required value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="e.g. WH-001" disabled={!!editId} />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional description" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label>Price ($) *</label>
                    <input required type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
                  </div>
                  <div className="form-group">
                    <label>Stock Quantity *</label>
                    <input required type="number" min="0" value={form.stock_quantity} onChange={e => setForm({ ...form, stock_quantity: e.target.value })} placeholder="0" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
