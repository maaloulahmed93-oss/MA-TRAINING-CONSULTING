#!/bin/bash

# MATC - Système Commercial Complet
# Script de démarrage pour Linux/Mac

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "========================================"
echo "   MATC - Système Commercial Complet"
echo "========================================"
echo -e "${NC}"

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo -e "${RED}ERREUR: Node.js n'est pas installé${NC}"
    echo "Veuillez installer Node.js depuis https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✓ Node.js détecté$(node --version)${NC}"
echo

# Fonction pour démarrer un service en arrière-plan
start_service() {
    local name=$1
    local port=$2
    local dir=$3
    local cmd=$4
    
    echo -e "${YELLOW}Démarrage de $name (Port $port)...${NC}"
    
    if [ "$dir" != "." ]; then
        cd "$dir"
    fi
    
    # Démarrer en arrière-plan
    $cmd > "/tmp/matc-$name.log" 2>&1 &
    local pid=$!
    echo $pid > "/tmp/matc-$name.pid"
    
    echo -e "${GREEN}✓ $name démarré (PID: $pid)${NC}"
    
    if [ "$dir" != "." ]; then
        cd ..
    fi
    
    sleep 2
}

# Démarrer les services
echo "Démarrage de tous les services..."
echo

start_service "Backend" "3001" "backend" "npm run dev"
start_service "Frontend" "5173" "." "npm run dev"
start_service "Admin-Panel" "8536" "admin-panel" "npm run dev"

echo
echo -e "${GREEN}========================================"
echo "           Services Démarrés!"
echo "========================================${NC}"
echo
echo -e "${BLUE}🌐 URLs d'accès:${NC}"
echo
echo "   Frontend Principal:"
echo "   http://localhost:5173"
echo
echo "   Espace Commercial:"
echo "   http://localhost:5173/espace-commercial-new"
echo
echo "   Admin Panel:"
echo "   http://localhost:8536"
echo
echo "   API Backend:"
echo "   http://localhost:3001/api/health"
echo
echo -e "${YELLOW}========================================"
echo "           Informations Système"
echo "========================================${NC}"
echo
echo "🔐 Code Secret Admin: 20388542"
echo "👤 ID Commercial Test: COMM-123456"
echo "📊 Dashboard: 3 onglets (Dashboard, Ventes, Clients)"
echo "🎯 Niveaux: Apprenti → Confirmé → Partenaire"
echo
echo -e "${BLUE}========================================"
echo "              Tests Disponibles"
echo "========================================${NC}"
echo
echo "🧪 Test Complet: test-commercial-complete-system.html"
echo "🚀 Test Avancé: test-commercial-advanced.html"
echo "📋 Documentation: COMMERCIAL-SYSTEM-README.md"
echo

# Fonction pour ouvrir les URLs (si possible)
open_url() {
    if command -v xdg-open &> /dev/null; then
        xdg-open "$1" &> /dev/null &
    elif command -v open &> /dev/null; then
        open "$1" &> /dev/null &
    else
        echo "Ouvrez manuellement: $1"
    fi
}

echo "Ouverture des tests et interfaces..."
sleep 3

# Ouvrir les fichiers de test et interfaces
if [ -f "test-commercial-complete-system.html" ]; then
    open_url "$(pwd)/test-commercial-complete-system.html"
fi

sleep 2
open_url "http://localhost:5173/espace-commercial-new"
sleep 2
open_url "http://localhost:8536/commercial-services"

echo
echo -e "${GREEN}✅ Système Commercial MATC démarré avec succès!${NC}"
echo
echo -e "${YELLOW}Pour arrêter les services, utilisez:${NC}"
echo "  ./stop-commercial-system.sh"
echo
echo -e "${YELLOW}Logs des services:${NC}"
echo "  Backend: tail -f /tmp/matc-Backend.log"
echo "  Frontend: tail -f /tmp/matc-Frontend.log"
echo "  Admin Panel: tail -f /tmp/matc-Admin-Panel.log"
echo

# Attendre l'entrée utilisateur
read -p "Appuyez sur Entrée pour continuer..."
