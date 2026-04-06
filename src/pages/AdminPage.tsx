import { useState, useEffect } from "react";
import { AppState, Page } from "./Index";
import Layout from "@/components/Layout";
import Icon from "@/components/ui/icon";

interface Props {
  state: AppState;
  navigate: (page: Page) => void;
  login: (user: unknown, token: string) => void;
  logout: () => void;
}

interface Order {
  id: number;
  status: string;
  service_type: string;
  service_date: string;
  service_time: string;
  address: string;
  payment_type: string;
  cancel_reason?: string;
  created_at: string;
  full_name: string;
  login: string;
  user_phone: string;
  user_email: string;
  contact_phone: string;
  contact_email: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: "Новая", color: "hsl(198,80%,30%)", bg: "hsl(198,80%,94%)" },
  in_progress: { label: "В работе", color: "hsl(35,90%,35%)", bg: "hsl(35,90%,93%)" },
  done: { label: "Выполнено", color: "hsl(145,60%,30%)", bg: "hsl(145,60%,92%)" },
  cancelled: { label: "Отменено", color: "hsl(0,70%,40%)", bg: "hsl(0,70%,95%)" },
};

const SERVICE_LABELS: Record<string, string> = {
  general: "Общий клининг",
  deep: "Генеральная уборка",
  postconstruction: "Послестроительная уборка",
  carpet: "Химчистка ковров и мебели",
};

