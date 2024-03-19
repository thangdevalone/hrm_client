

import { useInfoUser } from "@/hooks"
import { Navigate, Outlet } from "react-router-dom"

export function ProtectAuth() {
  const user=useInfoUser()
  return !user ? <Outlet /> : <Navigate to="/home" replace={true} />
}
