# Cache

## Setup

run `setup.sh`

```bash
./setup.sh
```

start redis

```bash
docker-compose up -d
```

check

```bash
docker ps | grep redis
2e0812dd38a8        redis:6.2.6         "docker-entrypoint.s…"   6 hours ago         Up 6 hours          0.0.0.0:6379->6379/tcp   redis
```