# Используйте официальный Node.js образ как базовый
FROM node:18

# Установите рабочую директорию
WORKDIR /app

# Скопируйте package.json и package-lock.json для установки зависимостей
COPY package*.json ./

# Установите зависимости проекта
RUN npm ci

# Скопируйте остальные файлы проекта
COPY . .

# Установите Prisma CLI
RUN npm install @prisma/client

# Установите глобальные зависимости
RUN npm install -g nodemon @nestjs/cli

# Генерация Prisma Client
RUN npx prisma generate

# Запустите приложение
CMD ["sh", "-c", "npx prisma migrate deploy && npm run seed && npm run start:dev"]