/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * На macOS при лимите дескрипторов (EMFILE) Watchpack падает — чанки /_next/*
   * не собираются и в браузере 404 на webpack.js, layout.css. Polling снижает нагрузку на inotify/FSEvents.
   */
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        poll: 1000,
        aggregateTimeout: 500,
        ignored: ["**/node_modules/**", "**/.git/**"],
      };
    }
    return config;
  },
};

module.exports = nextConfig;

