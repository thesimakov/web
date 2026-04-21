"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Sparkles, Zap, Globe, Layers, Check, MousePointer } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const [typedText, setTypedText] = useState("")
  const placeholders = [
    "Лендинг для кафе с меню и бронированием...",
    "Сайт-портфолио для дизайнера...",
    "Интернет-магазин одежды...",
  ]
  const [placeholderIndex, setPlaceholderIndex] = useState(0)

  useEffect(() => {
    if (inputValue) {
      setIsTyping(false)
      return
    }

    const currentPlaceholder = placeholders[placeholderIndex]
    let charIndex = 0
    setTypedText("")
    setIsTyping(true)

    const typeInterval = setInterval(() => {
      if (charIndex < currentPlaceholder.length) {
        setTypedText(currentPlaceholder.slice(0, charIndex + 1))
        charIndex++
      } else {
        clearInterval(typeInterval)
        setTimeout(() => {
          setPlaceholderIndex((prev) => (prev + 1) % placeholders.length)
        }, 2000)
      }
    }, 50)

    return () => clearInterval(typeInterval)
  }, [placeholderIndex, inputValue])

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2 animate-fade-up">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold tracking-tight">Spark</span>
            </div>
            
            <nav className="hidden items-center gap-8 md:flex">
              <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Возможности
              </a>
              <a href="#how" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Как это работает
              </a>
              <a href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Цены
              </a>
            </nav>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                Войти
              </Button>
              <Button size="sm">
                Начать бесплатно
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32">
        {/* Animated gradient background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-gradient-to-b from-cyan-500/10 via-purple-500/5 to-transparent blur-3xl animate-float" />
          <div className="absolute right-1/4 top-1/4 h-[300px] w-[300px] rounded-full bg-cyan-500/5 blur-3xl" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 animate-fade-up">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-sm text-muted-foreground">3 000+ проектов создано</span>
          </div>

          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl animate-fade-up-delay-1">
            <span className="glitch-text inline-block">Создайте сайт</span>
            <br />
            <span className="text-muted-foreground">с помощью </span>
            <span className="glitch-text inline-block bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              нейросети
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl animate-fade-up-delay-2">
            Опишите вашу идею — и получите готовый сайт за 60 секунд. 
            Без кода. Без дизайнера. Просто и понятно.
          </p>

          {/* Input Area */}
          <div className="mx-auto mt-10 max-w-2xl animate-fade-up-delay-3">
            <div className="relative rounded-2xl border border-border bg-card p-2 shadow-2xl shadow-black/20 glow-effect shimmer-border">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder=""
                    className="w-full rounded-xl bg-background px-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                  {!inputValue && (
                    <div className="pointer-events-none absolute inset-0 flex items-center px-4">
                      <span className={`text-muted-foreground ${isTyping ? 'typing-cursor' : ''}`}>
                        {typedText}
                      </span>
                    </div>
                  )}
                </div>
                <Button size="lg" className="gap-2 px-6 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0">
                  Создать
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 animate-fade-up-delay-4">
              <span className="text-sm text-muted-foreground">Попробуйте:</span>
              {["Лендинг для кафе", "Портфолио фотографа", "Сайт услуг"].map((example, i) => (
                <button
                  key={example}
                  onClick={() => setInputValue(example)}
                  className="rounded-full border border-border bg-card/50 px-3 py-1 text-sm text-muted-foreground transition-all hover:border-cyan-500/50 hover:text-foreground hover:scale-105"
                  style={{ animationDelay: `${0.5 + i * 0.1}s` }}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Preview hint */}
          <div className="mt-16 flex items-center justify-center gap-2 text-sm text-muted-foreground animate-fade-up-delay-4">
            <MousePointer className="h-4 w-4 animate-bounce" />
            <span>Наведите на заголовок для эффекта</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="border-t border-border py-20 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl glitch-text inline-block">
              Всё просто
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Никаких сложностей — только результат
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Zap className="h-5 w-5" />}
              title="60 секунд"
              description="Готовый сайт за минуту. Просто опишите идею."
              delay={0}
            />
            <FeatureCard
              icon={<Globe className="h-5 w-5" />}
              title="Без кода"
              description="Не нужно разбираться в программировании."
              delay={1}
            />
            <FeatureCard
              icon={<Layers className="h-5 w-5" />}
              title="Адаптивный"
              description="Выглядит отлично на любом устройстве."
              delay={2}
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how" className="border-t border-border py-20 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl glitch-text inline-block">
              Как это работает
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Три простых шага до вашего сайта
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <StepCard
              number="1"
              title="Опишите идею"
              description="Расскажите, какой сайт вам нужен. Можно своими словами."
              delay={0}
            />
            <StepCard
              number="2"
              title="ИИ создаёт"
              description="Нейросеть генерирует дизайн, тексты и код."
              delay={1}
            />
            <StepCard
              number="3"
              title="Публикуйте"
              description="Сайт готов! Можете сразу показать миру."
              delay={2}
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="border-t border-border py-20 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl glitch-text inline-block">
              Простые цены
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Начните бесплатно, платите когда готовы
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
            <PricingCard
              title="Бесплатно"
              price="0 ₽"
              description="Для начала"
              features={[
                "3 проекта",
                "Базовые шаблоны",
                "Поддержка по email"
              ]}
            />
            <PricingCard
              title="Про"
              price="990 ₽"
              period="/месяц"
              description="Для серьёзных проектов"
              features={[
                "Безлимит проектов",
                "Свой домен",
                "Приоритетная поддержка",
                "Расширенные шаблоны"
              ]}
              highlighted
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border py-20 md:py-32 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 bottom-0 -translate-x-1/2 h-[400px] w-[600px] rounded-full bg-gradient-to-t from-cyan-500/10 via-purple-500/5 to-transparent blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl glitch-text inline-block">
            Готовы начать?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Создайте свой первый сайт прямо сейчас
          </p>
          <Button size="lg" className="mt-8 gap-2 px-8 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0 glow-effect">
            Попробовать бесплатно
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold">Spark</span>
            </div>
            
            <nav className="flex flex-wrap items-center justify-center gap-6">
              <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Условия
              </a>
              <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Конфиденциальность
              </a>
              <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Поддержка
              </a>
            </nav>

            <p className="text-sm text-muted-foreground">
              © 2026 Spark
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ 
  icon, 
  title, 
  description,
  delay = 0
}: { 
  icon: React.ReactNode
  title: string
  description: string
  delay?: number
}) {
  return (
    <div 
      className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-cyan-500/30 hover:bg-card/80 hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/10"
      style={{ animationDelay: `${delay * 0.1}s` }}
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 text-foreground group-hover:from-cyan-500/30 group-hover:to-purple-500/30 transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </div>
  )
}

