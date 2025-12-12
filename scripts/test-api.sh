#!/bin/bash
# CastFash API Test Script
# Usage: ./test-api.sh [base_url]

BASE_URL="${1:-http://localhost:3002}"
TOKEN=""
USER_EMAIL="test@example.com"
USER_PASSWORD="Test123!@#"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================"
echo "  CastFash API Test Suite"
echo "  Base URL: $BASE_URL"
echo "========================================"
echo ""

# Helper function
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local expected_status=$5
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $TOKEN" \
            -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $TOKEN")
    fi
    
    status=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$status" = "$expected_status" ]; then
        echo -e "${GREEN}✓${NC} $name (HTTP $status)"
        return 0
    else
        echo -e "${RED}✗${NC} $name (Expected: $expected_status, Got: $status)"
        echo "  Response: $body"
        return 1
    fi
}

# ===========================================
# Health Check
# ===========================================
echo -e "${YELLOW}[Health Check]${NC}"
test_endpoint "Health Endpoint" "GET" "/health" "" "200"
echo ""

# ===========================================
# Auth Tests
# ===========================================
echo -e "${YELLOW}[Auth Tests]${NC}"

# Signup
test_endpoint "Signup (New User)" "POST" "/auth/signup" \
    "{\"email\":\"$USER_EMAIL\",\"password\":\"$USER_PASSWORD\",\"name\":\"Test User\"}" \
    "201"

# Login
echo -n "Login..."
login_response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$USER_EMAIL\",\"password\":\"$USER_PASSWORD\"}")
login_status=$(echo "$login_response" | tail -n1)
login_body=$(echo "$login_response" | sed '$d')

if [ "$login_status" = "200" ]; then
    TOKEN=$(echo "$login_body" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    if [ -n "$TOKEN" ]; then
        echo -e " ${GREEN}✓${NC} Login Success (Token acquired)"
    else
        echo -e " ${RED}✗${NC} Login Success but no token"
    fi
else
    echo -e " ${RED}✗${NC} Login Failed (HTTP $login_status)"
    echo "  Response: $login_body"
fi

# Forgot Password
test_endpoint "Forgot Password" "POST" "/auth/forgot-password" \
    "{\"email\":\"$USER_EMAIL\"}" \
    "200"

echo ""

# ===========================================
# Protected Endpoints (requires auth)
# ===========================================
if [ -n "$TOKEN" ]; then
    echo -e "${YELLOW}[Protected Endpoints]${NC}"
    
    # Products
    test_endpoint "List Products" "GET" "/products" "" "200"
    
    # Model Profiles
    test_endpoint "List Model Profiles" "GET" "/model-profiles" "" "200"
    
    # Scenes
    test_endpoint "List Scenes" "GET" "/scenes" "" "200"
    
    # Generation Requests
    test_endpoint "List Generation Requests" "GET" "/generation-requests" "" "200"
    
    # Credits
    test_endpoint "Get Credits" "GET" "/credits/balance" "" "200"
    
    # Stats
    test_endpoint "Get Stats" "GET" "/stats" "" "200"
    
    echo ""
fi

# ===========================================
# Admin Endpoints (requires super admin)
# ===========================================
echo -e "${YELLOW}[Admin Endpoints - May require super admin]${NC}"

if [ -n "$TOKEN" ]; then
    # Queue Stats
    test_endpoint "Queue Stats" "GET" "/system-admin/queue/stats" "" "200"
    
    # Provider Health
    test_endpoint "Provider Health" "GET" "/system-admin/providers/health" "" "200"
    
    # Log Files
    test_endpoint "Log Files" "GET" "/system-admin/logs" "" "200"
    
    # Recent Logs
    test_endpoint "Recent Logs" "GET" "/system-admin/logs/live/recent?minutes=5" "" "200"
fi

echo ""

# ===========================================
# Rate Limiting Test
# ===========================================
echo -e "${YELLOW}[Rate Limiting Test]${NC}"
echo "Sending 15 rapid requests to test rate limiting..."
rate_limit_hit=false
for i in {1..15}; do
    status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health")
    if [ "$status" = "429" ]; then
        echo -e "${GREEN}✓${NC} Rate limiting active (hit at request $i)"
        rate_limit_hit=true
        break
    fi
done
if [ "$rate_limit_hit" = false ]; then
    echo -e "${YELLOW}!${NC} Rate limiting not triggered (may need lower limits for testing)"
fi

echo ""
echo "========================================"
echo "  Test Suite Complete"
echo "========================================"
