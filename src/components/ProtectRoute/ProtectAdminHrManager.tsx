

import { PermissionProvider } from "@/utils"
import { Navigate, Outlet } from "react-router-dom"

export function ProtectAdminHrManager() {
  const P=PermissionProvider()
  return P?.IS_ADMIN_OR_HR_MANAGER ? <Outlet /> : <Navigate to="/home" replace={true} />
}
