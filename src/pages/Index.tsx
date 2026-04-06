import { useState } from "react";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import OrdersPage from "./OrdersPage";
import NewOrderPage from "./NewOrderPage";
import AdminPage from "./AdminPage";

export type Page = "login" | "register" | "orders" | "new-order" | "admin";

export interface User {
  id: number;
  login: string;
  full_name: string;
  email: string;
  phone: string;
  is_admin: boolean;
}

export interface AppState {
  user: User | null;
  token: string | null;
  page: Page;
}

const Index = () => {
  const [state, setState] = useState<AppState>({
    user: null,
    token: null,
    page: "login",
  });

  const navigate = (page: Page) => setState((s) => ({ ...s, page }));

  const login = (user: User, token: string) => {
    setState({ user, token, page: user.is_admin ? "admin" : "orders" });
  };

  const logout = () => setState({ user: null, token: null, page: "login" });

  const props = { state, navigate, login, logout };

  return (
    <div className="min-h-screen bg-background font-sans">
      {state.page === "login" && <LoginPage {...props} />}
      {state.page === "register" && <RegisterPage {...props} />}
      {state.page === "orders" && <OrdersPage {...props} />}
      {state.page === "new-order" && <NewOrderPage {...props} />}
      {state.page === "admin" && <AdminPage {...props} />}
    </div>
  );
};

export default Index;
