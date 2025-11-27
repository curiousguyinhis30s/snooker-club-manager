# Demo Recording Guide

## Live URL
**https://snooker-club-manager.vercel.app**

---

## Recording Checklist

### Setup
- [ ] Open desktop browser (Chrome recommended)
- [ ] Set browser to 1920x1080 or similar
- [ ] Clear localStorage first (fresh demo): F12 → Application → Local Storage → Clear
- [ ] Start screen recording

---

## Demo Flow Script

### 1. Login as SuperAdmin
- Open https://snooker-club-manager.vercel.app
- **Username:** `superadmin`
- **PIN:** `999999`
- Click "Sign In"
- **Screenshot:** Login screen (desktop)

### 2. Navigate to Settings → User Management
- Click sidebar: **Settings**
- Click: **User Management**

### 3. Add an Owner
- Click "Add User"
- Fill in:
  - Name: `Ahmad Khan`
  - Username: `ahmad`
  - PIN: `123456`
  - Role: **Owner**
- Click "Add User"
- **Screenshot:** User added successfully

### 4. Add an Employee
- Click "Add User" again
- Fill in:
  - Name: `Ali Hassan`
  - Username: `ali`
  - PIN: `654321`
  - Role: **Employee**
- Click "Add User"
- **Screenshot:** Both users visible in list

### 5. Add F&B Items
- Navigate to: **Settings → F&B Management**
- Click "Add Item"
- Add items:
  - **Chai** - Rs. 50 - Category: Hot Drinks
  - **Cold Drink** - Rs. 100 - Category: Cold Drinks
  - **Biryani** - Rs. 350 - Category: Food
- **Screenshot:** Menu items added

### 6. Add a Pool Table
- Navigate to: **Settings → Table Management**
- Click "Add Table"
- Fill in:
  - Table Number: `Pool 1`
  - Activity: Pool
  - Rate: Rs. 300/hour
- Click "Add Table"
- **Screenshot:** Table created

### 7. Start a Session
- Navigate to: **Tables** (main view)
- Find "Pool 1" card (should show "Available")
- Click "Start"
- Enter customer name: `Usman`
- Click "Start Session"
- **Screenshot:** Timer running on table

### 8. Add Food to Session
- On the running table card, click "Add F&B" (food icon)
- Add:
  - 2x Chai
  - 1x Cold Drink
- Close modal
- **Screenshot:** F&B items showing on card

### 9. End Session & Print Receipt
- Let timer run for a minute (or wait)
- Click "Stop" on the table
- Review the bill breakdown:
  - Table time charges
  - F&B charges
  - Total
- Select payment method: **Cash**
- Click "Confirm Payment"
- Click "Print Receipt"
- **Screenshot:** Receipt preview

### 10. Check Dashboard
- Navigate to: **Dashboard**
- **Screenshot:** Revenue stats showing today's earnings

---

## Screenshots Needed (Desktop)

1. [ ] Login screen
2. [ ] User Management with users added
3. [ ] F&B Management with items
4. [ ] Table Management with pool table
5. [ ] Tables view with running session
6. [ ] Table card with F&B items
7. [ ] Billing modal with breakdown
8. [ ] Receipt preview
9. [ ] Dashboard with stats

---

## Tips for Recording

- **Pace:** Move slowly, let UI animations complete
- **Mouse:** Keep cursor visible, move smoothly
- **Narration:** Optional - explain each step
- **Duration:** Aim for 2-3 minutes total
- **Quality:** 1080p minimum

---

## Quick Reset (Between Takes)

```javascript
// Open browser console (F12) and run:
localStorage.clear();
location.reload();
```

This resets all data for a fresh demo.

---

## Default Credentials

| Role | Username | PIN |
|------|----------|-----|
| SuperAdmin | superadmin | 999999 |

---

Good luck with the recording!
