#!/bin/sh

env CURRENT_ENV=development docker-compose up -d
docker cp src/script mydice_web:/usr/local/bin/
