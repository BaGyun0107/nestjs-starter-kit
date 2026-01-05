const commonSettings = {
  instances: 2,
  exec_mode: 'cluster',
  watch: false,
  log_date_format: 'YYYY-MM-DD HH:mm:ss',
  max_memory_restart: '1G',
  // 재시작 관련
  max_restarts: 5,
  restart_delay: 10000,
  min_uptime: 5000,
  autorestart: true,

  // Ready 신호 관련
  wait_ready: true,
  listen_timeout: 10000,

  // 종료 관련
  kill_timeout: 8000,

  // 클러스터 모드 옵션
  instance_var: 'INSTANCE_ID',
  merge_logs: true,
  node_args: ['--enable-source-maps'],

  // 로그 타임스탬프
  time: true,

  // 로그 설정 (Winston으로 대체하여 PM2 로그 비활성화)
  log_file: '/dev/null',
  error_file: '/dev/null',
  out_file: '/dev/null'
};

module.exports = {
  apps: [
    // 개발 환경 설정
    {
      ...commonSettings,
      name: 'nestjs-starter-kit-dev',
      script: 'dist/main.js', // NestJS는 빌드 후 dist/main.js를 실행
      env: {
        NODE_ENV: 'development'
      }
    }
  ]
};
