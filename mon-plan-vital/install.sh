#!/bin/bash

# Script d'installation automatique pour le projet mon-plan-vital

# Mise à jour des paquets
echo "Mise à jour des paquets..."
sudo apt-get update

# Installation de Node.js et npm
echo "Installation de Node.js et npm..."
sudo apt-get install -y nodejs npm

# Installation des dépendances du projet
echo "Installation des dépendances du projet..."
npm install

# Vérification de l'installation
echo "Vérification de l'installation..."
if command -v node &> /dev/null && command -v npm &> /dev/null
then
    echo "Node.js et npm sont installés avec succès."
else
    echo "Erreur lors de l'installation de Node.js ou npm."
fi

echo "Installation terminée."