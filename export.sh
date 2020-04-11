#!/bin/bash

zip -r xzarsk03.zip backend frontend README.md docker-compose.yml \
    -x "backend/node_modules/*" \
    -x backend/.gitignore \
    -x "frontend/node_modules/*" \
    -x "frontend/build/*" \
    -x frontend/.gitignore
