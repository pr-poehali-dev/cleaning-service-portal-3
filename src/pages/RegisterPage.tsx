import { useState } from "react";
import { AppState, Page, User } from "./Index";
import Icon from "@/components/ui/icon";

interface Props {
  state: AppState;
  navigate: (page: Page) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const RegisterPage = ({ navigate }: Props) => {
  const [form, setForm] = useState({ login: "", password: "", full_name: "", phone: "", email: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const { login, password, full_name, phone, email } = form;
    if (!login || !password || !full_name || !phone || !email) {
      setError("Все поля обязательны для заполнения");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("https://functions.poehali.dev/8ae2d9de-6152-40a1-929c-fad6d7420ea4", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register", ...form }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Ошибка регистрации");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Ошибка соединения с сервером");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: "full_name", label: "ФИО", placeholder: "Иванов Иван Иванович", icon: "User", type: "text" },
    { key: "login", label: "Логин", placeholder: "Уникальный логин", icon: "AtSign", type: "text" },
    { key: "password", label: "Пароль", placeholder: "Надёжный пароль", icon: "Lock", type: "password" },
    { key: "phone", label: "Телефон", placeholder: "+7 (___) ___-__-__", icon: "Phone", type: "tel" },
    { key: "email", label: "Email", placeholder: "example@mail.ru", icon: "Mail", type: "email" },
  ];

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ background: "hsl(210,20%,97%)" }}>
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "hsl(145,60%,92%)" }}>
            <Icon name="CheckCircle" size={32} style={{ color: "hsl(145,60%,35%)" } as React.CSSProperties} />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: "hsl(215,40%,12%)" }}>Регистрация завершена</h2>
          <p className="mb-6" style={{ color: "hsl(215,20%,50%)" }}>Ваш аккаунт успешно создан. Войдите с помощью своих данных.</p>
          <button
            onClick={() => navigate("login")}
            className="px-8 py-2.5 rounded-lg font-semibold text-sm text-white"
            style={{ background: "hsl(215,60%,22%)" }}
          >
            Перейти к входу
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: "hsl(210,20%,97%)" }}>
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded flex items-center justify-center" style={{ background: "hsl(215,60%,22%)" }}>
            <Icon name="Sparkles" size={16} className="text-white" />
          </div>
          <span className="font-semibold text-xl" style={{ color: "hsl(215,40%,12%)" }}>КлинингСервис</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-8" style={{ borderColor: "hsl(210,20%,88%)" }}>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "hsl(215,40%,12%)" }}>Регистрация</h1>
          <p className="text-sm mb-6" style={{ color: "hsl(215,20%,50%)" }}>Создайте аккаунт для доступа к порталу</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ key, label, placeholder, icon, type }) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "hsl(215,30%,30%)" }}>{label}</label>
                <div className="relative">
                  <Icon name={icon} fallback="Circle" size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "hsl(215,20%,55%)" } as React.CSSProperties} />
                  <input
                    type={type}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => set(key, e.target.value)}
                    placeholder={placeholder}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm outline-none transition-all"
                    style={{ borderColor: "hsl(210,20%,85%)", background: "#fff", color: "hsl(215,40%,12%)" }}
                    onFocus={(e) => (e.target.style.borderColor = "hsl(198,80%,40%)")}
                    onBlur={(e) => (e.target.style.borderColor = "hsl(210,20%,85%)")}
                  />
                </div>
              </div>
            ))}

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
              {loading ? "Регистрация..." : "Зарегистрироваться"}
            </button>
          </form>

          <p className="text-center text-sm mt-5" style={{ color: "hsl(215,20%,55%)" }}>
            Уже есть аккаунт?{" "}
            <button onClick={() => navigate("login")} className="font-medium hover:underline" style={{ color: "hsl(198,80%,40%)" }}>
              Войти
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;