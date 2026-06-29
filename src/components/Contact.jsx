import { useState } from 'react';
import { inquiriesApi } from '../../utils/api';
import '../styles/Contact.css';

export default function Contact() {
  const [form, setForm] = useState({
    nama_lengkap: '',
    nomor_hp: '',
    email: '',
    keterangan: '',
    pesan: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await inquiriesApi.create(form);
      setSuccess(true);
      setForm({
        nama_lengkap: '',
        nomor_hp: '',
        email: '',
        keterangan: '',
        pesan: '',
      });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.message || 'Gagal mengirim pesan. Coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="contact-section">
      <div className="contact-header">
        <p className="contact-subtitle">— HUBUNGI KAMI</p>
        <h2 className="contact-title">Konsultasi Gratis</h2>
        <p className="contact-description">
          Ceritakan kebutuhan properti Anda dan agen kami akan menghubungi
          dalam 1x24 jam.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="contact-form">
        {success && (
          <div className="alert alert-success">
            ✅ Pesan berhasil dikirim! Kami akan menghubungi Anda segera.
          </div>
        )}
        {error && <div className="alert alert-error">❌ {error}</div>}

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Nama Lengkap *</label>
            <input
              type="text"
              name="nama_lengkap"
              value={form.nama_lengkap}
              onChange={handleChange}
              placeholder="Budi Santoso"
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Nomor HP / WhatsApp *</label>
            <input
              type="tel"
              name="nomor_hp"
              value={form.nomor_hp}
              onChange={handleChange}
              placeholder="08xxxxxxxxxx"
              className="form-input"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="email@anda.com"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Keterangan *</label>
          <select
            name="keterangan"
            value={form.keterangan}
            onChange={handleChange}
            className="form-input"
            required
          >
            <option value="">Pilih kategori...</option>
            <option value="Tanya Harga">Tanya Harga</option>
            <option value="Tanya Spesifikasi">Tanya Spesifikasi</option>
            <option value="Proses Cicilan">Proses Cicilan</option>
            <option value="Lokasi Properti">Lokasi Properti</option>
            <option value="Tour Unit">Tour Unit</option>
            <option value="Penawaran Khusus">Penawaran Khusus</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Pesan *</label>
          <textarea
            name="pesan"
            value={form.pesan}
            onChange={handleChange}
            placeholder="Ceritakan kebutuhan properti Anda..."
            className="form-textarea"
            rows="5"
            required
          />
        </div>

        <button
          type="submit"
          className="btn-submit"
          disabled={loading}
        >
          {loading ? 'Mengirim...' : 'KIRIM PESAN →'}
        </button>
      </form>
    </section>
  );
}
