module.exports = {
  apps: [
    {
      name: 'app',
      script: 'npm',
      args: 'run start',
      cwd: '/home/ubuntu/kkopi-store/deployment/current',
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
