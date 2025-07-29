const commonSettings = {
  instances: 2,
  exec_mode: 'cluster',
  watch: false,
  max_memory_restart: '1G'
};

module.exports = {
  apps: [
    // 개발 환경 설정
    {
      ...commonSettings,
      name: 'codi_account_nest_dev',
      script: 'dist/main.js', // NestJS는 빌드 후 dist/main.js를 실행
      env: {
        NODE_ENV: 'development'
      },
      max_restarts: 5,
      restart_delay: 10000
    },
    // 프로덕션 환경 설정
    {
      ...commonSettings,
      name: 'codi_account_nest_prd',
      script: 'dist/main.js', // NestJS는 빌드 후 dist/main.js를 실행
      instances: 5,
      env: {
        NODE_ENV: 'production'
      },
      max_restarts: 5, // 최대 재시작 횟수
      restart_delay: 10000 // 재시작 시도 간 대기 시간 (밀리초)
    }
  ]
};
