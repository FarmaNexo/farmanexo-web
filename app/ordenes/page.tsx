"use client"

import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { AuthGuard } from "@/components/auth-guard"
import { OrdersModal } from "@/components/orders-modal"

export default function OrdenesPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AuthGuard>
        <OrdersModal isOpen onClose={() => router.push("/")} />
      </AuthGuard>
    </div>
  )
}
