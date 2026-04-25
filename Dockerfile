# Imagem base com Debian mais recente para compatibilidade com sqlite3
FROM node:18-bullseye

# Diretório dentro do container
WORKDIR /app

# Copia dependências
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia o resto do projeto
COPY . .

# Porta da API
EXPOSE 3000

# Comando para rodar
CMD ["npm", "start"]