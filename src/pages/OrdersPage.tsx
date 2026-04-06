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

const SERVICES = [
  { value: "general", label: "Общий клининг", desc: "Стандартная уборка всех помещений" },
  { value: "deep", label: "Генеральная уборка", desc: "Глубокая чистка с мытьём окон и труднодоступных мест" },
  { value: "postconstruction", label: "Послестроительная уборка", desc: "Уборка после ремонта и строительства" },
  { value: "carpet", label: "Химчистка ковров и мебели", desc: "Профессиональная чистка мягких поверхностей" },
];

const PAYMENT = [
  { value: "cash", label: "Наличные", icon: "Banknote" },
  { value: "card", label: "Банковская карта", icon: "CreditCard" },
];

const ORDERS_URL = "https://functions.poehali.dev/e714671a-065f-40af-9d8a-bccef241386e";

const inputStyle = {
  borderColor: "hsl(210,20%,85%)",
  color: "hsl(215,40%,12%)",
  background: "#fff",
};

export default function OrdersPage({ state, navigate, logout }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const [form, setForm] = useState({
    address: "",
    contact_phone: state.user?.phone || "",
    contact_email: state.user?.email || "",
    service_date: "",
    service_time: "",
    service_type: "",
    payment_type: "",
  });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch(ORDERS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list", token: state.token }),
      });
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const { address, contact_phone, contact_email, service_date, service_time, service_type, payment_type } = form;
    if (!address || !contact_phone || !contact_email || !service_date || !service_time || !service_type || !payment_type) {
      setFormError("Все поля обязательны для заполнения");
      return;
    }
    setFormLoading(true);
    try {
      const res = await fetch(ORDERS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", token: state.token, ...form }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setFormError(data.error || "Ошибка создания заявки");
      } else {
        setFormSuccess(true);
        setForm({ address: "", contact_phone: state.user?.phone || "", contact_email: state.user?.email || "", service_date: "", service_time: "", service_type: "", payment_type: "" });
        loadOrders();
        setTimeout(() => setFormSuccess(false), 4000);
      }
    } catch {
      setFormError("Ошибка соединения с сервером");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <Layout state={state} navigate={navigate} logout={logout} title="Мои заявки">
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* LEFT — New order form */}
        <div className="w-full lg:w-[420px] flex-shrink-0">
          <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "hsl(210,20%,88%)" }}>
            <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: "hsl(210,20%,91%)", background: "hsl(215,60%,22%)" }}>
              <Icon name="Plus" size={16} className="text-white/80" />
              <h2 className="font-semibold text-white text-sm">Новая заявка</h2>
            </div>

            {formSuccess && (
              <div className="mx-6 mt-5 flex items-center gap-2.5 p-3.5 rounded-lg text-sm font-medium" style={{ background: "hsl(145,60%,93%)", color: "hsl(145,55%,28%)" }}>
                <Icon name="CheckCircle" size={16} />
                Заявка успешно подана!
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Address */}
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "hsl(215,20%,55%)" }}>Адрес уборки</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  placeholder="г. Москва, ул. Примерная, д. 1"
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "hsl(198,80%,40%)")}
                  onBlur={(e) => (e.target.style.borderColor = "hsl(210,20%,85%)")}
                />
              </div>

              {/* Phone + Email */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "hsl(215,20%,55%)" }}>Телефон</label>
                  <input
                    type="tel"
                    value={form.contact_phone}
                    onChange={(e) => set("contact_phone", e.target.value)}
                    placeholder="+7 (___) ___-__-__"
                    className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "hsl(198,80%,40%)")}
                    onBlur={(e) => (e.target.style.borderColor = "hsl(210,20%,85%)")}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "hsl(215,20%,55%)" }}>Email</label>
                  <input
                    type="email"
                    value={form.contact_email}
                    onChange={(e) => set("contact_email", e.target.value)}
                    placeholder="email@mail.ru"
                    className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "hsl(198,80%,40%)")}
                    onBlur={(e) => (e.target.style.borderColor = "hsl(210,20%,85%)")}
                  />
                </div>
              </div>

              {/* Date + Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "hsl(215,20%,55%)" }}>Дата</label>
                  <input
                    type="date"
                    value={form.service_date}
                    onChange={(e) => set("service_date", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "hsl(198,80%,40%)")}
                    onBlur={(e) => (e.target.style.borderColor = "hsl(210,20%,85%)")}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "hsl(215,20%,55%)" }}>Время</label>
                  <select
                    value={form.service_time}
                    onChange={(e) => set("service_time", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors"
                    style={{ ...inputStyle, color: form.service_time ? "hsl(215,40%,12%)" : "hsl(215,20%,60%)" }}
                  >
                    <option value="">Выберите</option>
                    {["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Service type */}
              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: "hsl(215,20%,55%)" }}>Вид услуги</label>
                <div className="space-y-2">
                  {SERVICES.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => set("service_type", s.value)}
                      className="w-full text-left px-3.5 py-2.5 rounded-lg border-2 transition-all flex items-center gap-3"
                      style={{
                        borderColor: form.service_type === s.value ? "hsl(215,60%,22%)" : "hsl(210,20%,88%)",
                        background: form.service_type === s.value ? "hsl(215,60%,97%)" : "#fff",
                      }}
                    >
                      <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                        style={{ borderColor: form.service_type === s.value ? "hsl(215,60%,22%)" : "hsl(210,20%,75%)" }}>
                        {form.service_type === s.value && (
                          <div className="w-2 h-2 rounded-full" style={{ background: "hsl(215,60%,22%)" }} />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "hsl(215,40%,12%)" }}>{s.label}</p>
                        <p className="text-xs" style={{ color: "hsl(215,20%,55%)" }}>{s.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment */}
              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: "hsl(215,20%,55%)" }}>Способ оплаты</label>
                <div className="flex gap-3">
                  {PAYMENT.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => set("payment_type", p.value)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 text-sm font-medium transition-all"
                      style={{
                        borderColor: form.payment_type === p.value ? "hsl(215,60%,22%)" : "hsl(210,20%,88%)",
                        background: form.payment_type === p.value ? "hsl(215,60%,97%)" : "#fff",
                        color: form.payment_type === p.value ? "hsl(215,60%,22%)" : "hsl(215,20%,50%)",
                      }}
                    >
                      <Icon name={p.icon} fallback="Circle" size={15} />
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {formError && (
                <div className="flex items-center gap-2 p-3 rounded-lg text-sm" style={{ background: "hsl(0,80%,97%)", color: "hsl(0,70%,40%)", border: "1px solid hsl(0,80%,90%)" }}>
                  <Icon name="AlertCircle" size={14} />
                  {formError}
                </div>
              )}

              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-3 rounded-lg font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all"
                style={{ background: formLoading ? "hsl(215,60%,35%)" : "hsl(215,60%,22%)" }}
              >
                {formLoading ? <Icon name="Loader2" size={15} className="animate-spin" /> : <Icon name="Send" size={15} />}
                {formLoading ? "Отправка..." : "Подать заявку"}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT — Order history */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold" style={{ color: "hsl(215,40%,12%)" }}>
              История заявок
              {orders.length > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "hsl(210,20%,90%)", color: "hsl(215,20%,45%)" }}>
                  {orders.length}
                </span>
              )}
            </h2>
            <button onClick={loadOrders} className="text-xs flex items-center gap-1.5 transition-colors" style={{ color: "hsl(215,20%,55%)" }}>
              <Icon name="RefreshCw" size={12} />
              Обновить
            </button>
          </div>

          {ordersLoading && (
            <div className="flex items-center justify-center py-16" style={{ color: "hsl(215,20%,55%)" }}>
              <Icon name="Loader2" size={20} className="animate-spin mr-2" />
              Загрузка...
            </div>
          )}

          {!ordersLoading && orders.length === 0 && (
            <div className="text-center py-16 rounded-2xl border border-dashed" style={{ borderColor: "hsl(210,20%,82%)" }}>
              <Icon name="ClipboardList" size={32} className="mx-auto mb-3" style={{ color: "hsl(215,20%,70%)" } as React.CSSProperties} />
              <p className="font-medium text-sm mb-1" style={{ color: "hsl(215,40%,12%)" }}>Заявок пока нет</p>
              <p className="text-xs" style={{ color: "hsl(215,20%,60%)" }}>Заполните форму слева, чтобы оставить первую заявку</p>
            </div>
          )}

          {!ordersLoading && orders.length > 0 && (
            <div className="space-y-3">
              {orders.map((order) => {
                const st = STATUS_LABELS[order.status] || STATUS_LABELS.new;
                return (
                  <div key={order.id} className="bg-white rounded-xl border p-4 transition-shadow hover:shadow-sm" style={{ borderColor: "hsl(210,20%,88%)" }}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm" style={{ color: "hsl(215,40%,12%)" }}>№{order.id}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ color: st.color, background: st.bg }}>
                          {st.label}
                        </span>
                      </div>
                      <span className="text-xs flex-shrink-0" style={{ color: "hsl(215,20%,60%)" }}>
                        {new Date(order.created_at).toLocaleDateString("ru-RU")}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-sm" style={{ color: "hsl(215,20%,45%)" }}>
                      <div className="flex items-center gap-2">
                        <Icon name="Sparkles" size={12} style={{ color: "hsl(198,80%,40%)", flexShrink: 0 } as React.CSSProperties} />
                        <span className="font-medium" style={{ color: "hsl(215,30%,25%)" }}>{SERVICE_LABELS[order.service_type] || order.service_type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="Calendar" size={12} style={{ flexShrink: 0 } as React.CSSProperties} />
                        {order.service_date} в {order.service_time}
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="MapPin" size={12} style={{ flexShrink: 0 } as React.CSSProperties} />
                        <span className="truncate">{order.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="CreditCard" size={12} style={{ flexShrink: 0 } as React.CSSProperties} />
                        {order.payment_type === "cash" ? "Наличные" : "Банковская карта"}
                      </div>
                    </div>
                    {order.cancel_reason && (
                      <div className="mt-3 px-3 py-2 rounded-lg text-xs" style={{ background: "hsl(0,70%,96%)", color: "hsl(0,60%,42%)" }}>
                        Причина отмены: {order.cancel_reason}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
}
