# Unfoldd Deployment Guide

## Prerequisites
- Vercel account (Pro plan recommended for cron jobs)
- Supabase project
- Groq API key (or credits)
- Razorpay account (Live mode for production)
- Firebase project (FCM enabled)
- Gmail account with app password (for SMTP)

## Step 1: Database Setup
1. Create a new Supabase project.
2. Run `supabase_schema.sql` in the SQL editor.
3. Run `supabase_functions.sql` and `supabase_proctor_functions.sql`.
4. Run `supabase_admin.sql` to set up views.
5. Create an admin account by running `create_admin.sql` with your Auth UUID.
6. Run `supabase_seed_internships.sql` to populate initial job listings.
7. Enable Google OAuth in Supabase Auth settings.

## Step 2: Service Configuration
1. **Firebase**:
   - Enable Cloud Messaging.
   - Generate Web Push VAPID key.
   - Update `public/firebase-messaging-sw.js` with your config.
2. **Groq**:
   - Ensure your API key has sufficient balance.
3. **Razorpay**:
   - Set up Webhook URL: `https://unfoldd.me/api/payment/webhook`.
   - Secret must match `RAZORPAY_WEBHOOK_SECRET`.

## Step 3: Vercel Deployment
1. Connect your repository to Vercel.
2. Import all environment variables from `.env.production.example`.
3. Set the build command: `npm run build`.
4. Set Node.js version to 18.x or higher.

## Step 4: Verification
1. Run `npm run verify` locally to ensure critical files and env vars are present.
2. Complete a full test cycle using the `TEST_CHECKLIST.md`.
