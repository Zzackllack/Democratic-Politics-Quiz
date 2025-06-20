#!/bin/bash

# Simple startup script for development environment
set -e  # Exit on any error

echo "Starting development environment setup..."

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
    
    # Check project structure
    if [ -f "applications/frontend/package.json" ]; then
        echo "Frontend package.json found"
    else
        echo "ERROR: Frontend package.json not found"
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
    echo "Setting up Development Environment..."
    
    # Navigate to frontend directory
    echo "cd applications/frontend"
    cd applications/frontend
    
    # Install dependencies
    echo "Installing frontend dependencies..."
    echo "npm install"
    
    if npm install; then
        echo "✅ Dependencies installed successfully!"
    else
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    
    echo ""
}

# Function to display available commands
show_available_commands() {
    echo "📋 Available Development Commands:"
    
    echo "Frontend Development:"
    echo "  npm run dev          - Start development server (http://localhost:4321)"
    echo "  npm run build        - Build for production"
    echo "  npm run preview      - Preview production build"
    echo "  npm run astro        - Run Astro CLI commands"
    echo ""
    
    echo "Project Structure:"
    echo "  src/components/      - React components (Hero, Quiz, Lobby, etc.)"
    echo "  src/pages/          - Astro pages (routing)"
    echo "  src/layouts/        - Layout components"
    echo "  src/data/           - Mock data and type definitions"
    echo "  src/styles/         - Global CSS styles"
    echo ""
}

# Function to start development server
start_dev_server() {
    echo "Starting Development Server..."
    
    cd applications/frontend
    
    echo "Launching Astro development server..."
    echo "npm run dev"
    
    echo ""
    echo "Development server will be available at: http://localhost:4321"
    echo ""
    
    # Start the server
    npm run dev
}

# Main execution flow
main() {
    # Parse command line arguments
    case "${1:-setup}" in
        "setup"|"")
            check_prerequisites
            setup_environment
            show_available_commands
            echo "Setup complete! Run 'npm run dev' in the frontend directory to start coding."
            ;;
        "dev"|"start")
            start_dev_server
            ;;
        "check"|"prerequisites")
            check_prerequisites
            ;;
        "help"|"-h"|"--help")
            echo "Usage: $0 [command]"
            echo ""
            echo "Commands:"
            echo "  setup (default)  - Full environment setup"
            echo "  dev, start       - Start development server"
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