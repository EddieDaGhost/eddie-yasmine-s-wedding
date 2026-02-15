# Security Documentation

## Overview

This document outlines the security measures implemented in the wedding website to protect guest data and prevent abuse.

## Implemented Security Measures

### 1. Row-Level Security (RLS) Policies

**What it does:** Restricts database access so only authorized users can view/modify sensitive data.

**Tables protected:**
- `rsvps` - Only admins can view RSVPs; guests can only submit
- `guestbook_messages` - Public sees approved messages only; admins see all
- `photos` - Public sees approved photos only; admins manage all
- `content` - Public can read; only admins can modify
- `song_requests` - Guests can submit; only admins can view

**Migration file:** `supabase/migrations/20260215000000_add_rls_policies.sql`

### 2. Rate Limiting

**What it does:** Prevents spam and abuse by limiting submission frequency.

**Limits:**
- RSVPs: Max 5 per email per hour
- Guestbook messages: Max 3 per name per hour
- Photo uploads: Max 10 total per hour
- Song requests: Max 5 per email per hour

**Migration file:** `supabase/migrations/20260215000001_add_rate_limiting.sql`

### 3. XSS Protection

**What it does:** Sanitizes user-generated content to prevent malicious scripts.

**Implementation:** DOMPurify library sanitizes all HTML before rendering.

**Protected areas:**
- Guestbook messages
- Photo captions
- RSVP names/notes
- Any user-submitted content

**Code file:** `src/lib/sanitize.ts`

### 4. Admin Login Protection

**What it does:** Prevents brute-force password attacks.

**How it works:**
- After 3 failed login attempts, account locks for 30 seconds
- Lockout time increases exponentially: 30s → 1m → 2m → 5m → 15m
- Successful login resets counter

**Code file:** `src/pages/admin/AdminLogin.tsx`

## Known Limitations

1. **Rate limiting is IP-agnostic** - Uses email/name fields for tracking (can be improved with IP tracking)
2. **No 2FA** - Admin login uses password only (future enhancement)
3. **Client-side rate limiting** - Admin login lockout can be bypassed by clearing browser storage (but Supabase has server-side limits)

## How to Rotate Credentials

**IMPORTANT:** Never commit `.env` files to git!

### Steps:

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/api
2. Under "Project API keys", find your keys:
   - `anon` key (public)
   - `service_role` key (secret - never expose!)
3. If compromised, generate new keys via "Reset API Keys"
4. Update environment variables:
   - Local: Update `.env` file (DO NOT commit)
   - Production: Update in Lovable/Vercel/deployment platform
5. Invalidate old keys in Supabase dashboard

### Environment Variables:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key_here
VITE_SUPABASE_PROJECT_ID=your_project_id
```

## Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** open a public GitHub issue
2. Email: [your-email@example.com]
3. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact

We'll respond within 48 hours.

## Security Checklist

Before going live:

- [ ] Supabase credentials rotated
- [ ] `.env` file NOT in git
- [ ] RLS policies migrated and tested
- [ ] Rate limiting tested
- [ ] XSS sanitization tested with malicious inputs
- [ ] Admin login lockout tested
- [ ] All dependencies updated (`npm audit fix`)

## Testing Security

### Test RLS Policies:
```sql
-- In Supabase SQL Editor
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
-- All tables should show 't' (true) for rowsecurity
```

### Test Rate Limiting:
- Submit 6 RSVPs with same email within 1 hour
- 6th should fail with "Rate limit exceeded"

### Test XSS Protection:
- Try submitting: `<script>alert('XSS')</script>` in guestbook
- Should display as plain text, not execute

### Test Admin Lockout:
- Enter wrong password 3 times
- Should lock for 30 seconds

## Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