function StepCard({ 
  number, 
  title, 
  description,
  delay = 0
}: { 
  number: string
  title: string
  description: string
  delay?: number
}) {
  return (
    <div className="relative text-center group" style={{ animationDelay: `${delay * 0.1}s` }}>
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-border text-xl font-bold bg-card transition-all duration-300 group-hover:border-cyan-500 group-hover:shadow-lg group-hover:shadow-cyan-500/20 group-hover:scale-110">
        <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          {number}
        </span>
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </div>
  )
}

function PricingCard({ 
  title, 
  price, 
  period = "",
  description, 
  features,
  highlighted = false
}: { 
  title: string
  price: string
  period?: string
  description: string
  features: string[]
  highlighted?: boolean
}) {
  return (
    <div 
      className={`relative rounded-2xl border p-8 transition-all duration-300 hover:scale-[1.02] ${
        highlighted 
          ? "border-cyan-500/50 bg-card shadow-xl shadow-cyan-500/10 shimmer-border" 
          : "border-border bg-card hover:border-cyan-500/30"
      }`}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 px-3 py-1 text-xs font-medium text-white">
          Популярный
        </div>
      )}
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="mb-6">
        <span className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">{price}</span>
        {period && <span className="text-muted-foreground">{period}</span>}
      </div>
      <ul className="mb-8 space-y-3">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3 text-sm">
            <Check className="h-4 w-4 text-cyan-500" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Button 
        className={`w-full ${highlighted ? "bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0" : ""}`}
        variant={highlighted ? "default" : "outline"}
      >
        Выбрать план
      </Button>
    </div>
  )
}
