FROM node:18-bullseye as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
# injeta a URL da API na build do Vite
ARG API_BASE
ENV VITE_API_BASE_URL=${API_BASE}
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 