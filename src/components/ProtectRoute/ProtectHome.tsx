

import { useInfoUser } from "@/hooks"
import { Navigate, Outlet } from "react-router-dom"

export function ProtectHome() {
  const user=useInfoUser()
  return user ? <Outlet /> : <Navigate to="/" replace={true} />
}
