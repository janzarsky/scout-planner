#!/bin/bash

zip -r xzarsk03.zip backend frontend docker-compose.yml \
    -x "backend/node_modules/*" \
    -x backend/.gitignore \
    -x "frontend/node_modules/*" \
    -x frontend/.gitignore
