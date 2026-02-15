# Security Testing Checklist

## Test 1: RLS Policies ✓

Run this in Supabase SQL Editor to verify:

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('rsvps', 'messages', 'photos', 'content', 'song_requests');
```

**Expected:** All tables show `rowsecurity = true`

---

## Test 2: Admin Login Lockout

**Steps:**
1. Open: http://localhost:8081/admin/login
2. Enter any email and **WRONG** password
3. Click "Sign In" 3 times
4. On 3rd failed attempt, you should see:
   - "Too many failed attempts"
   - "Account locked for 30 seconds"
5. Try logging in again immediately - should be blocked
6. Wait 30 seconds and try again - should allow attempt

**Status:** ⏳ PENDING

**Result:**
- [ ] Lockout triggered after 3 attempts
- [ ] Blocked during lockout period
- [ ] Allowed after 30 seconds

---

## Test 3: Rate Limiting (Database Level)

### Test 3a: RSVP Rate Limiting

**Method:** Run in Supabase SQL Editor

```sql
-- Try inserting 6 RSVPs with same email
INSERT INTO rsvps (name, email, attending, guests) VALUES
('Test 1', '[email protected]', true, 1);
INSERT INTO rsvps (name, email, attending, guests) VALUES
('Test 2', '[email protected]', true, 1);
INSERT INTO rsvps (name, email, attending, guests) VALUES
('Test 3', '[email protected]', true, 1);
INSERT INTO rsvps (name, email, attending, guests) VALUES
('Test 4', '[email protected]', true, 1);
INSERT INTO rsvps (name, email, attending, guests) VALUES
('Test 5', '[email protected]', true, 1);
-- This 6th one should FAIL:
INSERT INTO rsvps (name, email, attending, guests) VALUES
('Test 6', '[email protected]', true, 1);
```

**Expected:** 6th insert fails with "Rate limit exceeded"

**Status:** ⏳ PENDING

**Result:**
- [ ] First 5 inserts succeed
- [ ] 6th insert fails with rate limit error

**Cleanup:**
```sql
DELETE FROM rsvps WHERE email = '[email protected]';
```

---

### Test 3b: Message Rate Limiting

```sql
-- Try inserting 4 messages with same name
INSERT INTO messages (name, content, approved) VALUES
('Test User', 'Message 1', false);
INSERT INTO messages (name, content, approved) VALUES
('Test User', 'Message 2', false);
INSERT INTO messages (name, content, approved) VALUES
('Test User', 'Message 3', false);
-- This 4th one should FAIL:
INSERT INTO messages (name, content, approved) VALUES
('Test User', 'Message 4', false);
```

**Expected:** 4th insert fails with "Rate limit exceeded"

**Status:** ⏳ PENDING

**Cleanup:**
```sql
DELETE FROM messages WHERE name = 'Test User';
```

---

## Test 4: XSS Protection

**Steps:**
1. Go to: http://localhost:8081/guestbook
2. Submit a message with this content:
   ```
   <script>alert('XSS Attack!')</script>Hello World
   ```
3. After admin approves, view the guestbook

**Expected:**
- Script tags are stripped
- Only "Hello World" displays (no alert popup)

**Status:** ⏳ PENDING

**Result:**
- [ ] Script not executed
- [ ] Text displays safely

---

## Test 5: Admin Can View Data (RLS Check)

**Steps:**
1. Login to admin panel: http://localhost:8081/admin/login
2. Go to admin dashboard
3. Try viewing RSVPs

**Expected:** Admin can see all RSVPs

**Status:** ⏳ PENDING

---

## Test 6: Public Cannot View Data Directly

This tests that RLS is working - public users can't query database directly.

**Method:** Try accessing Supabase API directly without auth

**Status:** ⏳ PENDING

---

## Summary

| Test | Status | Result |
|------|--------|--------|
| RLS Enabled | ⏳ | Pending verification |
| Admin Lockout | ⏳ | Pending |
| RSVP Rate Limit | ⏳ | Pending |
| Message Rate Limit | ⏳ | Pending |
| XSS Protection | ⏳ | Pending |
| Admin Can View | ⏳ | Pending |
| Public Cannot View | ⏳ | Pending |
