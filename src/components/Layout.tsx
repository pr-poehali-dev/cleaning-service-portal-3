import Icon from "@/components/ui/icon";
import { AppState, Page } from "@/pages/Index";

interface LayoutProps {
  children: React.ReactNode;
  state: AppState;
  navigate: (page: Page) => void;
  logout: () => void;
  title?: string;
}

const Layout = ({ children, state, navigate, logout, title }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "hsl(210,20%,97%)" }}>
      {/* Header */}
      <header style={{ background: "hsl(215,60%,22%)" }} className="shadow-lg">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: "hsl(198,80%,40%)" }}>
              <Icon name="Sparkles" size={16} className="text-white" />
            </div>
            <span className="text-white font-semibold text-lg tracking-wide">КлинингСервис</span>
          </div>

          {state.user && (
            <div className="flex items-center gap-4">
              {!state.user.is_admin && (
                <button
                  onClick={() => navigate("orders")}
                  className={`text-sm px-3 py-1.5 rounded transition-all ${state.page === "orders" ? "bg-white/20 text-white" : "text-white/70 hover:text-white"}`}
                >
                  Мои заявки
                </button>
              )}
              {state.user.is_admin && (
                <button
                  onClick={() => navigate("admin")}
                  className="text-sm px-3 py-1.5 rounded text-white/70 hover:text-white transition-all"
                >
                  Панель администратора
                </button>
              )}

              <div className="flex items-center gap-2 pl-3 border-l border-white/20">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "hsl(198,80%,40%)" }}>
                  {state.user.full_name.charAt(0)}
                </div>
                <span className="text-white/80 text-sm hidden sm:block">{state.user.full_name.split(" ")[0]}</span>
                <button onClick={logout} className="text-white/50 hover:text-white transition-colors ml-1">
                  <Icon name="LogOut" size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Page title bar */}
      {title && (
        <div className="border-b" style={{ background: "hsl(0,0%,100%)", borderColor: "hsl(210,20%,88%)" }}>
          <div className="max-w-6xl mx-auto px-6 py-4">
            <h1 className="text-xl font-semibold" style={{ color: "hsl(215,40%,12%)" }}>{title}</h1>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        {children}
      </main>

      <footer className="border-t py-4 text-center text-sm" style={{ borderColor: "hsl(210,20%,88%)", color: "hsl(215,20%,55%)" }}>
        © 2024 КлинингСервис — профессиональная уборка
      </footer>
    </div>
  );
};

export default Layout;