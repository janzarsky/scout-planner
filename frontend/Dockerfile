FROM node

COPY . /frontend

WORKDIR /frontend

RUN npm install

EXPOSE 3000
ENTRYPOINT ["npm", "run", "start"]
