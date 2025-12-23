# 1) Build stage
FROM public.ecr.aws/docker/library/node:20-alpine AS build
WORKDIR /app/list

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 2) Run stage
FROM public.ecr.aws/nginx/nginx:1.27-alpine
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
