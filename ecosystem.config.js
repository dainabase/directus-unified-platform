module.exports = {
  apps: [
    {
      name: 'directus-backend',
      script: 'docker-compose',
      args: 'up',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'frontend-react',
      cwd: './src/frontend',
      script: 'npm',
      args: 'run dev',
      interpreter: 'none',
      env: {
        NODE_ENV: 'development'
      },
      watch: false,
      autorestart: true,
      max_restarts: 10,
      min_uptime: 10000
    },
    {
      name: 'api-proxy',
      script: './server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 8080
      }
    }
  ]
}