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

const SERVICE_SHORT: Record<string, string> = {
  "general": "Общий клининг",
  "deep": "Генеральная уборка",
  "postconstruction": "Послестроительная",
  "carpet": "Химчистка",
};

export default function OrdersPage({ state, navigate, logout }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("https://functions.poehali.dev/e714671a-065f-40af-9d8a-bccef241386e", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "list", token: state.token }),
        });
        const data = await res.json();
        if (data.orders) setOrders(data.orders);
        else setError(data.error || "Ошибка загрузки");
      } catch {
        setError("Ошибка соединения");
      } finally {
        setLoading(false);
      }
    })();
  }, [state.token]);

  return (
    <Layout state={state} navigate={navigate} logout={logout} title="Мои заявки">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm" style={{ color: "hsl(215,20%,50%)" }}>
          {orders.length > 0 ? `Всего заявок: ${orders.length}` : "Здесь будут отображаться ваши заявки"}
        </p>
        <button
          onClick={() => navigate("new-order")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: "hsl(215,60%,22%)" }}
        >
          <Icon name="Plus" size={15} />
          Новая заявка
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20" style={{ color: "hsl(215,20%,55%)" }}>
          <Icon name="Loader2" size={24} className="animate-spin mr-3" />
          Загрузка заявок...
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg text-sm" style={{ background: "hsl(0,80%,97%)", color: "hsl(0,70%,40%)" }}>
          {error}
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "hsl(210,20%,92%)" }}>
            <Icon name="ClipboardList" size={28} style={{ color: "hsl(215,20%,55%)" } as React.CSSProperties} />
          </div>
          <h3 className="font-semibold mb-1" style={{ color: "hsl(215,40%,12%)" }}>Нет заявок</h3>
          <p className="text-sm mb-5" style={{ color: "hsl(215,20%,55%)" }}>Создайте первую заявку на уборку</p>
          <button
            onClick={() => navigate("new-order")}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white"
            style={{ background: "hsl(215,60%,22%)" }}
          >
            Создать заявку
          </button>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((order) => {
            const st = STATUS_LABELS[order.status] || STATUS_LABELS.new;
            return (
              <div key={order.id} className="bg-white rounded-xl border p-5" style={{ borderColor: "hsl(210,20%,88%)" }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-sm" style={{ color: "hsl(215,40%,12%)" }}>
                        Заявка №{order.id}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ color: st.color, background: st.bg }}>
                        {st.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm" style={{ color: "hsl(215,20%,45%)" }}>
                      <span className="flex items-center gap-1.5">
                        <Icon name="Sparkles" size={12} />
                        {SERVICE_SHORT[order.service_type] || order.service_type}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Icon name="Calendar" size={12} />
                        {order.service_date} в {order.service_time}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Icon name="MapPin" size={12} />
                        <span className="truncate">{order.address}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Icon name="CreditCard" size={12} />
                        {order.payment_type === "cash" ? "Наличные" : "Банковская карта"}
                      </span>
                    </div>
                    {order.cancel_reason && (
                      <p className="mt-2 text-xs px-2.5 py-1.5 rounded" style={{ background: "hsl(0,70%,96%)", color: "hsl(0,60%,45%)" }}>
                        Причина отмены: {order.cancel_reason}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs" style={{ color: "hsl(215,20%,60%)" }}>
                      {new Date(order.created_at).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}