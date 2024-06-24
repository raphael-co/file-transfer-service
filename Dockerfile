# Utiliser la dernière version de Node.js comme image de base
FROM node:18

# Installer ClamAV, Docker CLI, et cron
RUN apt-get update && apt-get install -y \
    clamav \
    clamav-daemon \
    cron \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    software-properties-common

# Ajouter la clé GPG officielle de Docker
RUN mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg && \
    chmod a+r /etc/apt/keyrings/docker.gpg

# Ajouter le dépôt de Docker à la liste des sources APT
RUN echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
    $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Installer Docker CLI et plugins nécessaires
RUN apt-get update && apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Mettre à jour la base de données des virus
RUN freshclam

# Créer et utiliser le répertoire de travail /app
WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers de l'application
COPY . .

# Compiler le projet TypeScript
RUN npm run build

# Créer les répertoires des uploads, quarantaine et log
RUN mkdir -p uploads quarantine /var/log/node-clam /var/log/cron
RUN touch /var/log/node-clam/scan.log /var/log/cron.log
RUN chown clamav:clamav /var/log/node-clam/scan.log
RUN chown root:root /var/log/cron.log

# Configurer ClamAV pour démarrer
RUN sed -i -e "s/^Example/#Example/" /etc/clamav/clamd.conf
RUN sed -i -e "s/^Example/#Example/" /etc/clamav/freshclam.conf

# Copier le script d'entrée
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Ajouter le cron job au fichier crontab
COPY cleanupVolumes.cron /etc/cron.d/cleanupVolumes
RUN chmod 0644 /etc/cron.d/cleanupVolumes
RUN crontab /etc/cron.d/cleanupVolumes

# Exposer le port de l'application
EXPOSE 3000

# Utiliser le script d'entrée pour démarrer le conteneur
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
