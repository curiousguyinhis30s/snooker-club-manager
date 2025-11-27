# LinkedIn Post - Snooker Club Manager

---

## I built a billing system for a snooker club. Here's what I learned about "vibe coding" and shipping real solutions.

A few weeks ago, a friend who runs a small snooker club came to me with a problem.

"Bro, I'm still using a notebook to track table timers. Sometimes I forget to write down when someone started. Bills get messed up. Customers argue. It's chaos."

He'd looked at existing POS systems. Too expensive. Too complicated. Too much setup.

So I thought - why not build something simple?

---

### The Real Problem

His needs were actually pretty basic:
- Start a timer when someone takes a table
- Pause it if they take a break
- Add food/drinks to the bill
- Print a receipt at the end
- Know how much money came in today

That's it. No inventory management. No complex analytics. No enterprise features.

Just something that *works*.

---

### The "Vibe Coding" Approach

I didn't start with a detailed spec or wireframes.

I opened VS Code, started with React + Vite, and just... built.

Table card? Let's make it look like a real table.
Timer? Real-time, shows hours and minutes.
Adding food? Quick modal, tap and go.

The goal wasn't perfection. It was *shipping something usable*.

This is what people call "vibe coding" - you follow the flow, iterate fast, and let the product take shape naturally.

---

### The Tech Stack (100% Free)

Here's what powers this entire application:

| Layer | Technology | Cost |
|-------|------------|------|
| Frontend | React 18 + TypeScript | Free |
| Styling | Tailwind CSS | Free |
| Build Tool | Vite | Free |
| Data Storage | LocalStorage + IndexedDB | Free |
| Hosting | Vercel | Free |
| Icons | Lucide React | Free |

**Total monthly cost: $0**

No backend servers. No database subscriptions. No API costs.

All data stays on the user's browser. Perfect for a single-location business that doesn't need cloud sync.

---

### What It Actually Does

**For Daily Operations:**
- Manage multiple tables (snooker, pool, or any activity)
- Real-time session timers with pause/resume
- Add F&B items during a session
- Multiple payment methods (cash, card, split)
- Print professional receipts

**For Business Management:**
- Owner and Employee role separation
- Daily revenue dashboard
- Expense tracking
- Customer database with loyalty points
- Day closure reports for reconciliation

**The Flow:**
1. Customer walks in
2. Tap "Start" on an available table
3. Add their name (optional)
4. Timer runs
5. Add food/drinks as they order
6. Tap "Stop" when done
7. Choose payment method
8. Print receipt
9. Done. Next customer.

---

### The Learning

Building this taught me a few things:

**1. Start with the user, not the technology**

My friend doesn't care about React or TypeScript. He cares about not losing track of which table started when.

**2. "Good enough" shipped beats "perfect" planned**

The first version had bugs. The UI wasn't pretty. But it worked. And each iteration made it better.

**3. LocalStorage is underrated**

For single-device applications, you don't need a database. Browser storage handles surprisingly complex data structures.

**4. Free tiers are powerful**

Between Vercel's free hosting and browser-based storage, you can run a full business application without spending a rupee.

**5. Sometimes the solution is simpler than you think**

Enterprise software has taught us that everything needs to be complex. But a small snooker club doesn't need SAP. It needs a timer and a calculator.

---

### The Result

My friend has been using this for 3 weeks now.

No more forgotten timers.
No more arguments about bills.
No more end-of-day guessing.

It's not perfect. There's no cloud backup (yet). No multi-device sync. No fancy AI features.

But it solves his actual problem. And that's what software should do.

---

### Try It Yourself

The app is live and free to use:

**Live Demo:** https://snooker-club-manager.vercel.app

**Default Login:**
- Username: `superadmin`
- PIN: `999999`

Play around. Start some sessions. Add some food items. See if it fits your needs.

---

### Final Thought

We often overcomplicate things.

Sometimes the best solution isn't the most technically impressive one. It's the one that actually gets used.

If you're building something - ask yourself: does this solve a real problem for a real person?

If yes, ship it. Make it better later.

---

*#buildinpublic #vibecoding #reactjs #typescript #vercel #startup #snooker #billiards #smallbusiness #software #webdevelopment #indiehacker*

---

## Short Version (For LinkedIn Character Limits)

---

I built a billing system for a snooker club using "vibe coding."

My friend was tracking table timers in a notebook. Customers argued about bills. It was chaos.

Existing POS systems? Too expensive. Too complicated.

So I built something simple.

**The Stack (100% Free):**
- React + TypeScript
- Tailwind CSS
- Vite
- Browser storage (no database)
- Vercel hosting

**Total cost: $0/month**

**What it does:**
- Real-time table timers
- Pause/resume sessions
- Add food & drinks
- Multiple payment methods
- Print receipts
- Daily revenue tracking

**The learning:**
1. Start with the user's problem, not the technology
2. "Good enough" shipped beats "perfect" planned
3. Browser storage handles more than you think
4. Free tiers are powerful
5. Simple often wins

My friend's been using it for 3 weeks. No more forgotten timers. No more billing arguments.

It's not perfect. But it works.

And that's what software should do.

Try it: https://snooker-club-manager.vercel.app
Login: superadmin / 999999

Sometimes the best solution isn't the most impressive one. It's the one that gets used.

#buildinpublic #vibecoding #reactjs #indiehacker

---
