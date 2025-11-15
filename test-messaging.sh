#!/bin/bash

# Quick test script for messaging system
echo "🧪 Testing messaging system..."

# Check if the dev server is running
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Dev server is running on http://localhost:5173"
else
    echo "❌ Dev server not running. Please run 'npm run dev' first."
    exit 1
fi

echo ""
echo "📋 To test the messaging system:"
echo "1. Open http://localhost:5173 in your browser"
echo "2. Navigate to the 'Mapa' page"  
echo "3. Open browser console (F12)"
echo "4. Copy and paste the content of debug-map-messaging.js"
echo "5. Look for specific error messages"
echo ""
echo "🔍 Common issues to check:"
echo "- RLS policies blocking operations"
echo "- Missing database functions"
echo "- Invalid user IDs"
echo "- Network connectivity issues"
echo ""
echo "📁 Debug files created:"
echo "- debug-map-messaging.js (for Map page errors)"
echo "- test-messaging-console.js (general messaging test)"
echo "- MESSAGING_TROUBLESHOOTING.md (complete guide)"