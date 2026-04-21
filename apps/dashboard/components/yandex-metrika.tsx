/* eslint-disable @next/next/no-img-element -- required by Yandex Metrica noscript pixel */
'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

declare global {
  interface Window {
    ym?: (...args: any[]) => void
  }
}

type YandexMetrikaProps = {
  id: number
  /** включить webvisor, clickmap, trackLinks, accurateTrackBounce */
  options?: {
    webvisor?: boolean
    clickmap?: boolean
    trackLinks?: boolean
    accurateTrackBounce?: boolean
  }
  /** отправлять hit при переходах внутри SPA */
  trackPageViews?: boolean
}

export function YandexMetrika({
  id,
  options = { webvisor: true, clickmap: true, trackLinks: true, accurateTrackBounce: true },
  trackPageViews = true,
}: YandexMetrikaProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!trackPageViews) return
    if (!window.ym) return
    const qs = searchParams?.toString()
    const url = qs ? `${pathname}?${qs}` : pathname
    window.ym(id, 'hit', url)
  }, [id, trackPageViews, pathname, searchParams])

  const init = `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
  m[i].l=1*new Date();
  for (var j = 0; j < document.scripts.length; j++) { if (document.scripts[j].src === r) { return; } }
  k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
  (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
  ym(${id}, "init", ${JSON.stringify(options)});`

  return (
    <>
      <Script id={`ym-init-${id}`} strategy="afterInteractive">
        {init}
      </Script>
      <noscript>
        <div>
          <img
            src={`https://mc.yandex.ru/watch/${id}`}
            style={{ position: 'absolute', left: '-9999px' }}
            alt=""
          />
        </div>
      </noscript>
    </>
  )
}

