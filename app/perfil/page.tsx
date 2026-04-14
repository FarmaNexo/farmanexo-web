"use client"

import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { AuthGuard } from "@/components/auth-guard"
import ProfileModal from "@/components/profile-modal"

export default function PerfilPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AuthGuard>
        <ProfileModal isOpen onClose={() => router.push("/")} />
      </AuthGuard>
    </div>
  )
}
