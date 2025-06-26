# Azure Deployment Guide for Skills Radar

This guide provides multiple deployment options for the Skills Radar Next.js application on Azure.

## Prerequisites

1. **Azure Account**: Active Azure subscription
2. **GitHub Repository**: Code pushed to GitHub
3. **Environment Variables**: Required secrets configured

## Deployment Options

### Option 1: Azure Web App (Recommended)

This is the simplest deployment method for Node.js applications.

#### Setup Steps:

1. **Create Azure Web App**:
   ```bash
   # Using Azure CLI
   az webapp create \
     --resource-group myResourceGroup \
     --plan myAppServicePlan \
     --name skills-radar-app \
     --runtime "NODE:18-lts"
   ```

2. **Configure GitHub Secrets**:
   - `AZURE_WEBAPP_PUBLISH_PROFILE`: Download from Azure Portal → App Service → Get publish profile
   - `DATABASE_URL`: PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Random secret for NextAuth.js
   - `NEXTAUTH_URL`: Your app's URL (e.g., https://skills-radar-app.azurewebsites.net)
   - `GOOGLE_CLIENT_ID`: Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET`: Google OAuth client secret

3. **Deploy**: Push to main/master branch to trigger deployment

#### Configuration:
- The workflow file: `.github/workflows/azure-deploy.yml`
- Automatically builds and deploys on push to main/master
- Runs tests before deployment

### Option 2: Azure Container Instances

For containerized deployment with more control over the environment.

#### Setup Steps:

1. **Create Azure Container Registry**:
   ```bash
   az acr create \
     --resource-group myResourceGroup \
     --name skillsradarregistry \
     --sku Basic \
     --admin-enabled true
   ```

2. **Configure GitHub Secrets**:
   - `AZURE_CREDENTIALS`: Service principal credentials (JSON)
   - `AZURE_REGISTRY_USERNAME`: ACR admin username
   - `AZURE_REGISTRY_PASSWORD`: ACR admin password
   - Plus all environment variables from Option 1

3. **Create Service Principal**:
   ```bash
   az ad sp create-for-rbac \
     --name "skills-radar-sp" \
     --role contributor \
     --scopes /subscriptions/{subscription-id}/resourceGroups/{resource-group} \
     --sdk-auth
   ```

4. **Deploy**: Push to main/master branch

#### Configuration:
- The workflow file: `.github/workflows/azure-container-deploy.yml`
- Uses Docker for consistent deployments
- Automatically scales based on demand

### Option 3: Azure Static Web Apps

For static deployment (requires API routes to be handled separately).

#### Setup Steps:

1. **Create Static Web App**:
   - Go to Azure Portal → Create Resource → Static Web Apps
   - Connect to your GitHub repository
   - Set build details:
     - App location: `/`
     - Output location: `.next`

2. **Configure GitHub Secrets**:
   - `AZURE_STATIC_WEB_APPS_API_TOKEN`: Provided during Static Web App creation
   - Plus all environment variables from Option 1

#### Configuration:
- The workflow file: `.github/workflows/azure-static-web-apps.yml`
- Best for static content with minimal server-side logic
- Includes global CDN and custom domains

## Database Setup

### Azure Database for PostgreSQL

1. **Create Database**:
   ```bash
   az postgres flexible-server create \
     --resource-group myResourceGroup \
     --name skills-radar-db \
     --admin-user dbadmin \
     --admin-password YourSecurePassword123! \
     --sku-name Standard_B1ms \
     --tier Burstable \
     --version 15
   ```

2. **Configure Firewall**:
   ```bash
   # Allow Azure services
   az postgres flexible-server firewall-rule create \
     --resource-group myResourceGroup \
     --name skills-radar-db \
     --rule-name AllowAzureServices \
     --start-ip-address 0.0.0.0 \
     --end-ip-address 0.0.0.0
   ```

3. **Connection String**:
   ```
   postgresql://dbadmin:YourSecurePassword123!@skills-radar-db.postgres.database.azure.com:5432/postgres?sslmode=require
   ```

## Environment Variables

Set these in your Azure App Service Configuration or as GitHub Secrets:

```env
# Database
DATABASE_URL=postgresql://username:password@host:5432/database?sslmode=require

# Authentication
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=https://your-app-name.azurewebsites.net

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Local Testing with Docker

Test your deployment locally:

```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.prod.yml up --build

# Or build and run individually
docker build -t skills-radar .
docker run -p 3000:3000 --env-file .env skills-radar
```

## Monitoring and Logging

### Application Insights

1. **Create Application Insights**:
   ```bash
   az monitor app-insights component create \
     --app skills-radar-insights \
     --location eastus \
     --resource-group myResourceGroup
   ```

2. **Add to App Service**:
   - Go to Azure Portal �� App Service → Application Insights
   - Enable and connect to your Application Insights resource

### Log Streaming

View real-time logs:
```bash
az webapp log tail --name skills-radar-app --resource-group myResourceGroup
```

## Custom Domain and SSL

1. **Add Custom Domain**:
   ```bash
   az webapp config hostname add \
     --webapp-name skills-radar-app \
     --resource-group myResourceGroup \
     --hostname yourdomain.com
   ```

2. **Enable SSL**:
   - Azure provides free SSL certificates for custom domains
   - Go to Azure Portal → App Service → TLS/SSL settings

## Scaling

### Auto-scaling Rules

```bash
# Create auto-scale profile
az monitor autoscale create \
  --resource-group myResourceGroup \
  --resource skills-radar-app \
  --resource-type Microsoft.Web/serverfarms \
  --name skills-radar-autoscale \
  --min-count 1 \
  --max-count 5 \
  --count 2
```

## Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json
   - Ensure Prisma client is generated

2. **Database Connection**:
   - Verify connection string format
   - Check firewall rules
   - Ensure SSL is enabled

3. **Authentication Issues**:
   - Verify NEXTAUTH_URL matches your domain
   - Check Google OAuth redirect URIs
   - Ensure NEXTAUTH_SECRET is set

### Debug Commands:

```bash
# Check app logs
az webapp log download --name skills-radar-app --resource-group myResourceGroup

# Test database connection
az postgres flexible-server connect --name skills-radar-db --admin-user dbadmin

# Check app service status
az webapp show --name skills-radar-app --resource-group myResourceGroup --query state
```

## Security Best Practices

1. **Environment Variables**: Never commit secrets to Git
2. **Database**: Use connection pooling and SSL
3. **Authentication**: Implement proper session management
4. **HTTPS**: Always use SSL in production
5. **Firewall**: Restrict database access to necessary IPs
6. **Updates**: Keep dependencies updated

## Cost Optimization

1. **App Service Plan**: Start with Basic tier, scale as needed
2. **Database**: Use Burstable tier for development
3. **Auto-scaling**: Set appropriate min/max instances
4. **Monitoring**: Use Azure Cost Management

## Support

For deployment issues:
1. Check Azure Portal logs
2. Review GitHub Actions workflow runs
3. Verify all environment variables are set
4. Test locally with Docker first

---

Choose the deployment option that best fits your needs:
- **Azure Web App**: Simplest, good for most applications
- **Container Instances**: More control, better for complex setups
- **Static Web Apps**: Best for static content with minimal server logic