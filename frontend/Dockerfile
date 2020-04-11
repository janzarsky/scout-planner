FROM node as build-deps

COPY . /frontend

WORKDIR /frontend

RUN npm install

ENV PUBLIC_URL http://localhost:3000
RUN npm run build

FROM nginx
COPY --from=build-deps --chown=nginx:nginx /frontend/build /usr/share/nginx/html

EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
