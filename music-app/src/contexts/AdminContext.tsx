import { createContext, useContext } from "react";
import { useGetAdminMe } from "@workspace/api-client-react";

interface AdminContextValue {
  isAuthenticated: boolean;
  username: string | null;
  isLoading: boolean;
}

const AdminContext = createContext<AdminContextValue>({
  isAuthenticated: false,
  username: null,
  isLoading: true,
});

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useGetAdminMe();

  return (
    <AdminContext.Provider
      value={{
        isAuthenticated: data?.authenticated ?? false,
        username: data?.username ?? null,
        isLoading,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