export default function AdminPage({ state, navigate, logout }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [selected, setSelected] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const load = async () => {
    try {
      const res = await fetch("https://functions.poehali.dev/e714671a-065f-40af-9d8a-bccef241386e", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list", token: state.token }),
      });
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async () => {
    if (!selected || !newStatus) return;
    if (newStatus === "cancelled" && !cancelReason.trim()) return;
    setUpdating(selected.id);
    try {
      const res = await fetch("https://functions.poehali.dev/e714671a-065f-40af-9d8a-bccef241386e", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_status", token: state.token, order_id: selected.id, status: newStatus, cancel_reason: cancelReason }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.map((o) => o.id === selected.id ? { ...o, status: newStatus, cancel_reason: newStatus === "cancelled" ? cancelReason : undefined } : o));
        setSelected(null);
        setNewStatus("");
        setCancelReason("");
      }
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filterStatus === "all" ? orders : orders.filter((o) => o.status === filterStatus);

  return (
    <Layout state={state} navigate={navigate} logout={logout} title="Панель администратора">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { key: "all", label: "Всего", icon: "ClipboardList" },
          { key: "new", label: "Новые", icon: "Bell" },
          { key: "in_progress", label: "В работе", icon: "Wrench" },
          { key: "done", label: "Выполнено", icon: "CheckCircle" },
        ].map(({ key, label, icon }) => {
          const count = key === "all" ? orders.length : orders.filter((o) => o.status === key).length;
          const active = filterStatus === key;
          return (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className="p-4 rounded-xl border text-left transition-all"
              style={{
                background: active ? "hsl(215,60%,22%)" : "#fff",
                borderColor: active ? "hsl(215,60%,22%)" : "hsl(210,20%,88%)",
              }}
            >
              <Icon name={icon} fallback="Circle" size={18} style={{ color: active ? "rgba(255,255,255,0.8)" : "hsl(215,20%,55%)" } as React.CSSProperties} className="mb-2" />
              <p className="text-2xl font-bold" style={{ color: active ? "#fff" : "hsl(215,40%,12%)" }}>{count}</p>
              <p className="text-xs mt-0.5" style={{ color: active ? "rgba(255,255,255,0.7)" : "hsl(215,20%,55%)" }}>{label}</p>
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20" style={{ color: "hsl(215,20%,55%)" }}>
          <Icon name="Loader2" size={24} className="animate-spin mr-3" />
          Загрузка заявок...
        </div>
      )}

      {!loading && (
        <div className="space-y-3">
          {filtered.length === 0 && (
            <p className="text-center py-12 text-sm" style={{ color: "hsl(215,20%,55%)" }}>Нет заявок в этом статусе</p>
          )}
          {filtered.map((order) => {
            const st = STATUS_LABELS[order.status] || STATUS_LABELS.new;
            return (
              <div key={order.id} className="bg-white rounded-xl border p-5" style={{ borderColor: "hsl(210,20%,88%)" }}>
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-bold text-sm" style={{ color: "hsl(215,40%,12%)" }}>Заявка №{order.id}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ color: st.color, background: st.bg }}>{st.label}</span>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 text-sm mb-3" style={{ color: "hsl(215,20%,40%)" }}>
                      <span className="flex items-center gap-1.5 font-medium" style={{ color: "hsl(215,40%,12%)" }}>
                        <Icon name="User" size={13} />
                        {order.full_name}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Icon name="Phone" size={13} />
                        {order.contact_phone}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Icon name="Mail" size={13} />
                        {order.contact_email}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Icon name="Sparkles" size={13} />
                        {SERVICE_LABELS[order.service_type] || order.service_type}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Icon name="Calendar" size={13} />
                        {order.service_date} в {order.service_time}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Icon name="MapPin" size={13} />
                        <span className="truncate">{order.address}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Icon name="CreditCard" size={13} />
                        {order.payment_type === "cash" ? "Наличные" : "Банковская карта"}
                      </span>
                    </div>
                    {order.cancel_reason && (
                      <p className="text-xs px-3 py-1.5 rounded inline-block" style={{ background: "hsl(0,70%,96%)", color: "hsl(0,60%,40%)" }}>
                        Причина отмены: {order.cancel_reason}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => { setSelected(order); setNewStatus(order.status); setCancelReason(""); }}
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all hover:bg-gray-50"
                    style={{ borderColor: "hsl(210,20%,82%)", color: "hsl(215,30%,35%)" }}
                  >
                    Изменить статус
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Status modal */}
      {selected && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg" style={{ color: "hsl(215,40%,12%)" }}>Изменить статус</h3>
              <button onClick={() => setSelected(null)} style={{ color: "hsl(215,20%,55%)" }}>
                <Icon name="X" size={20} />
              </button>
            </div>
            <p className="text-sm mb-4" style={{ color: "hsl(215,20%,50%)" }}>
              Заявка №{selected.id} — {selected.full_name}
            </p>
            <div className="space-y-2 mb-4">
              {[
                { value: "in_progress", label: "В работе" },
                { value: "done", label: "Выполнено" },
                { value: "cancelled", label: "Отменено" },
              ].map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setNewStatus(s.value)}
                  className="w-full text-left px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all"
                  style={{
                    borderColor: newStatus === s.value ? "hsl(215,60%,22%)" : "hsl(210,20%,88%)",
                    background: newStatus === s.value ? "hsl(215,60%,97%)" : "#fff",
                    color: "hsl(215,40%,12%)",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
            {newStatus === "cancelled" && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1.5" style={{ color: "hsl(215,30%,30%)" }}>Причина отмены *</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Укажите причину отмены заявки"
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none resize-none"
                  style={{ borderColor: "hsl(210,20%,85%)", color: "hsl(215,40%,12%)" }}
                  onFocus={(e) => (e.target.style.borderColor = "hsl(198,80%,40%)")}
                  onBlur={(e) => (e.target.style.borderColor = "hsl(210,20%,85%)")}
                />
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={updateStatus}
                disabled={!!updating || (newStatus === "cancelled" && !cancelReason.trim())}
                className="flex-1 py-2.5 rounded-lg font-semibold text-sm text-white flex items-center justify-center gap-2"
                style={{ background: updating ? "hsl(215,60%,35%)" : "hsl(215,60%,22%)" }}
              >
                {updating ? <Icon name="Loader2" size={15} className="animate-spin" /> : null}
                Сохранить
              </button>
              <button
                onClick={() => setSelected(null)}
                className="px-5 py-2.5 rounded-lg font-semibold text-sm border"
                style={{ borderColor: "hsl(210,20%,82%)", color: "hsl(215,30%,35%)" }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
