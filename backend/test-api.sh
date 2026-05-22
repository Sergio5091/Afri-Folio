#!/bin/bash
# Script de test rapide des endpoints AfriFolio
# Usage: bash test-api.sh
# Requiert: curl

BASE="http://localhost:3001"

echo "======================================"
echo "  AfriFolio API - Tests rapides"
echo "======================================"

# 1. Health check
echo ""
echo "1. Health check..."
curl -s "$BASE/" | python -m json.tool 2>/dev/null || curl -s "$BASE/"

# 2. Register
echo ""
echo "2. Inscription..."
REGISTER=$(curl -s -X POST "$BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@test.com","password":"password123"}')
echo $REGISTER | python -m json.tool 2>/dev/null || echo $REGISTER

# Extraire le token
TOKEN=$(echo $REGISTER | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "Token: $TOKEN"

# 3. Login
echo ""
echo "3. Connexion..."
LOGIN=$(curl -s -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}')
echo $LOGIN | python -m json.tool 2>/dev/null || echo $LOGIN

TOKEN=$(echo $LOGIN | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# 4. Get Profile
echo ""
echo "4. Récupérer le profil..."
curl -s "$BASE/api/profile" \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool 2>/dev/null

# 5. Update Profile
echo ""
echo "5. Mettre à jour le profil..."
curl -s -X PUT "$BASE/api/profile" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "title": "Développeur Web",
    "bio": "Passionné par le développement web moderne.",
    "services": "Création de sites web et applications.",
    "emailContact": "test@test.com",
    "skills": ["React", "Node.js"],
    "styleTheme": "modern",
    "availableForWork": true
  }' | python -m json.tool 2>/dev/null

# 6. Dashboard summary
echo ""
echo "6. Dashboard summary..."
curl -s "$BASE/api/dashboard/summary" \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool 2>/dev/null

# 7. Analytics
echo ""
echo "7. Analytics..."
curl -s "$BASE/api/analytics" \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool 2>/dev/null

# 8. Referral stats
echo ""
echo "8. Stats parrainage..."
curl -s "$BASE/api/referral/stats" \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool 2>/dev/null

# 9. Public portfolio
echo ""
echo "9. Portfolio public..."
curl -s "$BASE/api/portfolio/testuser" | python -m json.tool 2>/dev/null

echo ""
echo "======================================"
echo "  Tests terminés"
echo "======================================"
