module.exports = {
  apps: [
    {
      name: 'app',
      script: 'npm',
      args: 'run start',
      cwd: '/home/ubuntu/kkopi-store/deployment/current',
      // env_file: "/home/ubuntu/kkopi-store/deployment/config/.env", // ✅ load env
      watch: false,
    },
  ],
};
