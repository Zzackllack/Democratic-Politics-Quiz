#!/bin/bash

# Simple startup script for Next.js + Backend development environment
set -e  # Exit on any error

echo "Starting Democratic Politics Quiz development environment setup..."

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Node.js version
check_node_version() {
    if command_exists node; then
        local node_version=$(node --version | sed 's/v//')
        local major_version=$(echo $node_version | cut -d. -f1)
        if [ "$major_version" -ge 18 ]; then
            echo "Node.js version $node_version is compatible"
            return 0
        else
            echo "ERROR: Node.js version $node_version is too old. Please upgrade to Node.js 18+"
            return 1
        fi
    else
        echo "ERROR: Node.js is not installed"
        return 1
    fi
}

# Function to check prerequisites
check_prerequisites() {
    echo "Checking prerequisites..."
    
    local all_good=true
    
    # Check Node.js
    if ! check_node_version; then
        all_good=false
    fi
    
    # Check npm
    if command_exists npm; then
        local npm_version=$(npm --version)
        echo "npm version $npm_version is available"
    else
        echo "ERROR: npm is not installed"
        all_good=false
    fi
    
    # Check git
    if command_exists git; then
        echo "Git is available"
    else
        echo "WARNING: Git is not installed (optional but recommended)"
    fi
    
    # Check frontend project structure
    if [ -f "applications/frontend/package.json" ]; then
        echo "Next.js frontend package.json found"
    else
        echo "ERROR: Frontend package.json not found"
        all_good=false
    fi
    # Check backend project structure
    if [ -f "applications/backend/package.json" ]; then
        echo "Backend package.json found"
    else
        echo "ERROR: Backend package.json not found"
        all_good=false
    fi
    
    echo ""
    
    if [ "$all_good" = true ]; then
        echo "✅ All prerequisites met!"
    else
        echo "❌ Some prerequisites are missing. Please resolve them before continuing."
        exit 1
    fi
}

# Function to setup the development environment
setup_environment() {
    echo "Setting up development environment..."
    echo "npm install"
    if npm install; then
        echo "✅ Global dependencies installed successfully!"
    else
        echo "❌ Failed to install global dependencies"
        exit 1
    fi
    echo "Setting up Next.js Frontend..."
    # Navigate to frontend directory
    echo "cd applications/frontend"
    cd applications/frontend
    # Install dependencies
    echo "Installing frontend dependencies..."
    echo "npm install"
    if npm install; then
        echo "✅ Frontend dependencies installed successfully!"
    else
        echo "❌ Failed to install frontend dependencies"
        exit 1
    fi
    cd ../..
    echo ""
    echo "Setting up Backend..."
    echo "cd applications/backend"
    cd applications/backend
    echo "Installing backend dependencies..."
    echo "npm install"
    if npm install; then
        echo "✅ Backend dependencies installed successfully!"
    else
        echo "❌ Failed to install backend dependencies"
        exit 1
    fi
    cd ../..
    echo ""
}

# Function to display available commands
show_available_commands() {
    echo "📋 Available Development Commands:"
    echo ""
    echo "Frontend Development (Next.js):"
    echo "  cd applications/frontend"
    echo "  npm run dev          - Start Next.js development server (http://localhost:3000)"
    echo "  npm run build        - Build for production"
    echo "  npm run start        - Start production server"
    echo "  npm run lint         - Run ESLint checks"
    echo "  npm run format       - Run Prettier formatting (if configured)"
    echo ""
    echo "Backend Development (Express/Prisma):"
    echo "  cd applications/backend"
    echo "  npm run start        - Start backend server (http://localhost:3001)"
    echo ""
    echo "Project Structure:"
    echo "  applications/frontend/src/components/   - React components (Hero, Quiz, etc.)"
    echo "  applications/frontend/src/pages/        - Next.js pages (routing)"
    echo "  applications/frontend/src/styles/       - Global and module CSS/SCSS files"
    echo "  applications/frontend/src/data/         - Mock data and type definitions"
    echo "  applications/frontend/public/           - Static assets (images, favicon, etc.)"
    echo "  applications/backend/                   - Backend API (Express, Prisma, etc.)"
    echo ""
}

# Function to start frontend development server
start_frontend() {
    echo "Starting Next.js Development Server..."
    cd applications/frontend
    echo "Launching Next.js development server..."
    echo "npm run dev"
    echo ""
    echo "Frontend server will be available at: http://localhost:3000"
    echo ""
    npm run dev
}

# Function to start backend development server
start_backend() {
    echo "Starting Backend Server..."
    cd applications/backend
    echo "Launching backend server..."
    echo "npm run start"
    echo ""
    echo "Backend server will be available at: http://localhost:3001"
    echo ""
    npm run start
}

# Main execution flow
main() {
    # Parse command line arguments
    case "${1:-setup}" in
        "setup"|"")
            check_prerequisites
            setup_environment
            show_available_commands
            echo "Setup complete! Run 'npm run dev' in the frontend or 'npm run start' in the backend directory to start coding."
            ;;
        "frontend")
            start_frontend
            ;;
        "backend")
            start_backend
            ;;
        "dev"|"start")
            start_frontend
            ;;
        "check"|"prerequisites")
            check_prerequisites
            ;;
        "help"|"-h"|"--help")
            echo "Usage: $0 [command]"
            echo ""
            echo "Commands:"
            echo "  setup (default)  - Full environment setup (frontend & backend)"
            echo "  frontend         - Start frontend development server"
            echo "  backend          - Start backend server"
            echo "  dev, start       - Start frontend development server"
            echo "  check            - Check prerequisites only"
            echo "  help             - Show this help message"
            ;;
        *)
            echo "Unknown command: $1"
            echo "Run '$0 help' for available commands."
            exit 1
            ;;
    esac
}

# Run the main function with all arguments
main "$@"