import { useState, useEffect, useCallback } from "react";
import { inquiriesApi } from "../../utils/api";

export default function AdminInquiries() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [selected, setSelected] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const loadInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page,
        limit: 20,
        ...(filter && { status: filter }),
        ...(search && { search }),
      }).toString();
      const res = await inquiriesApi.getAll(query);
      setData(res.data || []);
      setPagination(res.pagination || {});
    } catch (e) {
      setErr(e.message || "Gagal memuat inquiries");
    } finally {
      setLoading(false);
    }
  }, [page, filter, search]);

  const loadUnreadCount = useCallback(async () => {
    try {
      const res = await inquiriesApi.getUnreadCount();
      setUnreadCount(res.unread_count);
    } catch (e) {
      console.error("Gagal memuat unread count:", e.message);
    }
  }, []);

  useEffect(() => {
    loadInquiries();
    loadUnreadCount();
  }, [loadInquiries, loadUnreadCount]);

  const handleView = async (id) => {
    try {
      const res = await inquiriesApi.getById(id);
      setSelected(res.data);
    } catch (e) {
      setErr(e.message || "Gagal memuat detail");
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await inquiriesApi.markAsRead(id);
      setMsg("✅ Ditandai sudah dibaca");
      loadInquiries();
      loadUnreadCount();
      setTimeout(() => setMsg(""), 3000);
    } catch (e) {
      setErr(e.message);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await inquiriesApi.update(id, { status });
      setMsg("✅ Status berhasil diubah");
      loadInquiries();
      loadUnreadCount();
      setTimeout(() => setMsg(""), 3000);
    } catch (e) {
      setErr(e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus inquiry ini?")) return;
    try {
      await inquiriesApi.deleteInquiry(id);
      setMsg("✅ Inquiry berhasil dihapus");
      loadInquiries();
      loadUnreadCount();
      setTimeout(() => setMsg(""), 3000);
    } catch (e) {
      setErr(e.message);
    }
  };

  const statusBadge = (status) => {
    const colors = {
      unread: "#A04040",
      read: "#4A7C59",
      replied: "#6B4F8C",
    };
    return (
      <span
        style={{
          display: "inline-block",
          padding: "0.25rem 0.75rem",
          background: colors[status] + "20",
          border: `1px solid ${colors[status]}`,
          color: colors[status],
          borderRadius: "4px",
          fontSize: "0.75rem",
          fontWeight: 500,
          textTransform: "uppercase",
        }}
      >
        {status === "unread"
          ? "Belum Dibaca"
          : status === "read"
            ? "Sudah Dibaca"
            : "Sudah Dibalas"}
      </span>
    );
  };

  return (
    <div style={{ padding: "2rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "1.8rem",
              color: "#2C1F14",
              marginBottom: "0.5rem",
            }}
          >
            Inquiry Konsultasi
          </h2>
          {unreadCount > 0 && (
            <div
              style={{ fontSize: "0.9rem", color: "#A04040", fontWeight: 600 }}
            >
              📬 {unreadCount} pesan belum dibaca
            </div>
          )}
        </div>
      </div>

      {msg && (
        <div
          style={{
            background: "rgba(74, 124, 89, 0.1)",
            border: "1px solid rgba(74, 124, 89, 0.3)",
            color: "#2d5a3d",
            padding: "1rem",
            borderRadius: "4px",
            marginBottom: "1rem",
          }}
        >
          {msg}
        </div>
      )}

      {err && (
        <div
          style={{
            background: "rgba(160, 64, 64, 0.1)",
            border: "1px solid rgba(160, 64, 64, 0.3)",
            color: "#A04040",
            padding: "1rem",
            borderRadius: "4px",
            marginBottom: "1rem",
          }}
        >
          {err}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          gap: "2rem",
          minHeight: "calc(100vh - 200px)",
        }}
      >
        {/* Sidebar — Filter & Navigation */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            borderRight: "1px solid #E8E4D8",
            paddingRight: "1.5rem",
          }}
        >
          <div
            style={{ marginBottom: "0.5rem", display: "flex", gap: "0.5rem" }}
          >
            <input
              type="text"
              placeholder="Cari..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{
                flex: 1,
                padding: "0.5rem 0.75rem",
                border: "1px solid #E8E4D8",
                borderRadius: "4px",
                fontSize: "0.85rem",
              }}
            />
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            {["", "unread", "read", "replied"].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setFilter(status);
                  setPage(1);
                }}
                style={{
                  padding: "0.75rem 1rem",
                  background: filter === status ? "#2C1F14" : "#E8E4D8",
                  color: filter === status ? "#E8DCC4" : "#2C1F14",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  textAlign: "left",
                  transition: "all 0.2s",
                }}
              >
                {status === ""
                  ? "Semua"
                  : status === "unread"
                    ? "📬 Belum Dibaca"
                    : status === "read"
                      ? "📖 Sudah Dibaca"
                      : "✅ Sudah Dibalas"}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content — List + Detail */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
            alignItems: "start",
          }}
        >
          {/* List */}
          <div>
            {loading ? (
              <div
                style={{ textAlign: "center", color: "#999", padding: "2rem" }}
              >
                Memuat...
              </div>
            ) : data.length === 0 ? (
              <div
                style={{ textAlign: "center", color: "#999", padding: "2rem" }}
              >
                📭 Belum ada inquiry
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  maxHeight: "calc(100vh - 300px)",
                  overflowY: "auto",
                }}
              >
                {data.map((inquiry) => (
                  <div
                    key={inquiry.id}
                    onClick={() => handleView(inquiry.id)}
                    style={{
                      padding: "1rem",
                      background:
                        selected?.id === inquiry.id
                          ? "#2C1F1420"
                          : inquiry.status === "unread"
                            ? "#FFF9F0"
                            : "#fff",
                      border: `1px solid ${selected?.id === inquiry.id ? "#2C1F14" : "#E8E4D8"}`,
                      borderRadius: "4px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        color: "#2C1F14",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {inquiry.nama_lengkap}
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "#666",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {inquiry.pesan.substring(0, 50)}...
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#999" }}>
                      {new Date(inquiry.created_at).toLocaleDateString(
                        "id-ID",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {pagination.total_pages > 1 && (
              <div
                style={{
                  marginTop: "1rem",
                  display: "flex",
                  gap: "0.5rem",
                  justifyContent: "center",
                }}
              >
                {Array.from(
                  { length: pagination.total_pages },
                  (_, i) => i + 1,
                ).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{
                      padding: "0.5rem 0.75rem",
                      background: page === p ? "#2C1F14" : "#E8E4D8",
                      color: page === p ? "#fff" : "#2C1F14",
                      border: "none",
                      borderRadius: "3px",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detail — Right Panel */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
            }}
          >
            {selected ? (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #E8E4D8",
                  borderRadius: "8px",
                  padding: "2rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    marginBottom: "1.5rem",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: "1.3rem",
                        color: "#2C1F14",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {selected.nama_lengkap}
                    </h3>
                    <div
                      style={{
                        color: "#666",
                        fontSize: "0.9rem",
                        lineHeight: "1.6",
                      }}
                    >
                      <div>📱 {selected.nomor_hp}</div>
                      <div>📧 {selected.email || "-"}</div>
                    </div>
                  </div>
                  {statusBadge(selected.status)}
                </div>

                <div
                  style={{
                    background: "#F5F5F5",
                    padding: "1rem",
                    borderRadius: "4px",
                    marginBottom: "1.5rem",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#666",
                      marginBottom: "0.5rem",
                      fontWeight: 600,
                    }}
                  >
                    KATEGORI: {selected.keterangan}
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#999",
                      marginBottom: "1rem",
                    }}
                  >
                    {new Date(selected.created_at).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <h4
                    style={{
                      fontSize: "0.9rem",
                      color: "#2C1F14",
                      marginBottom: "0.75rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                    }}
                  >
                    Pesan
                  </h4>
                  <p
                    style={{
                      color: "#3D3D3D",
                      lineHeight: "1.8",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {selected.pesan}
                  </p>
                </div>

                {selected.admin_notes && (
                  <div
                    style={{
                      marginBottom: "1.5rem",
                      background: "#E8F5E9",
                      padding: "1rem",
                      borderRadius: "4px",
                      borderLeft: "3px solid #4A7C59",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "0.9rem",
                        color: "#2d5a3d",
                        marginBottom: "0.5rem",
                        fontWeight: 600,
                      }}
                    >
                      📝 Catatan Admin
                    </h4>
                    <p
                      style={{
                        color: "#2d5a3d",
                        lineHeight: "1.6",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {selected.admin_notes}
                    </p>
                  </div>
                )}

                <div
                  style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}
                >
                  {selected.status !== "read" && (
                    <button
                      onClick={() => handleMarkRead(selected.id)}
                      style={{
                        padding: "0.75rem 1.5rem",
                        background: "#4A7C59",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        fontWeight: 500,
                      }}
                    >
                      Tandai Dibaca
                    </button>
                  )}
                  {selected.status !== "replied" && (
                    <button
                      onClick={() => handleUpdateStatus(selected.id, "replied")}
                      style={{
                        padding: "0.75rem 1.5rem",
                        background: "#6B4F8C",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        fontWeight: 500,
                      }}
                    >
                      Tandai Sudah Dibalas
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(selected.id)}
                    style={{
                      padding: "0.75rem 1.5rem",
                      background: "#A04040",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      fontWeight: 500,
                    }}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "400px",
                  color: "#999",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>💬</div>
                <p>Pilih inquiry untuk melihat detail</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
