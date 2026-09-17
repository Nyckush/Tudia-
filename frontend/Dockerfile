FROM node:24-alpine
WORKDIR /app
COPY package.json package-lock.json ./
# npm ci es estricto con dependencias opcionales resueltas en otra plataforma
# (por ejemplo, Windows frente a Linux/Alpine). Docker siempre instala aquí
# su árbol compatible con Linux, conservando el package-lock como referencia.
RUN npm install --include=optional --no-audit --no-fund
COPY . .
ARG BACKEND_URL=http://backend:8080
ENV BACKEND_URL=$BACKEND_URL
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
