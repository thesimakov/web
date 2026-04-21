"use client"

import { useMemo, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles,
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  Code,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useI18n } from "@/components/i18n-provider"
import { cn } from "@/lib/utils"

const suggestionChipIds = ["store", "portfolio", "blog", "corporate"] as const
type SuggestionChipId = (typeof suggestionChipIds)[number]

const templateIds = ["coffee", "portfolio", "saas", "agency"] as const
type TemplateId = (typeof templateIds)[number]

const logStepIds = [0, 1, 2, 3, 4] as const
type LogStepId = (typeof logStepIds)[number]

type GenerationStatus = "idle" | "generating" | "complete"
type ViewMode = "desktop" | "tablet" | "mobile"

type BriefingAnswers = Record<string, string>

function isReadyPrompt(text: string) {
  const t = text.trim()
  if (!t) return false
  // эвристика: большой текст или структура/JSON = скорее "готовый промпт"
  if (t.length >= 280) return true
  if (t.includes("finalPrompt") || t.includes("clarifyingQuestions")) return true
  if (t.includes("## ") || t.includes("{") || t.includes("}")) return true
  return false
}

function buildBriefing(t: (key: any) => string, idea: string) {
  const baseQuestions = [
    { id: "goal", label: t("playground_brief_q_goal") },
    { id: "audience", label: t("playground_brief_q_audience") },
    { id: "offer", label: t("playground_brief_q_offer") },
    { id: "pages", label: t("playground_brief_q_pages") },
    { id: "style", label: t("playground_brief_q_style") },
    { id: "cta", label: t("playground_brief_q_cta") },
  ] as const

  return { questions: baseQuestions }
}

