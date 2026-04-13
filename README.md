# CKeyks - Custom Pastry Order System

A React-based order form and admin dashboard for CKeyks pastry business.

## Features

### Customer Order Form
- Multi-step order form (Design → Details → Review)
- Product type selection (Cakes, Tarts, Cupcakes, Specialty Bread)
- Design style selection
- Dynamic size options
- Custom notes
- Contact info with validation
- Orders saved to Supabase

### Admin Dashboard (`/admin`)
- Secure login with Supabase Auth
- Orders management table with status updates
- Product CRUD (Create, Read, Update, Delete)
- Real-time data from Supabase

## Setup

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to SQL Editor and run the schema from `supabase-schema.sql`
3. Get your project URL and anon key from Settings → API

### 2. Configure Environment Variables
Create a `.env` file in the project root:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Install & Run
```bash
npm install
npm run dev
```

### 4. Deploy to Vercel
```bash
npx vercel --prod
```
Add your environment variables in Vercel project settings.

## Routes
- `/` - Customer order form
- `/login` - Admin login page
- `/admin` - Protected admin dashboard

## Tech Stack
- React + Vite
- Tailwind CSS
- Supabase (Database + Auth)
- React Router
- Vercel (Hosting)

## Email Notifications

When you confirm an order in the admin dashboard, a confirmation email is automatically sent to the customer.

### Setup Email Notifications

1. **Sign up for Resend** (free tier available)
   - Go to [resend.com](https://resend.com) and create an account

2. **Add API Key to Supabase**
   - Go to Supabase Dashboard → Edge Functions → Secrets
   - Add: `RESEND_API_KEY` = your Resend API key

3. **Deploy the Edge Function**

   Go to [supabase.com/dashboard](https://supabase.com/dashboard) → Your project → Edge Functions

   Click "New Function" and name it `send-order-confirmation`

   Copy the code from `supabase/functions/send-order-confirmation/index.ts` and paste it into the editor

   Click "Deploy Function"

4. **Add the API Key Secret**
   - In Edge Functions page, go to "Secrets"
   - Add: `RESEND_API_KEY` = your Resend API key

5. **Test it**
   - Make a test order with an email address
   - Go to admin, change order status to "Confirmed"
   - Check customer's inbox for confirmation email