# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/23bd6d2b-1785-412e-8c79-6bb2007708c1

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/23bd6d2b-1785-412e-8c79-6bb2007708c1) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Setting up the Access Code

The application uses a secret access code system to unlock premium deals. The access code is stored in the database and verified directly by the frontend - no environment variables or Edge Functions needed!

### Setting the Access Code

1. **Run the migration** (if you haven't already):
   - The migration `20251126000000_add_settings_table.sql` creates a `settings` table
   - Run it via your Supabase SQL Editor or migration system

2. **Set the access code** using SQL:
   ```sql
   INSERT INTO public.settings (key, value, description)
   VALUES ('MRP_DEALS_ACCESS_CODE', 'MRP_ROCKS', 'Secret access code to unlock premium deals')
   ON CONFLICT (key) 
   DO UPDATE SET 
     value = EXCLUDED.value,
     updated_at = NOW();
   ```

3. **Verify it's set correctly**:
   ```sql
   SELECT key, value, LENGTH(value) AS value_length
   FROM public.settings
   WHERE key = 'MRP_DEALS_ACCESS_CODE';
   ```

### How It Works

- The access code is stored in the `public.settings` table in your database
- The frontend reads the code directly from the database when a user enters it
- The code is compared client-side, and if it matches, the user's profile is updated
- **No environment variables needed** - everything is managed via SQL
- **No restarts required** - changes take effect immediately
- The RLS policy allows anyone to read the access code (needed for verification)

### Updating the Access Code

To change the access code, simply run:

```sql
UPDATE public.settings
SET value = 'YOUR_NEW_CODE_HERE',
    updated_at = NOW()
WHERE key = 'MRP_DEALS_ACCESS_CODE';
```

**Note:** Users who enter the correct access code will have their `has_full_access` flag set to `true` in their profile, unlocking all deals.

See `SET_ACCESS_CODE.md` for more details and troubleshooting.

## Setting up Supabase Storage for Deal Logos

The application uses Supabase Storage to store company logos for deals. To set up the storage bucket:

1. **Go to your Supabase Dashboard**
   - Navigate to your project at https://supabase.com/dashboard
   - Select your project

2. **Create the Storage Bucket**
   - Go to **Storage** in the left sidebar
   - Click **New bucket**
   - Name it: `deal-logos`
   - Make it **Public** (so logos can be displayed on the frontend)
   - Click **Create bucket**

3. **Set up Storage Policies** (if needed)
   - Go to **Storage** → **Policies** for the `deal-logos` bucket
   - Ensure there's a policy that allows:
     - **Public read access** (for displaying logos)
     - **Authenticated users with admin privileges can upload** (for admin panel)

   Example policy for public read:
   ```sql
   CREATE POLICY "Public Access"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'deal-logos');
   ```

   Example policy for admin upload:
   ```sql
   CREATE POLICY "Admins can upload logos"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'deal-logos' AND
     (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
   );
   ```

4. **Run the Migration**
   - Make sure to run the migration that adds the `logo_url` column to the deals table:
   ```bash
   supabase migration up
   ```
   Or apply it manually through the Supabase SQL editor.

**Note:** When creating or editing deals in the admin panel, you can now upload company logos. The logos will be stored in Supabase Storage and displayed on the deal cards.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (for backend and authentication)

## Running with Docker

This project includes Docker support for both development and production environments.

### Production Build

Build and run the production container:

```sh
# Build the Docker image
docker build -t myrealproduct-perks-hub .

# Run the container
docker run -p 3000:80 myrealproduct-perks-hub
```

Or use Docker Compose:

```sh
# Build and run production container
docker-compose up app

# Run in detached mode
docker-compose up -d app
```

The app will be available at `http://localhost:3000`

### Development Mode

Run the development server in Docker:

```sh
# Using Docker Compose (recommended)
docker-compose up app-dev

# Or build and run manually
docker build -f Dockerfile.dev -t myrealproduct-perks-hub-dev .
docker run -p 8080:8080 -v $(pwd):/app -v /app/node_modules myrealproduct-perks-hub-dev
```

The dev server will be available at `http://localhost:8080` with hot-reload enabled.

### Docker Compose Commands

```sh
# Start production container
docker-compose up app

# Start development container
docker-compose up app-dev

# Stop containers
docker-compose down

# Rebuild containers
docker-compose build

# View logs
docker-compose logs -f
```

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/23bd6d2b-1785-412e-8c79-6bb2007708c1) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
