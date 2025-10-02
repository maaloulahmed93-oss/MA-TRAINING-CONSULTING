#!/bin/bash

# MATC - Système Commercial Complet
# Script d'arrêt pour Linux/Mac

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "========================================"
echo "   MATC - Arrêt du Système Commercial"
echo "========================================"
echo -e "${NC}"

# Fonction pour arrêter un service
stop_service() {
    local name=$1
    local pid_file="/tmp/matc-$name.pid"
    local log_file="/tmp/matc-$name.log"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            echo -e "${YELLOW}Arrêt de $name (PID: $pid)...${NC}"
            kill $pid
            sleep 2
            
            # Vérifier si le processus est toujours en cours
            if ps -p $pid > /dev/null 2>&1; then
                echo -e "${RED}Forçage de l'arrêt de $name...${NC}"
                kill -9 $pid
            fi
            
            echo -e "${GREEN}✓ $name arrêté${NC}"
        else
            echo -e "${YELLOW}$name n'était pas en cours d'exécution${NC}"
        fi
        
        # Nettoyer les fichiers temporaires
        rm -f "$pid_file"
        rm -f "$log_file"
    else
        echo -e "${YELLOW}Aucun fichier PID trouvé pour $name${NC}"
    fi
}

# Arrêter tous les services
echo "Arrêt de tous les services..."
echo

stop_service "Backend"
stop_service "Frontend"
stop_service "Admin-Panel"

# Nettoyer les processus Node.js sur les ports spécifiques
echo
echo -e "${YELLOW}Nettoyage des ports...${NC}"

# Fonction pour tuer les processus sur un port spécifique
kill_port() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null)
    
    if [ ! -z "$pids" ]; then
        echo "Arrêt des processus sur le port $port..."
        echo $pids | xargs kill -9 2>/dev/null
        echo -e "${GREEN}✓ Port $port libéré${NC}"
    fi
}

# Libérer les ports utilisés
kill_port 3001  # Backend
kill_port 5173  # Frontend
kill_port 8536  # Admin Panel

echo
echo -e "${GREEN}========================================"
echo "     Tous les services sont arrêtés!"
echo "========================================${NC}"
echo
echo -e "${BLUE}Les ports suivants ont été libérés:${NC}"
echo "  - 3001 (Backend API)"
echo "  - 5173 (Frontend)"
echo "  - 8536 (Admin Panel)"
echo
echo -e "${GREEN}✅ Système Commercial MATC arrêté avec succès!${NC}"
echo
