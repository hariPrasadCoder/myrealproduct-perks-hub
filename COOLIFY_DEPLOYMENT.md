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

### Option 1: Using Build Arguments (Recommended)

1. **Go to your application settings in Coolify**
2. **Navigate to "Environment Variables" or "Build Arguments"**
3. **Add the following build arguments:**
   - `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = `your-anon-key-here`

4. **Make sure these are set as BUILD ARGUMENTS**, not just runtime environment variables
   - In Coolify, look for a toggle or option to set variables as "Build Args" or "Build Arguments"
   - If there's a checkbox for "Use as build argument", make sure it's checked

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
1. Make sure variables are prefixed with `VITE_`
2. Make sure they're set as build arguments, not just runtime environment variables
3. Rebuild the Docker image after adding/changing variables
4. Check that Coolify is passing build arguments to the Docker build command

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

