#!/bin/bash

echo "🚀 Starting HomeHost Platform for Testing"
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Create directories if they don't exist
mkdir -p logs

# Function to start backend
start_backend() {
    echo "🔧 Setting up mock backend..."
    
    # Install dependencies if needed
    if [ ! -f "package.json" ]; then
        npm init -y > /dev/null 2>&1
    fi
    
    # Check if dependencies are installed
    if [ ! -d "node_modules" ] || [ ! -f "node_modules/express/package.json" ]; then
        echo "📦 Installing backend dependencies..."
        npm install express cors jsonwebtoken > logs/backend-install.log 2>&1
        if [ $? -eq 0 ]; then
            echo "✅ Backend dependencies installed"
        else
            echo "❌ Failed to install backend dependencies"
            echo "Check logs/backend-install.log for details"
            exit 1
        fi
    fi
    
    echo "🚀 Starting mock backend on port 3001..."
    node mock-server.js > logs/backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > logs/backend.pid
    
    # Wait for backend to start
    sleep 3
    
    # Check if backend is running
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        echo "✅ Backend is running (PID: $BACKEND_PID)"
    else
        echo "❌ Backend failed to start"
        exit 1
    fi
}

# Function to start frontend
start_frontend() {
    echo "🔧 Setting up frontend..."
    
    cd "apps/web-dashboard"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ] || [ ! -f "node_modules/next/package.json" ]; then
        echo "📦 Installing frontend dependencies (this may take a few minutes)..."
        npm install > ../../logs/frontend-install.log 2>&1
        if [ $? -eq 0 ]; then
            echo "✅ Frontend dependencies installed"
        else
            echo "❌ Failed to install frontend dependencies"
            echo "Check logs/frontend-install.log for details"
            exit 1
        fi
    fi
    
    echo "🚀 Starting frontend on port 3000..."
    npm run dev > ../../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../../logs/frontend.pid
    
    cd "../.."
    
    echo "✅ Frontend is starting (PID: $FRONTEND_PID)"
    echo "   This may take 30-60 seconds to compile..."
}

# Function to check status
check_status() {
    echo ""
    echo "📊 Checking server status..."
    
    # Check backend
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        echo "✅ Backend: http://localhost:3001 (Ready)"
    else
        echo "❌ Backend: Not responding"
    fi
    
    # Check frontend (may take time to start)
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ Frontend: http://localhost:3000 (Ready)"
    else
        echo "⏳ Frontend: Starting... (may take up to 60 seconds)"
    fi
}

# Function to show instructions
show_instructions() {
    echo ""
    echo "🎯 Testing Instructions:"
    echo "======================="
    echo "1. Open your browser to: http://localhost:3000"
    echo "2. Login with:"
    echo "   📧 Email: test@example.com"
    echo "   🔑 Password: password"
    echo "3. Test the features:"
    echo "   • Dashboard with real server stats"
    echo "   • Server management (start/stop)"
    echo "   • Community browser"
    echo "   • Authentication flow"
    echo ""
    echo "🔧 Useful Commands:"
    echo "• Test integration: node test-integration.js"
    echo "• View backend logs: tail -f logs/backend.log"
    echo "• View frontend logs: tail -f logs/frontend.log"
    echo "• Stop servers: ./stop-testing.sh"
    echo ""
    echo "📚 Full documentation: TESTING_GUIDE.md"
}

# Function to create stop script
create_stop_script() {
    cat > stop-testing.sh << 'EOF'
#!/bin/bash

echo "🛑 Stopping HomeHost Platform..."

# Stop backend
if [ -f "logs/backend.pid" ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        kill $BACKEND_PID
        echo "✅ Backend stopped (PID: $BACKEND_PID)"
    fi
    rm -f logs/backend.pid
fi

# Stop frontend
if [ -f "logs/frontend.pid" ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        kill $FRONTEND_PID
        echo "✅ Frontend stopped (PID: $FRONTEND_PID)"
    fi
    rm -f logs/frontend.pid
fi

# Kill any remaining processes on our ports
pkill -f "node mock-server.js" 2>/dev/null
pkill -f "next dev" 2>/dev/null

echo "🎯 All servers stopped"
EOF

    chmod +x stop-testing.sh
}

# Main execution
main() {
    # Create stop script
    create_stop_script
    
    # Start servers
    start_backend
    start_frontend
    
    # Wait a moment for things to settle
    sleep 5
    
    # Check status
    check_status
    
    # Show instructions
    show_instructions
    
    echo "🎉 HomeHost Platform is starting up!"
    echo "    Backend logs: logs/backend.log"
    echo "    Frontend logs: logs/frontend.log"
    echo ""
    echo "⏳ Please wait 30-60 seconds for the frontend to fully compile..."
    echo "    Then open: http://localhost:3000"
}

# Handle Ctrl+C
trap 'echo ""; echo "🛑 Stopping..."; ./stop-testing.sh; exit 0' INT

# Run main function
main