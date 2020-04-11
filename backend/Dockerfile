FROM node

COPY . /backend
WORKDIR /backend

RUN mv config.docker.json config.json

RUN npm install

EXPOSE 4000
ENTRYPOINT ["npm", "run", "start"]
