"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"

import { logout as logoutApi } from "@/app/(auth)/auth-api"
import type { StoredUser } from "@/app/(auth)/token-store"
import { clearSession, getRefreshToken, getStoredUser } from "@/app/(auth)/token-store"
import { RequireAuth } from "@/components/require-auth"
import { Sidebar } from "./sidebar"
import { AmbientBackground } from "./ambient-background"
import { Playground } from "./playground"
import { Projects } from "./projects"
import { Pricing } from "./pricing"
import { Analytics } from "./analytics"
import { Integrations } from "./integrations"
import { Profile } from "./profile"
import { Team } from "./team"
import { Settings } from "./settings"

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

function DashboardInner() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [activeSection, setActiveSection] = useState("playground")
  const [user, setUser] = useState<StoredUser | null>(null)

  useEffect(() => {
    setUser(getStoredUser())
  }, [])

  async function handleLogout() {
    const rt = getRefreshToken()
    if (rt) {
      try {
        await logoutApi(rt)
      } catch {
        /* сеть/API недоступны — всё равно выходим локально */
      }
    }
    clearSession()
    router.push("/login")
    router.refresh()
  }

  const renderContent = () => {
    switch (activeSection) {
      case "playground":
        return <Playground />
      case "projects":
        return <Projects />
      case "pricing":
        return <Pricing />
      case "analytics":
        return <Analytics />
      case "integrations":
        return <Integrations />
      case "profile":
        return <Profile />
      case "team":
        return <Team />
      case "settings":
        return <Settings />
      default:
        return <Playground />
    }
  }

  return (
    <div className="relative flex min-h-screen bg-background">
      <AmbientBackground />
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isDarkMode={(theme ?? "dark") !== "light"}
        onThemeToggle={() => setTheme((theme ?? "dark") === "light" ? "dark" : "light")}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="relative ml-64 flex-1 p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

export function Dashboard() {
  return (
    <RequireAuth>
      <DashboardInner />
    </RequireAuth>
  )
}
