FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Vite incrusta las variables VITE_* en el bundle en build time (no en runtime) — Railway las
# inyecta como build args para servicios Dockerfile, así que hay que declararlas explícitamente
# aquí para que lleguen al `npm run build` de abajo.
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
