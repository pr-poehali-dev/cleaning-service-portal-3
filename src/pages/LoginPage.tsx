import { useState } from "react";
import { AppState, Page, User } from "./Index";
import Icon from "@/components/ui/icon";

interface Props {
  state: AppState;
  navigate: (page: Page) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const LoginPage = ({ navigate, login }: Props) => {
  const [form, setForm] = useState({ login: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.login.trim() || !form.password.trim()) {
      setError("Введите логин и пароль");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("https://functions.poehali.dev/8ae2d9de-6152-40a1-929c-fad6d7420ea4", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", ...form }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Ошибка входа");
      } else {
        login(data.user, data.token);
      }
    } catch {
      setError("Ошибка соединения с сервером");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "hsl(210,20%,97%)" }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12" style={{ background: "hsl(215,60%,22%)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded flex items-center justify-center" style={{ background: "hsl(198,80%,40%)" }}>
            <Icon name="Sparkles" size={18} className="text-white" />
          </div>
          <span className="text-white font-semibold text-xl">КлинингСервис</span>
        </div>
        <div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Профессиональная<br />уборка — это просто
          </h2>
          <p className="text-white/60 text-lg mb-8">Подайте заявку онлайн и наши специалисты займутся остальным</p>
          <div className="space-y-3">
            {["Общий клининг", "Генеральная уборка", "Послестроительная уборка", "Химчистка ковров и мебели"].map((s) => (
              <div key={s} className="flex items-center gap-3 text-white/70">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "hsl(198,80%,40%)" }}>
                  <Icon name="Check" size={11} className="text-white" />
                </div>
                <span className="text-sm">{s}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/30 text-sm">© 2024 КлинингСервис</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: "hsl(215,60%,22%)" }}>
              <Icon name="Sparkles" size={15} className="text-white" />
            </div>
            <span className="font-semibold text-lg" style={{ color: "hsl(215,40%,12%)" }}>КлинингСервис</span>
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ color: "hsl(215,40%,12%)" }}>Вход в систему</h1>
          <p className="text-sm mb-8" style={{ color: "hsl(215,20%,50%)" }}>Введите ваши данные для доступа к порталу</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "hsl(215,30%,30%)" }}>Логин</label>
              <div className="relative">
                <Icon name="User" size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "hsl(215,20%,55%)" } as React.CSSProperties} />
                <input
                  type="text"
                  value={form.login}
                  onChange={(e) => setForm({ ...form, login: e.target.value })}
                  placeholder="Ваш логин"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm outline-none transition-all"
                  style={{ borderColor: "hsl(210,20%,85%)", background: "#fff", color: "hsl(215,40%,12%)" }}
                  onFocus={(e) => (e.target.style.borderColor = "hsl(198,80%,40%)")}
                  onBlur={(e) => (e.target.style.borderColor = "hsl(210,20%,85%)")}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "hsl(215,30%,30%)" }}>Пароль</label>
              <div className="relative">
                <Icon name="Lock" size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "hsl(215,20%,55%)" } as React.CSSProperties} />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Ваш пароль"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm outline-none transition-all"
                  style={{ borderColor: "hsl(210,20%,85%)", background: "#fff", color: "hsl(215,40%,12%)" }}
                  onFocus={(e) => (e.target.style.borderColor = "hsl(198,80%,40%)")}
                  onBlur={(e) => (e.target.style.borderColor = "hsl(210,20%,85%)")}
                />
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
              className="w-full py-2.5 rounded-lg font-semibold text-sm text-white transition-all mt-2"
              style={{ background: loading ? "hsl(215,60%,35%)" : "hsl(215,60%,22%)" }}
            >
              {loading ? "Выполняется вход..." : "Войти"}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: "hsl(215,20%,55%)" }}>
            Нет аккаунта?{" "}
            <button onClick={() => navigate("register")} className="font-medium hover:underline" style={{ color: "hsl(198,80%,40%)" }}>
              Зарегистрироваться
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
