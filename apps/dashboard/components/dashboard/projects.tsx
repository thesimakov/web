"use client"

import { formatDistanceToNow } from "date-fns"
import { enUS, ru } from "date-fns/locale"
import { motion } from "framer-motion"
import { Clock, ExternalLink, Globe, MoreHorizontal, Plus } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import type { ApiProject } from "@/lib/api-client"
import { createProject, listProjects } from "@/lib/api-client"
import { useI18n } from "@/components/i18n-provider"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const THUMBS = [
  "from-amber-500/20 to-orange-500/20",
  "from-blue-500/20 to-cyan-500/20",
  "from-purple-500/20 to-pink-500/20",
  "from-green-500/20 to-emerald-500/20",
  "from-rose-500/20 to-red-500/20",
  "from-violet-500/20 to-indigo-500/20",
] as const

function thumbClass(i: number) {
  return THUMBS[i % THUMBS.length]
}

export function Projects() {
  const { lang, t } = useI18n()
  const [projects, setProjects] = useState<ApiProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const list = await listProjects()
      setProjects(list)
    } catch (e) {
      setError(e instanceof Error ? e.message : t("projects_load_failed"))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function handleCreate() {
    const name = newName.trim()
    if (name.length < 2) {
      toast.error(t("projects_name_too_short"))
      return
    }
    setCreating(true)
    try {
      const p = await createProject(name)
      setProjects((prev) => [p, ...prev])
      setCreateOpen(false)
      setNewName("")
      toast.success(t("projects_created"))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("projects_create_error"))
    } finally {
      setCreating(false)
    }
  }

  const distanceLocale = lang === "ru" ? ru : enUS

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t("projects_title")}</h1>
          <p className="mt-1 text-muted-foreground">
            {loading ? t("loading") : `${projects.length} ${t("projects_count")}`}
          </p>
        </div>
        <Button
          type="button"
          className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t("projects_new")}
        </Button>
      </div>

      {error ? (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          <p>{error}</p>
          <button
            type="button"
            className="mt-2 text-xs underline underline-offset-2 hover:text-red-100"
            onClick={() => void load()}
          >
            {t("retry")}
          </button>
        </div>
      ) : null}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("projects_dialog_title")}</DialogTitle>
            <DialogDescription>
              {t("projects_dialog_desc")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="project-name">{t("projects_name_label")}</Label>
            <Input
              id="project-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t("projects_name_placeholder")}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleCreate()
              }}
            />
          </div>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
              {t("cancel")}
            </Button>
            <Button
              type="button"
              className="bg-gradient-to-r from-purple-600 to-pink-600"
              disabled={creating}
              onClick={() => void handleCreate()}
            >
              {creating ? t("creating") : t("create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!loading && projects.length === 0 && !error ? (
        <div className="glass rounded-2xl p-10 text-center">
          <p className="text-muted-foreground">{t("empty_projects")}</p>
          <Button
            type="button"
            className="mt-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("create_project")}
          </Button>
        </div>
      ) : null}

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="glass h-64 animate-pulse rounded-2xl"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="glass glass-hover group cursor-pointer rounded-2xl p-4 transition-all duration-300"
            >
              <div
                className={`mb-4 flex h-40 items-center justify-center rounded-xl bg-gradient-to-br ${thumbClass(index)}`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-white/20" />
                  <div className="h-3 w-20 rounded bg-white/20" />
                  <div className="h-2 w-16 rounded bg-white/10" />
                </div>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-foreground">{project.name}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="text-sm text-muted-foreground">{project.slug}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(project.updatedAt), {
                        addSuffix: true,
                        locale: distanceLocale,
                      })}
                    </span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className=""
                  >
                    <DropdownMenuItem>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      {t("projects_open")}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Globe className="mr-2 h-4 w-4" />
                      {t("projects_deploy_soon")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
