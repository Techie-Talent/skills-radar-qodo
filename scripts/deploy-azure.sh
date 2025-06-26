#!/bin/bash

# Azure Deployment Script for Skills Radar
# This script helps set up the Azure infrastructure and deploy the application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
RESOURCE_GROUP="skills-radar-rg"
LOCATION="eastus"
APP_NAME="skills-radar-app"
DB_SERVER_NAME="skills-radar-db-server"
DB_ADMIN_USER="dbadmin"

echo -e "${GREEN}🚀 Skills Radar Azure Deployment Script${NC}"
echo "========================================"

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI is not installed. Please install it first.${NC}"
    echo "Visit: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if user is logged in
if ! az account show &> /dev/null; then
    echo -e "${YELLOW}⚠️  You are not logged in to Azure. Please log in first.${NC}"
    az login
fi

# Get subscription info
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
echo -e "${GREEN}✅ Using subscription: ${SUBSCRIPTION_ID}${NC}"

# Create resource group
echo -e "${YELLOW}📦 Creating resource group...${NC}"
az group create --name $RESOURCE_GROUP --location $LOCATION

# Generate secure password for database
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
echo -e "${GREEN}✅ Generated secure database password${NC}"

# Deploy ARM template
echo -e "${YELLOW}🏗️  Deploying Azure resources...${NC}"
DEPLOYMENT_OUTPUT=$(az deployment group create \
  --resource-group $RESOURCE_GROUP \
  --template-file azure-resources.json \
  --parameters appName=$APP_NAME \
               dbServerName=$DB_SERVER_NAME \
               dbAdminLogin=$DB_ADMIN_USER \
               dbAdminPassword=$DB_PASSWORD \
  --query 'properties.outputs' -o json)

# Extract outputs
WEB_APP_URL=$(echo $DEPLOYMENT_OUTPUT | jq -r '.webAppUrl.value')
DATABASE_URL=$(echo $DEPLOYMENT_OUTPUT | jq -r '.databaseConnectionString.value')

echo -e "${GREEN}✅ Azure resources deployed successfully!${NC}"
echo -e "${GREEN}   Web App URL: ${WEB_APP_URL}${NC}"

# Generate NextAuth secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Set up GitHub repository secrets (requires GitHub CLI)
if command -v gh &> /dev/null; then
    echo -e "${YELLOW}🔐 Setting up GitHub secrets...${NC}"
    
    # Get publish profile
    PUBLISH_PROFILE=$(az webapp deployment list-publishing-profiles \
      --name $APP_NAME \
      --resource-group $RESOURCE_GROUP \
      --xml)
    
    # Set GitHub secrets
    echo "$PUBLISH_PROFILE" | gh secret set AZURE_WEBAPP_PUBLISH_PROFILE
    echo "$DATABASE_URL" | gh secret set DATABASE_URL
    echo "$NEXTAUTH_SECRET" | gh secret set NEXTAUTH_SECRET
    echo "$WEB_APP_URL" | gh secret set NEXTAUTH_URL
    
    echo -e "${GREEN}✅ GitHub secrets configured${NC}"
    echo -e "${YELLOW}⚠️  Don't forget to set up Google OAuth secrets:${NC}"
    echo "   - GOOGLE_CLIENT_ID"
    echo "   - GOOGLE_CLIENT_SECRET"
else
    echo -e "${YELLOW}⚠️  GitHub CLI not found. Please set up these secrets manually:${NC}"
    echo "   AZURE_WEBAPP_PUBLISH_PROFILE: (Download from Azure Portal)"
    echo "   DATABASE_URL: $DATABASE_URL"
    echo "   NEXTAUTH_SECRET: $NEXTAUTH_SECRET"
    echo "   NEXTAUTH_URL: $WEB_APP_URL"
    echo "   GOOGLE_CLIENT_ID: (Your Google OAuth client ID)"
    echo "   GOOGLE_CLIENT_SECRET: (Your Google OAuth client secret)"
fi

# Configure App Service settings
echo -e "${YELLOW}⚙️  Configuring App Service settings...${NC}"
az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --settings \
    DATABASE_URL="$DATABASE_URL" \
    NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
    NEXTAUTH_URL="$WEB_APP_URL"

echo -e "${GREEN}✅ App Service configured${NC}"

# Run database migrations (if needed)
echo -e "${YELLOW}🗄️  Setting up database...${NC}"
echo "You may need to run Prisma migrations manually:"
echo "1. Set DATABASE_URL in your local environment"
echo "2. Run: npx prisma migrate deploy"
echo "3. Run: npx prisma db seed (if you have seed data)"

echo ""
echo -e "${GREEN}🎉 Deployment setup complete!${NC}"
echo "========================================"
echo -e "${GREEN}Web App URL: ${WEB_APP_URL}${NC}"
echo -e "${GREEN}Database Server: ${DB_SERVER_NAME}.postgres.database.azure.com${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Set up Google OAuth credentials in Google Cloud Console"
echo "2. Add Google OAuth secrets to GitHub repository"
echo "3. Push your code to trigger the deployment"
echo "4. Run database migrations if needed"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "View logs: az webapp log tail --name $APP_NAME --resource-group $RESOURCE_GROUP"
echo "Restart app: az webapp restart --name $APP_NAME --resource-group $RESOURCE_GROUP"
echo "Scale app: az webapp up --name $APP_NAME --resource-group $RESOURCE_GROUP --sku B2"