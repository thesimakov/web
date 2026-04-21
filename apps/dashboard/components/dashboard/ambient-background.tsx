"use client"

import { motion, useReducedMotion } from "framer-motion"

type Props = {
  className?: string
}

export function AmbientBackground({ className }: Props) {
  const reduce = useReducedMotion()

  return (
    <div
      aria-hidden
      className={[
        "pointer-events-none absolute inset-0 overflow-hidden",
        className ?? "",
      ].join(" ")}
    >
      <div className="absolute inset-0 bg-[radial-gradient(1100px_600px_at_20%_10%,rgba(99,102,241,0.18),transparent_55%),radial-gradient(900px_520px_at_80%_15%,rgba(236,72,153,0.14),transparent_60%),radial-gradient(1000px_650px_at_45%_90%,rgba(16,185,129,0.10),transparent_60%)]" />

      <div className="absolute inset-0 opacity-[0.18] mix-blend-overlay [background-image:url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27240%27 height=%27240%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%27.9%27 numOctaves=%273%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27240%27 height=%27240%27 filter=%27url(%23n)%27 opacity=%27.25%27/%3E%3C/svg%3E')] [background-size:240px_240px]" />

      <motion.div
        className="absolute -left-40 top-[-10rem] h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-purple-500/14 to-pink-500/10 blur-3xl"
        animate={
          reduce
            ? undefined
            : {
                x: [0, 60, 0],
                y: [0, 30, 0],
                rotate: [0, 18, 0],
              }
        }
        transition={
          reduce
            ? undefined
            : { duration: 18, repeat: Infinity, ease: "easeInOut" }
        }
      />

      <motion.div
        className="absolute -right-40 top-[-8rem] h-[26rem] w-[26rem] rounded-full bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 blur-3xl"
        animate={
          reduce
            ? undefined
            : {
                x: [0, -50, 0],
                y: [0, 40, 0],
                rotate: [0, -14, 0],
              }
        }
        transition={
          reduce
            ? undefined
            : { duration: 20, repeat: Infinity, ease: "easeInOut", delay: 0.6 }
        }
      />

      <motion.div
        className="absolute left-[40%] top-[60%] h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-emerald-500/10 to-purple-500/8 blur-3xl"
        animate={
          reduce
            ? undefined
            : {
                scale: [1, 1.06, 1],
                rotate: [0, 10, 0],
              }
        }
        transition={
          reduce
            ? undefined
            : { duration: 22, repeat: Infinity, ease: "easeInOut", delay: 1.2 }
        }
      />
    </div>
  )
}

