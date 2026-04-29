// PM2 config for the NT CSR Training Portal backend.
// Run from /opt/nt-csr-training: `pm2 start deploy/ecosystem.config.js`
// Frontend is served as static files by nginx; only the backend runs under PM2.

module.exports = {
  apps: [
    {
      name: 'nt-csr-training-backend',
      script: 'backend/server.js',
      cwd: '/opt/nt-csr-training',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3100,
      },
      out_file: '/opt/nt-csr-training/logs/backend-out.log',
      error_file: '/opt/nt-csr-training/logs/backend-error.log',
      merge_logs: true,
      time: true,
    },
  ],
};
