# Environment Variables Guide

## Overview

Environment variables store sensitive configuration like API keys and database URLs. **NEVER commit these to git!**

## Required Variables

### Local Development (`.env` file)

Create a `.env` file in the project root:

```bash
VITE_SUPABASE_URL=https://hxvydccjwfnbyrzwybsz.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key_here
VITE_SUPABASE_PROJECT_ID=hxvydccjwfnbyrzwybsz
```

### Where to Get These Values

1. Go to: https://supabase.com/dashboard/project/hxvydccjwfnbyrzwybsz/settings/api
2. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Project API keys → anon/public** → `VITE_SUPABASE_ANON_KEY` and `VITE_SUPABASE_PUBLISHABLE_KEY`
   - **Project ID** (from URL) → `VITE_SUPABASE_PROJECT_ID`

## Security Best Practices

### ✅ DO:
- Keep `.env` in `.gitignore`
- Use different keys for dev/production
- Rotate keys if exposed
- Use environment variables in deployment platform

### ❌ DON'T:
- Commit `.env` to git
- Share keys in Slack/email
- Use production keys in development
- Hard-code keys in source files

## How to Rotate Credentials

If your credentials are exposed (e.g., committed to git):

### 1. Generate New Keys

In Supabase Dashboard:
1. Go to Settings → API
2. Click "Reset API Keys"
3. Confirm (this invalidates old keys!)
4. Copy new keys

### 2. Update Local Environment

Update your `.env` file with new keys:

```bash
VITE_SUPABASE_ANON_KEY=NEW_KEY_HERE
VITE_SUPABASE_PUBLISHABLE_KEY=NEW_KEY_HERE
```

### 3. Update Production Environment

**If using Lovable:**
1. Go to project settings
2. Update environment variables
3. Redeploy

**If using Vercel:**
1. Project Settings → Environment Variables
2. Update each variable
3. Redeploy

### 4. Clean Git History (If Exposed)

⚠️ **IMPORTANT:** If you committed `.env` to git, keys are in history!

**Option A: Remove from future commits** (simple)
```bash
git rm --cached .env
git commit -m "Remove .env from tracking"
```

**Option B: Purge from history** (thorough but complex)
```bash
# Use BFG Repo-Cleaner or git filter-branch
# Follow: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository
```

## Development Workflow

### Starting Development

1. Clone repo
2. Copy `.env.example` to `.env` (if example exists)
3. Get keys from Supabase dashboard
4. Add keys to `.env`
5. Run `npm run dev`

### Adding New Variables

1. Add to `.env` file
2. Access in code: `import.meta.env.VITE_YOUR_VAR`
3. Document in this file
4. Add to deployment platform

## Deployment

### Lovable Platform

Environment variables are managed in project settings. Update there when rotating keys.

### Vercel/Netlify

Add environment variables in project dashboard:
1. Project Settings → Environment Variables
2. Add each `VITE_*` variable
3. Set for Production/Preview/Development as needed
4. Redeploy

## Troubleshooting

### "Invalid API key" error
- Check `.env` file exists
- Verify keys are correct
- Restart dev server (`npm run dev`)

### Changes not reflecting
- Restart dev server
- Check variable name starts with `VITE_`
- Verify deployment platform has updated values

### Keys exposed in browser
- `VITE_*` variables are public (bundled in frontend)
- **NEVER** put `service_role` key in `VITE_*` variables
- Use Supabase RLS policies to protect data

## Emergency Response

If credentials are compromised:

1. **Immediately** rotate keys in Supabase dashboard
2. Update `.env` locally
3. Update deployment platform
4. Check database for suspicious activity
5. Review RLS policies are enabled
6. Monitor error logs

## Contact

For help with environment variables:
- Supabase Docs: https://supabase.com/docs
- GitHub Issues: [your-repo]/issues
