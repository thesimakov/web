"use client"

import { motion } from "framer-motion"
import {
  Home,
  FolderOpen,
  CreditCard,
  BarChart3,
  Puzzle,
  User,
  Users,
  Settings,
  Moon,
  Sun,
  LogOut,
} from "lucide-react"
import type { StoredUser } from "@/app/(auth)/token-store"
import { BrandLogo } from "@/components/brand-logo"
import { useI18n } from "@/components/i18n-provider"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

function initialsFromEmail(email: string) {
  const local = email.split("@")[0] ?? email
  if (local.length >= 2) return local.slice(0, 2).toUpperCase()
  return email.slice(0, 2).toUpperCase()
}

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  isDarkMode: boolean
  onThemeToggle: () => void
  user: StoredUser | null
  onLogout: () => void | Promise<void>
}

const navItems = [
  { id: "playground", labelKey: "nav_playground", icon: Home },
  { id: "projects", labelKey: "nav_projects", icon: FolderOpen },
  { id: "pricing", labelKey: "nav_pricing", icon: CreditCard },
  { id: "analytics", labelKey: "nav_analytics", icon: BarChart3 },
  { id: "integrations", labelKey: "nav_integrations", icon: Puzzle },
  { id: "profile", labelKey: "nav_profile", icon: User },
  { id: "team", labelKey: "nav_team", icon: Users },
  { id: "settings", labelKey: "nav_settings", icon: Settings },
]

export function Sidebar({
  activeSection,
  onSectionChange,
  isDarkMode,
  onThemeToggle,
  user,
  onLogout,
}: SidebarProps) {
  const { t } = useI18n()
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-border/60 bg-background/70 backdrop-blur-xl"
    >
      {/* Logo — public/logo-w.svg */}
      <div className="flex items-center px-6 py-6">
        <BrandLogo height={28} className="max-w-[calc(100%-3rem)]" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id

          return (
            <motion.button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {t(item.labelKey as any)}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto h-1.5 w-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                />
              )}
            </motion.button>
          )
        })}
      </nav>

      {/* User & Theme */}
      <div className="border-t border-border/60 p-4">
        {/* Theme Toggle */}
        <div
          role="button"
          tabIndex={0}
          onClick={onThemeToggle}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              onThemeToggle()
            }
          }}
          className="mb-4 flex w-full cursor-pointer items-center justify-between rounded-xl bg-muted/50 px-4 py-3 text-left transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          aria-label={isDarkMode ? t("theme_dark") : t("theme_light")}
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isDarkMode ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
            <span>{isDarkMode ? t("theme_dark") : t("theme_light")}</span>
          </div>
          <Switch
            checked={isDarkMode}
            onCheckedChange={() => onThemeToggle()}
            aria-label={isDarkMode ? t("theme_dark") : t("theme_light")}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* User */}
        <div className="space-y-2 rounded-xl bg-muted/40 px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-border/60">
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-xs text-white">
                {user ? initialsFromEmail(user.email) : "—"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {user?.email ?? "…"}
              </p>
              <p className="truncate text-xs text-muted-foreground">{t("account")}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            className="w-full justify-center gap-2"
            onClick={() => void onLogout()}
          >
            <LogOut className="h-4 w-4" />
            {t("logout")}
          </Button>
        </div>
      </div>
    </motion.aside>
  )
}
