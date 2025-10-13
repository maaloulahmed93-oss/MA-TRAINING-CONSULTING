#!/bin/bash

# MATC Full-Stack Deployment Script for Unix/Linux/macOS
# Quick deployment command for MATC project

echo ""
echo "========================================"
echo "🚀 MATC Full-Stack Deployment"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js detected: $(node --version)"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found"
    echo "Please run this script from the MATC project root directory"
    exit 1
fi

echo "✅ Project directory confirmed"
echo ""

# Make the deployment script executable
chmod +x deploy-matc.js

# Run the deployment script
echo "🚀 Starting MATC deployment..."
echo ""

node deploy-matc.js

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo "✅ DEPLOYMENT COMPLETED SUCCESSFULLY!"
    echo "========================================"
    echo ""
    echo "🔗 Backend API: https://matc-backend.onrender.com/api"
    echo "🔗 Frontend: https://matrainingconsulting.vercel.app"
    echo "🔗 Admin Panel: https://admine-lake.vercel.app"
    echo ""
    echo "Check matc_auto_deploy_report.json for detailed results"
else
    echo ""
    echo "========================================"
    echo "❌ DEPLOYMENT FAILED"
    echo "========================================"
    echo ""
    echo "Please check the error messages above"
    echo "and ensure all environment variables are set"
    exit 1
fi

echo ""
