import Link from "next/link";
import Image from "next/image";

const product = [
  { href: "/#features", label: "Возможности" },
  { href: "/#preview", label: "Пример страницы" },
  { href: "/editor", label: "Редактор" },
  { href: "/dashboard", label: "Мои сайты" },
];

const company = [
  { href: "#", label: "Условия — скоро" },
  { href: "#", label: "Конфиденциальность — скоро" },
];

const resources = [{ href: "/#faq", label: "FAQ" }];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.06] bg-zinc-950 py-16">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10 sm:px-6">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2">
            <Image
              src="/lemnity.svg"
              alt="Lemnity"
              width={120}
              height={24}
              className="h-6 w-auto opacity-90"
            />
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-500">
            ИИ-конструктор страниц: JSON-схема, codegen и безопасный рендер в React — в духе
            современных AI-билдеров.
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-zinc-500">
            Продукт
          </p>
          <ul className="mt-4 space-y-3 text-sm text-zinc-400">
            {product.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-zinc-500">
            Компания
          </p>
          <ul className="mt-4 space-y-3 text-sm text-zinc-400">
            {company.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="transition hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-zinc-500">
            Ресурсы
          </p>
          <ul className="mt-4 space-y-3 text-sm text-zinc-400">
            {resources.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="transition hover:text-white"
                  {...("external" in item && item.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-14 max-w-6xl border-t border-white/[0.06] px-4 pt-8 text-center text-xs text-zinc-600 sm:px-6 sm:text-left">
        © {new Date().getFullYear()} Lemnity. Все права защищены.
      </div>
    </footer>
  );
}