function buildFinalPrompt(
  t: (key: any) => string,
  idea: string,
  answers: BriefingAnswers
) {
  const pages = (answers.pages || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
  const pagesLine = pages.length ? pages.join(", ") : t("playground_final_pages_fallback")

  const finalPrompt = `${t("playground_final_intro")}

${t("playground_final_idea")}: ${idea || t("playground_empty")}
${t("playground_final_goal")}: ${answers.goal || t("playground_dash")}
${t("playground_final_audience")}: ${answers.audience || t("playground_dash")}
${t("playground_final_offer")}: ${answers.offer || t("playground_dash")}
${t("playground_final_pages")}: ${pagesLine}
${t("playground_final_style")}: ${
    answers.style || t("playground_final_style_fallback")
  }
${t("playground_final_cta")}: ${answers.cta || t("playground_final_cta_fallback")}

${t("playground_final_requirements_title")}:
- ${t("playground_final_req_1")}
- ${t("playground_final_req_2")}
- ${t("playground_final_req_3")}
- ${t("playground_final_req_4")}`

  const clarifyingQuestions = Object.entries(answers)
    .filter(([, v]) => !String(v ?? "").trim())
    .map(([k]) => k)

  return {
    clarifyingQuestions,
    finalPrompt,
  }
}

export function Playground() {
  const { t } = useI18n()
  const [prompt, setPrompt] = useState("")
  const [status, setStatus] = useState<GenerationStatus>("idle")
  const [currentLogIndex, setCurrentLogIndex] = useState(0)
  const [visibleLogs, setVisibleLogs] = useState<number[]>([])
  const [showLogs, setShowLogs] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>("desktop")
  const [progress, setProgress] = useState(0)
  const [promptDialogOpen, setPromptDialogOpen] = useState(false)
  const [briefingMode, setBriefingMode] = useState<"auto" | "brief" | "ready">("auto")
  const [answers, setAnswers] = useState<BriefingAnswers>({})
  const [finalPromptDraft, setFinalPromptDraft] = useState("")

  const suggestionChips = useMemo(
    () =>
      (suggestionChipIds as readonly SuggestionChipId[]).map((id) => ({
        id,
        label: t(`playground_chip_${id}` as any),
        prompt: t(`playground_chip_prompt_${id}` as any),
      })),
    [t]
  )

  const templates = useMemo(
    () => [
      {
        id: "coffee" as const,
        title: t("playground_tpl_coffee_title"),
        subtitle: t("playground_tpl_coffee_subtitle"),
        prompt: t("playground_tpl_coffee_prompt"),
        gradient: "from-amber-500/20 to-orange-500/20",
      },
      {
        id: "portfolio" as const,
        title: t("playground_tpl_portfolio_title"),
        subtitle: t("playground_tpl_portfolio_subtitle"),
        prompt: t("playground_tpl_portfolio_prompt"),
        gradient: "from-blue-500/20 to-cyan-500/20",
      },
      {
        id: "saas" as const,
        title: t("playground_tpl_saas_title"),
        subtitle: t("playground_tpl_saas_subtitle"),
        prompt: t("playground_tpl_saas_prompt"),
        gradient: "from-purple-500/20 to-pink-500/20",
      },
      {
        id: "agency" as const,
        title: t("playground_tpl_agency_title"),
        subtitle: t("playground_tpl_agency_subtitle"),
        prompt: t("playground_tpl_agency_prompt"),
        gradient: "from-green-500/20 to-emerald-500/20",
      },
    ],
    [t]
  )

  const logSteps = useMemo(
    () =>
      (logStepIds as readonly LogStepId[]).map((id) => ({
        icon: id === 0 ? "🎯" : id === 1 ? "📐" : id === 2 ? "🎨" : id === 3 ? "⚛️" : "✨",
        text: t(`playground_log_${id}` as any),
      })),
    [t]
  )

  const assembledPrompt = useMemo(() => {
    const idea = prompt.trim()
    const { questions } = buildBriefing(t, idea)
    const mode =
      briefingMode === "auto" ? (isReadyPrompt(idea) ? "ready" : "brief") : briefingMode

    if (mode === "ready") {
      return idea
    }

    const questionsBlock = questions
      .map((q, idx) => `${idx + 1}. ${q.label}`)
      .join("\n")

    return `${t("playground_assembled_intro")}

${t("playground_assembled_user_idea")}:
${idea || t("playground_empty")}

${t("playground_assembled_questions")}:
${questionsBlock}

${t("playground_assembled_outro")}`
  }, [prompt, t, briefingMode])

  useEffect(() => {
    const idea = prompt.trim()
    const mode = isReadyPrompt(idea) ? "ready" : "brief"
    if (briefingMode === "auto") setBriefingMode(mode)
  }, [prompt, briefingMode])

  async function copyAssembledPrompt() {
    try {
      await navigator.clipboard.writeText(assembledPrompt)
      toast.success(t("playground_toast_prompt_copied"))
    } catch {
      toast.error(t("playground_toast_copy_failed"))
    }
  }

  const handleGenerate = (promptText?: string) => {
    const text = (promptText ?? prompt).trim()
    if (!text) return
    setStatus("generating")
    setCurrentLogIndex(0)
    setVisibleLogs([])
    setProgress(0)
  }

  function openBriefing() {
    const idea = prompt.trim()
    const mode = isReadyPrompt(idea) ? "ready" : "brief"
    setBriefingMode(mode)
    setPromptDialogOpen(true)

    if (mode === "brief") {
      const { questions } = buildBriefing(t, idea)
      // инициализируем ответы пустыми, чтобы UI был предсказуемым
      setAnswers((prev) => {
        const next: BriefingAnswers = { ...prev }
        for (const q of questions) next[q.id] = next[q.id] ?? ""
        return next
      })
      const built = buildFinalPrompt(t, idea, answers)
      setFinalPromptDraft(built.finalPrompt)
    } else {
      setFinalPromptDraft(idea)
    }
  }

  function recomputeFinalPrompt(nextAnswers: BriefingAnswers) {
    const idea = prompt.trim()
    const built = buildFinalPrompt(t, idea, nextAnswers)
    setFinalPromptDraft(built.finalPrompt)
  }

  function startFromFinalPrompt() {
    const fp = finalPromptDraft.trim()
    if (!fp) {
      toast.error(t("playground_toast_final_prompt_empty"))
      return
    }
    setPrompt(fp)
    setPromptDialogOpen(false)
    // запускаем генерацию сразу с собранным промптом
    handleGenerate(fp)
  }

  useEffect(() => {
    if (status !== "generating") return

    const logInterval = setInterval(() => {
      setCurrentLogIndex((prev) => {
        if (prev < logSteps.length) {
          setVisibleLogs((logs) => [...logs, prev])
          return prev + 1
        }
        return prev
      })
    }, 1200)

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setStatus("complete")
          return 100
        }
        return prev + 2
      })
    }, 120)

    return () => {
      clearInterval(logInterval)
      clearInterval(progressInterval)
    }
  }, [status])

  return (
    <div className="grid h-full grid-cols-2 gap-6">
      {/* Left Column - AI Control */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col"
      >
        <h1 className="mb-6 text-2xl font-semibold text-foreground">
          {t("playground_title")}
        </h1>

        {/* Prompt Input */}
        <div className="glass relative mb-4 rounded-2xl p-1">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t("playground_prompt_placeholder")}
            className="min-h-[140px] resize-none border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
          />
        </div>

        {/* Suggestion Chips */}
        <div className="mb-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            {t("playground_templates_hint")}
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestionChips.map((chip) => (
              <motion.button
                key={chip.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPrompt(chip.prompt)}
                className="max-w-[14rem] truncate rounded-full border border-border/60 bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground sm:px-4 sm:py-2 sm:text-sm"
                title={chip.label}
              >
                {chip.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="button"
              variant="secondary"
              disabled={!prompt.trim()}
              onClick={openBriefing}
              className="h-12 rounded-2xl px-5"
            >
              {t("playground_action_assemble")}
            </Button>
          </motion.div>

          <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => handleGenerate()}
              disabled={!prompt.trim() || status === "generating"}
              className={cn(
                "group relative h-12 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 text-sm font-medium text-white transition-all hover:from-purple-500 hover:to-pink-500 sm:text-base",
                status === "generating" && "animate-pulse-glow"
              )}
            >
              <Sparkles className="mr-2 h-5 w-5 transition-transform group-hover:rotate-12" />
              {status === "generating"
                ? t("playground_action_generating")
                : t("playground_action_generate")}
            </Button>
          </motion.div>
        </div>

        {/* Templates */}
        <div className="mt-6 mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">{t("playground_templates_title")}</h2>
            <span className="text-xs text-muted-foreground">{t("playground_templates_hint")}</span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {templates.map((tpl, idx) => (
              <motion.button
                key={tpl.id}
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setPrompt(tpl.prompt)
                  setBriefingMode("auto")
                  toast.success(`${t("playground_toast_template_selected")}: ${tpl.title}`)
                }}
                className="glass glass-hover rounded-2xl p-4 text-left transition-all duration-300"
              >
                <div className={`mb-3 h-10 w-full rounded-xl bg-gradient-to-r ${tpl.gradient}`} />
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{tpl.title}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{tpl.subtitle}</p>
                  </div>
                  <span className="mt-0.5 text-xs text-muted-foreground">#{idx + 1}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        <Dialog open={promptDialogOpen} onOpenChange={setPromptDialogOpen}>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {briefingMode === "ready"
                  ? t("playground_dialog_ready_title")
                  : t("playground_dialog_brief_title")}
              </DialogTitle>
              <DialogDescription>
                {briefingMode === "ready"
                  ? t("playground_dialog_ready_desc")
                  : t("playground_dialog_brief_desc")}
              </DialogDescription>
            </DialogHeader>

            {briefingMode !== "ready" ? (
              <div className="space-y-3">
                {buildBriefing(t, prompt.trim()).questions.map((q) => (
                  <label key={q.id} className="block">
                    <span className="mb-1 block text-xs text-muted-foreground">{q.label}</span>
                    <input
                      value={answers[q.id] ?? ""}
                      onChange={(e) => {
                        const next = { ...answers, [q.id]: e.target.value }
                        setAnswers(next)
                        recomputeFinalPrompt(next)
                      }}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-ring"
                      placeholder={t("playground_dialog_answer_placeholder")}
                    />
                  </label>
                ))}
              </div>
            ) : null}

            <div className="mt-4">
              <p className="mb-2 text-xs text-muted-foreground">{t("playground_dialog_final_prompt")}</p>
              <Textarea
                value={finalPromptDraft || assembledPrompt}
                onChange={(e) => setFinalPromptDraft(e.target.value)}
                className="min-h-[220px] focus-visible:ring-0"
              />
            </div>

            <DialogFooter className="gap-2 sm:justify-between">
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={() => setPromptDialogOpen(false)}>
                  {t("playground_dialog_close")}
                </Button>
                <Button type="button" variant="secondary" onClick={() => void copyAssembledPrompt()}>
                  {t("playground_dialog_copy")}
                </Button>
              </div>
              <Button
                type="button"
                className="bg-gradient-to-r from-purple-600 to-pink-600"
                onClick={startFromFinalPrompt}
              >
                {t("playground_dialog_assemble_and_run")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* AI Logs */}
        <AnimatePresence>
          {(status === "generating" || status === "complete") && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {t("playground_logs_title")}
                </h3>
                <button
                  onClick={() => setShowLogs(!showLogs)}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  {showLogs ? (
                    <>
                      {t("playground_logs_hide")} <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      {t("playground_logs_show")} <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

              <AnimatePresence>
                {showLogs && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="glass mt-3 space-y-2 rounded-2xl p-4"
                  >
                    {visibleLogs.map((logIndex) => {
                      const step = logSteps[logIndex];
                      if (!step) return null;
                      return (
                        <motion.div
                          key={logIndex}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex items-center gap-3 text-sm"
                        >
                          <span className="text-lg">{step.icon}</span>
                          <span className="text-foreground/80">{step.text}</span>
                          {logIndex === visibleLogs.length - 1 &&
                            status === "generating" && (
                              <motion.span
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ repeat: Infinity, duration: 1 }}
                                className="h-2 w-2 rounded-full bg-purple-500"
                              />
                            )}
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Right Column - Preview */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-col"
      >
        {/* Preview Controls */}
        {status === "complete" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-center justify-between"
          >
            <div className="flex gap-1 rounded-xl bg-muted/30 p-1">
              {[
                { mode: "desktop" as ViewMode, icon: Monitor },
                { mode: "tablet" as ViewMode, icon: Tablet },
                { mode: "mobile" as ViewMode, icon: Smartphone },
              ].map(({ mode, icon: Icon }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    "rounded-lg p-2 transition-colors",
                    viewMode === mode
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                {t("playground_preview_open")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <Code className="mr-2 h-4 w-4" />
                {t("playground_preview_export")}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Preview Area */}
        <div className="glass relative flex-1 overflow-hidden rounded-2xl">
          <AnimatePresence mode="wait">
            {status === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full items-center justify-center"
              >
                <IdleAnimation />
              </motion.div>
            )}

            {status === "generating" && (
              <motion.div
                key="generating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full flex-col items-center justify-center"
              >
                <GeneratingAnimation progress={progress} />
              </motion.div>
            )}

            {status === "complete" && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "mx-auto h-full transition-all duration-300",
                  viewMode === "tablet" && "max-w-[768px]",
                  viewMode === "mobile" && "max-w-[375px]"
                )}
              >
                <PreviewContent />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

function IdleAnimation() {
  const { t } = useI18n()
  return (
    <div className="relative">
      <motion.div
        className="absolute -inset-20 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
        <p className="text-center text-lg text-muted-foreground">
            {t("playground_idle_ready")}
            <br />
          <span className="text-muted-foreground">{t("playground_idle_hint")}</span>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

function GeneratingAnimation({ progress }: { progress: number }) {
  const { t } = useI18n()
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-8 px-8">
      {/* Grid Animation */}
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.15,
            }}
            className="h-16 w-16 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30"
          />
        ))}
      </div>

      {/* Progress */}
      <div className="w-full">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t("playground_generating_label")}</span>
          <span className="text-foreground">{progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  )
}

function PreviewContent() {
  return (
    <div className="h-full w-full overflow-hidden rounded-xl border border-border/60 bg-background">
      {/* Preview Header */}
      <div className="flex items-center gap-2 border-b border-border/60 bg-muted/30 px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-500/80" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <div className="h-3 w-3 rounded-full bg-green-500/80" />
        </div>
        <div className="ml-4 flex-1 rounded-md bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
          preview.lemnity.ai
        </div>
      </div>

      {/* Preview Body */}
      <div className="p-6">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500" />
          <div className="mx-auto mb-3 h-8 w-64 rounded-lg bg-white/10" />
          <div className="mx-auto h-4 w-48 rounded bg-white/5" />
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl bg-white/5 p-4"
            >
              <div className="mb-3 h-8 w-8 rounded-lg bg-purple-500/30" />
              <div className="mb-2 h-4 w-3/4 rounded bg-white/10" />
              <div className="h-3 w-full rounded bg-white/5" />
              <div className="mt-1 h-3 w-2/3 rounded bg-white/5" />
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-8 text-center">
          <div className="mx-auto h-10 w-32 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500" />
        </div>
      </div>
    </div>
  )
}
