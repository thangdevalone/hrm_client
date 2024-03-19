

import { PermissionProvider } from "@/utils"
import { Navigate, Outlet } from "react-router-dom"

export function ProtectAdmin() {
  const P=PermissionProvider()
  return P?.IS_ADMIN ? <Outlet /> : <Navigate to="/home/overview" replace={true} />
}
