# Deploying GreatReading to Render

This guide walks you through deploying the GreatReading application to Render using their free tier.

## Prerequisites

- GitHub account with the repository
- Render account (sign up at https://render.com)
- Repository pushed to GitHub

## Deployment Options

### Option 1: Blueprint (Recommended - One-Click Deploy)

This method uses the `render.yaml` blueprint file to deploy all services at once.

1. **Go to Render Dashboard**
   - Visit https://dashboard.render.com

2. **Create New Blueprint**
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository: `alinali87/great-reading`
   - Render will automatically detect the `render.yaml` file

3. **Configure Services**
   - The blueprint will create:
     - PostgreSQL database (free tier)
     - Backend API service (starter plan - $7/month)
     - Frontend static site (free tier)

4. **Review and Deploy**
   - Review the services
   - Click "Apply" to deploy all services

5. **Update CORS Settings**
   - After deployment, note your frontend URL (e.g., `https://greatreading-frontend.onrender.com`)
   - Go to Backend service → Environment
   - Update `BACKEND_CORS_ORIGINS` to: `["https://greatreading-frontend.onrender.com"]`
   - Save and the service will redeploy

### Option 2: Manual Deployment (Step-by-Step)

#### Step 1: Create PostgreSQL Database

1. Go to Render Dashboard → "New +" → "PostgreSQL"
2. Configure:
   - **Name**: `greatreading-db`
   - **Database**: `greatreading_db`
   - **User**: `greatreading_db_user`
   - **Region**: Oregon (or closest to your users)
   - **Plan**: Free
3. Click "Create Database"
4. Wait for database to be created (~2 minutes)
5. Copy the **Internal Database URL** (starts with `postgresql://`)

#### Step 2: Create Backend Service

1. Go to Render Dashboard → "New +" → "Web Service"
2. Connect your GitHub repository: `alinali87/great-reading`
3. Configure:
   - **Name**: `greatreading-backend`
   - **Region**: Oregon (same as database)
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Runtime**: Python 3
   - **Build Command**: 
     ```bash
     cd backend && pip install uv && uv sync --frozen
     ```
   - **Start Command**:
     ```bash
     cd backend && uv run uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Plan**: Starter ($7/month) or Free (with limitations)

4. **Add Environment Variables**:
   Click "Advanced" → "Add Environment Variable":
   
   | Key | Value |
   |-----|-------|
   | `PYTHON_VERSION` | `3.11` |
   | `DATABASE_URL` | Paste the Internal Database URL from Step 1 |
   | `SECRET_KEY` | Click "Generate" or use a secure random string (min 32 chars) |
   | `BACKEND_CORS_ORIGINS` | `["https://greatreading-frontend.onrender.com"]` (update after frontend is created) |
   | `DEV_MODE` | `false` |

5. Click "Create Web Service"
6. Wait for deployment (~5-10 minutes)
7. Note your backend URL (e.g., `https://greatreading-backend.onrender.com`)

#### Step 3: Create Frontend Service

1. Go to Render Dashboard → "New +" → "Static Site"
2. Connect your GitHub repository: `alinali87/great-reading`
3. Configure:
   - **Name**: `greatreading-frontend`
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Build Command**:
     ```bash
     cd frontend && npm ci && npm run build
     ```
   - **Publish Directory**: `frontend/dist`

4. **Add Environment Variables**:
   Click "Advanced" → "Add Environment Variable":
   
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://greatreading-backend.onrender.com/api/v1` (use your backend URL from Step 2) |

5. **Add Redirect Rules** (for SPA routing):
   - Source: `/*`
   - Destination: `/index.html`
   - Action: Rewrite

6. Click "Create Static Site"
7. Wait for deployment (~3-5 minutes)
8. Note your frontend URL (e.g., `https://greatreading-frontend.onrender.com`)

#### Step 4: Update Backend CORS

1. Go to your Backend service
2. Environment → Edit `BACKEND_CORS_ORIGINS`
3. Update to: `["https://greatreading-frontend.onrender.com"]` (use your actual frontend URL)
4. Save (service will automatically redeploy)

## Post-Deployment Configuration

### Custom Domain (Optional)

1. **For Frontend**:
   - Go to Frontend service → Settings → Custom Domain
   - Add your domain (e.g., `greatreading.com`)
   - Update your DNS with the provided CNAME record

2. **For Backend**:
   - Go to Backend service → Settings → Custom Domain
   - Add your API subdomain (e.g., `api.greatreading.com`)
   - Update CORS settings with your custom domain

### Environment Variables to Update

After deployment, you may want to update:

- **SECRET_KEY**: Generate a more secure key
  ```bash
  python -c "import secrets; print(secrets.token_urlsafe(32))"
  ```

- **BACKEND_CORS_ORIGINS**: Add your custom domains if using

## Cost Breakdown

**Free Tier Setup:**
- PostgreSQL: Free (expires after 90 days, then $7/month)
- Backend: Free (with 750 hours/month limit, sleeps after 15 min inactivity)
- Frontend: Free (static site hosting)

**Recommended Paid Setup:**
- PostgreSQL: $7/month (Starter plan)
- Backend: $7/month (Starter plan - always on, no sleep)
- Frontend: Free
- **Total**: $14/month

## Troubleshooting

### Build Failures

**Backend build fails with "uv not found"**:
- Make sure build command includes: `pip install uv && ...`

**Frontend build fails**:
- Check that `package-lock.json` is committed to git
- Verify `npm ci` works locally

### Runtime Issues

**Database connection errors**:
- Verify `DATABASE_URL` environment variable is set
- Check database is in "Available" status
- Ensure backend and database are in the same region

**CORS errors in browser**:
- Update `BACKEND_CORS_ORIGINS` with your frontend URL
- Include the protocol (https://)
- Use JSON array format: `["https://example.com"]`

**Frontend can't reach backend**:
- Verify `VITE_API_URL` points to correct backend URL
- Check backend health at: `https://your-backend.onrender.com/api/v1/docs`

### Free Tier Limitations

**Backend service sleeps after 15 minutes of inactivity**:
- First request after sleep takes ~30 seconds to wake up
- Upgrade to Starter plan ($7/month) to keep service always on
- Or use a service like UptimeRobot to ping your API every 10 minutes

**PostgreSQL database expires after 90 days**:
- Export your data before expiration
- Upgrade to Starter plan ($7/month) for permanent database

## Monitoring and Logs

### View Logs

1. Go to your service in Render Dashboard
2. Click "Logs" tab
3. View real-time logs or filter by date

### Health Checks

- Backend health: `https://your-backend.onrender.com/api/v1/docs`
- Frontend health: `https://your-frontend.onrender.com`

### Database Metrics

1. Go to PostgreSQL service
2. Click "Metrics" tab
3. View connections, storage, queries

## Updating Your Deployment

### Automatic Deploys

By default, Render automatically deploys when you push to your main branch.

### Manual Deploy

1. Go to your service
2. Click "Manual Deploy" → "Deploy latest commit"

### Rollback

1. Go to your service → "Events"
2. Find a previous successful deploy
3. Click "Rollback to this deploy"

## Backups

### Database Backups

Free tier doesn't include automatic backups. To backup manually:

1. Go to PostgreSQL service → "Info" tab
2. Copy the "External Database URL"
3. Run locally:
   ```bash
   pg_dump <EXTERNAL_DATABASE_URL> > backup.sql
   ```

Paid plans include daily automatic backups.

## Security Best Practices

- ✅ Use strong `SECRET_KEY` (generated, not manual)
- ✅ Keep `DATABASE_URL` secret
- ✅ Configure CORS properly (don't use wildcard in production)
- ✅ Enable HTTPS (automatic on Render)
- ✅ Regularly update dependencies
- ✅ Review logs for errors
- ✅ Use environment variables for all secrets

## Support

- Render Documentation: https://render.com/docs
- Render Community: https://community.render.com
- Status Page: https://status.render.com

## Next Steps

After successful deployment:

1. Test the application thoroughly
2. Set up monitoring/alerting
3. Configure custom domain (optional)
4. Set up database backups
5. Review and optimize performance
6. Consider upgrading to paid plans for production use
