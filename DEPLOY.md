# Deploy Guide

Your Supabase project ref: `re_f7yTVSEJ_2XFKy58KQmaAan8nW4o8ua4x`

## Step 1: Deploy the Edge Function (Manual)

Since Supabase CLI isn't available, deploy via the dashboard:

1. Go to: https://supabase.com/dashboard/project/re_f7yTVSEJ_2XFKy58KQmaAan8nW4o8ua4x/functions

2. Click **"New Function"**

3. Name it: `send-order-confirmation`

4. Copy the code from:
   `C:\Users\ra\OneDrive\Desktop\Ckeyks\supabase\functions\send-order-confirmation\index.ts`

5. Paste into the editor

6. Click **"Deploy Function"**

## Step 2: Add Resend API Key

1. In the same Edge Functions page, click **"Secrets"**

2. Add new secret:
   - Name: `RESEND_API_KEY`
   - Value: Your Resend API key (from resend.com)

## Step 3: Test

1. Place an order with an email address
2. Go to /login → sign in
3. Change order status to "Confirmed"
4. Customer receives email!

---

## Alternative: If Resend Not Setup

The function will still work - it just logs emails to Supabase function logs instead of sending real emails. You can view logs in:
Supabase Dashboard → Edge Functions → send-order-confirmation → Logs
