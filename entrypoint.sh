#!/bin/bash

# Démarrer clamd en arrière-plan
service clamav-daemon start

# Démarrer cron
service cron start

# Démarrer l'application Node.js
npm start
