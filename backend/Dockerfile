FROM node

COPY . /backend
WORKDIR /backend

RUN npm install

EXPOSE 4000
ENTRYPOINT ["npm", "run", "start"]
