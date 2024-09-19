

import { PermissionProvider } from "@/utils"
import { Navigate, Outlet } from "react-router-dom"

export function ProtectAdminHrManager() {
  const P=PermissionProvider()
  return P?.IS_ADMIN_OR_HR ? <Outlet /> : <Navigate to="/home" replace={true} />
}
