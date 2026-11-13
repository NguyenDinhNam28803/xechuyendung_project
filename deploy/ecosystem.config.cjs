/**
 * PM2: chạy API và web, tự khởi động lại khi lỗi và khi VPS reboot.
 *   pm2 start /var/www/xechuyendung/client/deploy/ecosystem.config.cjs
 *   pm2 save && pm2 startup
 * Biến môi trường bí mật KHÔNG đặt ở đây: API đọc server/.env, web đọc client/.env.production.
 */
module.exports = {
  apps: [
    {
      name: "xe-api",
      cwd: "/var/www/xechuyendung/server",
      script: "dist/main.js",
      node_args: "--enable-source-maps",
      env: { NODE_ENV: "production", HOST: "127.0.0.1" },
      max_memory_restart: "400M",
      time: true,
    },
    {
      name: "xe-web",
      cwd: "/var/www/xechuyendung/client",
      script: "node_modules/next/dist/bin/next",
      // Chỉ nghe trên 127.0.0.1: khách đi qua Nginx, không vào thẳng cổng 3000.
      args: "start --hostname 127.0.0.1 --port 3000",
      env: { NODE_ENV: "production", NEXT_TELEMETRY_DISABLED: "1" },
      max_memory_restart: "700M",
      time: true,
    },
  ],
};
