# Prashna — AI Test Generator for Teachers

## Setup Instructions

### Step 1: Supabase Database Setup
1. supabase.com pe login karo
2. Apna project open karo
3. Left menu mein "SQL Editor" pe click karo
4. `lib/schema.sql` file ka poora content copy karo
5. SQL Editor mein paste karo aur "Run" dabao
6. "Success" message aane pe database ready hai

### Step 2: Vercel Environment Variables
Vercel Dashboard → Project (prashna) → Settings → Environment Variables

Add these 3 variables:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | https://xxxxx.supabase.co |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | sb_publishable_xxxxx |
| `ANTHROPIC_API_KEY` | sk-ant-api03-xxxxx |

### Step 3: GitHub pe Upload
1. Purani `index.html` file GitHub se delete karo
2. Is poore folder ka content GitHub pe upload karo
3. Vercel automatically redeploy kar dega

### Step 4: Test Karo
1. prashna.vercel.app/login pe jao
2. Sign up karo
3. Dashboard mein jao
4. Topic likho → Generate with AI → Questions aayenge!

## Features
- Real AI question generation (Claude Haiku)
- PDF/Notes upload support
- Teacher login/signup
- Test share via link
- Student attempt + auto grading
- PDF download
- Analytics dashboard

## Support
Call: 9863168046
