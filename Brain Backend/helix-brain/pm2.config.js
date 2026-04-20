/**
 * PM2 Configuration for HELIX-BRAIN
 * Production process manager settings
 */

module.exports = {
  apps: [
    {
      name: 'helix-brain',
      script: './dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3001,
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/helix-brain-error.log',
      out_file: './logs/helix-brain-out.log',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
      kill_timeout: 5000,
      listen_timeout: 10000,
      // Graceful shutdown
      wait_ready: true,
      // Health monitoring
      pmx: true,
      automation: false,
      // Auto-restart on failure
      exp_backoff_restart_delay: 100,
    },
  ],
};
