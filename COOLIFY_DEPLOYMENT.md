# Coolify Deployment Guide

This guide explains how to properly configure environment variables when deploying this Vite application to Coolify.

## Important: Vite Environment Variables

Vite applications embed environment variables **at build time**, not runtime. This means:
- Environment variables must be available during the Docker build process
- Variables must be prefixed with `VITE_` to be exposed to the client-side code
- In Coolify, you need to set them as **Build Arguments**, not just runtime environment variables

## Required Environment Variables

The following environment variables are required:

1. `VITE_SUPABASE_URL` - Your Supabase project URL
2. `VITE_SUPABASE_PUBLISHABLE_KEY` - Your Supabase anonymous/public key

## Setting Up in Coolify

### Step-by-Step Configuration

1. **Go to your application settings in Coolify**
2. **Navigate to "Environment Variables"**
3. **Add the following environment variables:**
   - `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = `your-anon-key-here`

4. **For each variable, make sure:**
   - ✅ **"Available at Buildtime"** is **CHECKED** (this is critical!)
   - ✅ **"Available at Runtime"** can be checked or unchecked (doesn't matter for Vite)
   - The variable name starts with `VITE_` (required for Vite)

5. **After adding/changing variables:**
   - **Force a rebuild without cache** in Coolify (this is critical!)
   - Go to your application → Deployment settings
   - Look for "Force deploy without using cache" or similar option
   - Trigger a new deployment

6. **Verify in Build Logs:**
   - After deployment starts, check the build logs
   - You should see messages like "✓ VITE_SUPABASE_URL is set" and "✓ VITE_SUPABASE_PUBLISHABLE_KEY is set"
   - If you see "WARNING: ... is not set!", the variables aren't being passed correctly

### Option 2: Using Dockerfile ARG Directly

If Coolify doesn't support build arguments directly, you can modify the build command in Coolify to pass them:

```bash
docker build --build-arg VITE_SUPABASE_URL=$VITE_SUPABASE_URL --build-arg VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY -t your-image-name .
```

### Option 3: Using a .env File (If Coolify Supports It)

If Coolify allows you to upload a `.env` file or set environment variables that are available during build:

1. Create a `.env` file with:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
   ```

2. Make sure this file is available during the Docker build process

## Verifying the Setup

After deployment, you can verify that the environment variables are correctly embedded:

1. Open your deployed application in a browser
2. Open the browser's Developer Tools (F12)
3. Go to the Console tab
4. Type: `console.log(import.meta.env)`
5. You should see your `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` values

## Troubleshooting

### Variables are undefined in the browser

**Problem:** Environment variables show as `undefined` in the browser console.

**Solutions:**
1. ✅ **Verify "Available at Buildtime" is checked** for each variable in Coolify
2. ✅ **Force rebuild without cache** - This is often the issue! Coolify may be using a cached build
3. ✅ Check the build logs in Coolify - look for the debug messages that show if variables are set
4. ✅ Make sure variable names start with `VITE_` prefix
5. ✅ After changing variables, always trigger a new deployment (not just restart)

### Build logs show variables are not set

**Problem:** The Docker build logs show "VITE_SUPABASE_URL is set: NO"

**Solutions:**
1. Double-check that "Available at Buildtime" is checked in Coolify
2. Verify the variable names are exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
3. Try deleting and re-adding the variables in Coolify
4. Check if there's a "Use Docker Build Secrets" option that needs to be enabled (though this is usually not needed)

### Application can't connect to Supabase

**Problem:** The app loads but can't connect to Supabase.

**Solutions:**
1. Verify your Supabase URL and key are correct
2. Check that the variables are being embedded at build time (see "Verifying the Setup" above)
3. Make sure you're using the **anon/public key**, not the service role key
4. Check your Supabase project settings to ensure the URL is correct

### Variables work locally but not in Coolify

**Problem:** Everything works locally but fails in Coolify.

**Solutions:**
1. Local development uses `.env` files that are read at runtime
2. Production builds embed variables at build time
3. Make sure Coolify is passing build arguments during the Docker build
4. Check Coolify's build logs to see if the ARG values are being passed

## Getting Your Supabase Credentials

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → This is your `VITE_SUPABASE_URL`
   - **anon public** key → This is your `VITE_SUPABASE_PUBLISHABLE_KEY`

## Notes

- **Never commit `.env` files** to your repository
- The **anon/public key** is safe to expose in client-side code (it's designed for this)
- The **service role key** should NEVER be used in the frontend
- After changing environment variables in Coolify, you must **rebuild** the Docker image for changes to take effect

