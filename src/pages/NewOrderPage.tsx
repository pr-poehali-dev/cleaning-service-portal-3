import { useState } from "react";
import { AppState, Page } from "./Index";
import Layout from "@/components/Layout";
import Icon from "@/components/ui/icon";

interface Props {
  state: AppState;
  navigate: (page: Page) => void;
  login: (user: unknown, token: string) => void;
  logout: () => void;
}

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

export default function NewOrderPage({ state, navigate, logout }: Props) {
  const [form, setForm] = useState({
    address: "",
    contact_phone: state.user?.phone || "",
    contact_email: state.user?.email || "",
    service_date: "",
    service_time: "",
    service_type: "",
    payment_type: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const { address, contact_phone, contact_email, service_date, service_time, service_type, payment_type } = form;
    if (!address || !contact_phone || !contact_email || !service_date || !service_time || !service_type || !payment_type) {
      setError("Все поля обязательны для заполнения");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("https://functions.poehali.dev/e714671a-065f-40af-9d8a-bccef241386e", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", token: state.token, ...form }),
      });
      const data = await res.json();
      if (!res.ok || data.error) setError(data.error || "Ошибка создания заявки");
      else setSuccess(true);
    } catch {
      setError("Ошибка соединения с сервером");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Layout state={state} navigate={navigate} logout={logout} title="Новая заявка">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ background: "hsl(145,60%,92%)" }}>
            <Icon name="CheckCircle" size={32} style={{ color: "hsl(145,60%,35%)" } as React.CSSProperties} />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: "hsl(215,40%,12%)" }}>Заявка принята!</h2>
          <p className="mb-6 max-w-sm" style={{ color: "hsl(215,20%,50%)" }}>
            Ваша заявка успешно создана. Наш специалист свяжется с вами для подтверждения.
          </p>
          <div className="flex gap-3">
            <button onClick={() => navigate("orders")} className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: "hsl(215,60%,22%)" }}>
              Мои заявки
            </button>
            <button onClick={() => { setSuccess(false); setForm({ address: "", contact_phone: state.user?.phone || "", contact_email: state.user?.email || "", service_date: "", service_time: "", service_type: "", payment_type: "" }); }}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold border" style={{ borderColor: "hsl(210,20%,80%)", color: "hsl(215,40%,12%)" }}>
              Ещё заявка
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout state={state} navigate={navigate} logout={logout} title="Новая заявка">
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact & address */}
          <div className="bg-white rounded-xl border p-6 space-y-4" style={{ borderColor: "hsl(210,20%,88%)" }}>
            <h2 className="font-semibold text-base flex items-center gap-2" style={{ color: "hsl(215,40%,12%)" }}>
              <Icon name="MapPin" size={16} style={{ color: "hsl(198,80%,40%)" } as React.CSSProperties} />
              Контактные данные
            </h2>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "hsl(215,30%,30%)" }}>Адрес уборки</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="г. Москва, ул. Ленина, д. 1, кв. 10"
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
                style={{ borderColor: "hsl(210,20%,85%)", color: "hsl(215,40%,12%)" }}
                onFocus={(e) => (e.target.style.borderColor = "hsl(198,80%,40%)")}
                onBlur={(e) => (e.target.style.borderColor = "hsl(210,20%,85%)")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "hsl(215,30%,30%)" }}>Телефон</label>
                <input
                  type="tel"
                  value={form.contact_phone}
                  onChange={(e) => set("contact_phone", e.target.value)}
                  placeholder="+7 (___) ___-__-__"
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
                  style={{ borderColor: "hsl(210,20%,85%)", color: "hsl(215,40%,12%)" }}
                  onFocus={(e) => (e.target.style.borderColor = "hsl(198,80%,40%)")}
                  onBlur={(e) => (e.target.style.borderColor = "hsl(210,20%,85%)")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "hsl(215,30%,30%)" }}>Email</label>
                <input
                  type="email"
                  value={form.contact_email}
                  onChange={(e) => set("contact_email", e.target.value)}
                  placeholder="email@mail.ru"
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
                  style={{ borderColor: "hsl(210,20%,85%)", color: "hsl(215,40%,12%)" }}
                  onFocus={(e) => (e.target.style.borderColor = "hsl(198,80%,40%)")}
                  onBlur={(e) => (e.target.style.borderColor = "hsl(210,20%,85%)")}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "hsl(215,30%,30%)" }}>Дата</label>
                <input
                  type="date"
                  value={form.service_date}
                  onChange={(e) => set("service_date", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
                  style={{ borderColor: "hsl(210,20%,85%)", color: "hsl(215,40%,12%)" }}
                  onFocus={(e) => (e.target.style.borderColor = "hsl(198,80%,40%)")}
                  onBlur={(e) => (e.target.style.borderColor = "hsl(210,20%,85%)")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "hsl(215,30%,30%)" }}>Время</label>
                <select
                  value={form.service_time}
                  onChange={(e) => set("service_time", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
                  style={{ borderColor: "hsl(210,20%,85%)", color: form.service_time ? "hsl(215,40%,12%)" : "hsl(215,20%,60%)" }}
                >
                  <option value="">Выберите время</option>
                  {["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Service type */}
          <div className="bg-white rounded-xl border p-6" style={{ borderColor: "hsl(210,20%,88%)" }}>
            <h2 className="font-semibold text-base mb-4 flex items-center gap-2" style={{ color: "hsl(215,40%,12%)" }}>
              <Icon name="Sparkles" size={16} style={{ color: "hsl(198,80%,40%)" } as React.CSSProperties} />
              Вид услуги
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SERVICES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => set("service_type", s.value)}
                  className="text-left p-4 rounded-lg border-2 transition-all"
                  style={{
                    borderColor: form.service_type === s.value ? "hsl(215,60%,22%)" : "hsl(210,20%,88%)",
                    background: form.service_type === s.value ? "hsl(215,60%,97%)" : "#fff",
                  }}
                >
                  <p className="font-semibold text-sm mb-0.5" style={{ color: "hsl(215,40%,12%)" }}>{s.label}</p>
                  <p className="text-xs" style={{ color: "hsl(215,20%,55%)" }}>{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl border p-6" style={{ borderColor: "hsl(210,20%,88%)" }}>
            <h2 className="font-semibold text-base mb-4 flex items-center gap-2" style={{ color: "hsl(215,40%,12%)" }}>
              <Icon name="CreditCard" size={16} style={{ color: "hsl(198,80%,40%)" } as React.CSSProperties} />
              Способ оплаты
            </h2>
            <div className="flex gap-3">
              {PAYMENT.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => set("payment_type", p.value)}
                  className="flex-1 flex items-center gap-3 p-4 rounded-lg border-2 transition-all"
                  style={{
                    borderColor: form.payment_type === p.value ? "hsl(215,60%,22%)" : "hsl(210,20%,88%)",
                    background: form.payment_type === p.value ? "hsl(215,60%,97%)" : "#fff",
                  }}
                >
                  <Icon name={p.icon} fallback="Circle" size={18} style={{ color: form.payment_type === p.value ? "hsl(215,60%,22%)" : "hsl(215,20%,55%)" } as React.CSSProperties} />
                  <span className="font-medium text-sm" style={{ color: "hsl(215,40%,12%)" }}>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg text-sm" style={{ background: "hsl(0,80%,97%)", color: "hsl(0,70%,40%)", border: "1px solid hsl(0,80%,90%)" }}>
              <Icon name="AlertCircle" size={15} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 rounded-lg font-semibold text-sm text-white"
            style={{ background: loading ? "hsl(215,60%,35%)" : "hsl(215,60%,22%)" }}
          >
            {loading ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Send" size={16} />}
            {loading ? "Отправка..." : "Подать заявку"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
