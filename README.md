# Snooker Club Manager v3.0

A complete billing and management system for snooker clubs, pool halls, and billiard centers.

---

## Table of Contents

1. [Features](#features)
2. [Quick Start](#quick-start)
3. [Installation Guide](#installation-guide)
   - [Option 1: Web App (Local)](#option-1-web-app-local)
   - [Option 2: Desktop App (Windows/Mac/Linux)](#option-2-desktop-app-windowsmaclinux)
   - [Option 3: Cloud Deployment](#option-3-cloud-deployment)
4. [User Guide](#user-guide)
5. [Data Backup & Restore](#data-backup--restore)
6. [Updating the App](#updating-the-app)
7. [Troubleshooting](#troubleshooting)
8. [Development](#development)
9. [Tech Stack](#tech-stack)

---

## Features

### Core Features
- **Table Management** - Real-time session timers with pause/resume
- **Flexible Billing** - Hourly rates, per-frame, or flat pricing
- **F&B Integration** - Add food/beverage orders during sessions
- **Customer Database** - Track customers with visit history
- **Loyalty Program** - Points system with membership tiers

### Business Tools
- **Multi-User Access** - SuperAdmin, Owner, and Employee roles
- **Expense Tracking** - Record and categorize expenses
- **Reservations** - Book tables in advance
- **Analytics Dashboard** - Revenue insights with date filters
- **Day Closure Reports** - Daily reconciliation with variance tracking

### Export & Reporting
- **Receipt Printing** - Professional thermal-style receipts
- **PDF Export** - Analytics reports in PDF format
- **CSV Export** - Transaction data for spreadsheets
- **Data Backup** - Export/Import JSON + Google Drive sync

---

## Quick Start

```bash
# Clone or download the project
cd snooker-club-manager

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
# http://localhost:5173
```

**Default Login:**
- Username: `superadmin`
- PIN: `999999`

---

## Installation Guide

### Option 1: Web App (Local)

Best for: Quick setup, testing, single computer use

#### Prerequisites
- Node.js 18+ (Download from https://nodejs.org)
- npm (comes with Node.js)

#### Step-by-Step Installation

**Step 1: Install Node.js**

For Windows:
```bash
# Download installer from https://nodejs.org
# Run the installer and follow prompts
# Restart your terminal after installation
```

For Mac:
```bash
# Using Homebrew
brew install node

# Or download from https://nodejs.org
```

For Linux (Ubuntu/Debian):
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Step 2: Verify Installation**
```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show 9.x.x or higher
```

**Step 3: Setup the Project**
```bash
# Navigate to project folder
cd snooker-club-manager

# Install dependencies (takes 1-2 minutes)
npm install

# Start the application
npm run dev
```

**Step 4: Access the App**
- Open your browser
- Go to `http://localhost:5173`
- Login with `superadmin` / `999999`

#### Running in Production Mode
```bash
# Build optimized version
npm run build

# Preview production build
npm run preview
# Access at http://localhost:4173
```

#### Auto-Start on Boot (Optional)

For Windows:
1. Create a shortcut to run `npm run dev` in the project folder
2. Press `Win+R`, type `shell:startup`
3. Place the shortcut in the Startup folder

For Mac/Linux:
```bash
# Add to crontab
crontab -e

# Add this line (adjust path):
@reboot cd /path/to/snooker-club-manager && npm run dev
```

---

### Option 2: Desktop App (Windows/Mac/Linux)

Best for: Standalone app, no browser needed, professional setup

#### Prerequisites
- Node.js 18+
- npm

#### Building the Desktop App

**Step 1: Install Dependencies**
```bash
cd snooker-club-manager
npm install
```

**Step 2: Build for Your Platform**

For Windows:
```bash
# Standard installer (.exe with installation wizard)
npm run electron:build:win

# Portable version (single .exe, no installation)
npm run electron:build:portable

# Output: dist-electron/Snooker Club Manager Setup x.x.x.exe
```

For Mac:
```bash
npm run electron:build:mac

# Output: dist-electron/Snooker Club Manager-x.x.x.dmg
```

For Linux:
```bash
npm run electron:build:linux

# Output: dist-electron/snooker-club-manager-x.x.x.AppImage
```

**Step 3: Install the App**

For Windows Installer:
1. Navigate to `dist-electron/` folder
2. Run `Snooker Club Manager Setup x.x.x.exe`
3. Follow the installation wizard
4. Launch from Start Menu or Desktop shortcut

For Windows Portable:
1. Copy the `.exe` file to any folder
2. Double-click to run (no installation needed)
3. Great for USB drives or restricted computers

For Mac:
1. Open the `.dmg` file
2. Drag app to Applications folder
3. First launch: Right-click → Open (bypass Gatekeeper)

For Linux:
```bash
# Make AppImage executable
chmod +x snooker-club-manager-x.x.x.AppImage

# Run the app
./snooker-club-manager-x.x.x.AppImage
```

#### Desktop App Features
- Runs without browser
- System tray integration
- Native window controls
- Auto-updates (if configured)
- Works offline

#### Electron Configuration

The Electron main process is in `electron/main.js`. Key settings:

```javascript
// Window size (in electron/main.js)
mainWindow = new BrowserWindow({
  width: 1400,
  height: 900,
  // ... other options
});
```

---

### Option 3: Cloud Deployment

Best for: Access from anywhere, multiple devices, team access

#### Option 3A: Deploy to Vercel (Recommended)

**Step 1: Prepare Your Code**
```bash
# Build the production version
npm run build

# Verify the dist/ folder was created
ls dist/
```

**Step 2: Deploy via Vercel CLI**
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# For production deployment
vercel --prod
```

**Step 3: Deploy via GitHub Integration**
1. Push your code to GitHub
2. Go to https://vercel.com
3. Click "New Project"
4. Import your GitHub repository
5. Configure:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Click "Deploy"

**Your app will be live at:** `https://your-project.vercel.app`

#### Option 3B: Deploy to Netlify

**Step 1: Build the Project**
```bash
npm run build
```

**Step 2: Deploy via Netlify CLI**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

**Step 3: Deploy via Drag & Drop**
1. Go to https://app.netlify.com
2. Click "Add new site" → "Deploy manually"
3. Drag the `dist/` folder to the upload area
4. Your site is live!

**Step 4: Configure for Single Page App**

Create `public/_redirects` file:
```
/*    /index.html   200
```

Or create `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Option 3C: Self-Hosted Server (VPS/Dedicated)

**Using Nginx:**

```bash
# Build the project locally
npm run build

# Upload dist/ folder to your server
scp -r dist/* user@server:/var/www/snooker-app/

# Nginx configuration
sudo nano /etc/nginx/sites-available/snooker-app
```

Nginx config:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/snooker-app;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/snooker-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**Using Apache:**

Create `.htaccess` in dist/ folder:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**Using Docker:**

Create `Dockerfile`:
```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:
```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Build and run:
```bash
docker build -t snooker-app .
docker run -d -p 80:80 snooker-app
```

#### SSL/HTTPS Setup

For Vercel/Netlify: SSL is automatic and free.

For self-hosted with Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## User Guide

### User Roles

| Role | Access | Capabilities |
|------|--------|--------------|
| **SuperAdmin** | Full | Create owners, manage all settings, view all data |
| **Owner** | High | Create employees, manage tables/menu, view analytics |
| **Employee** | Limited | Start/end sessions, process payments, basic operations |

### First-Time Setup

1. **Login as SuperAdmin** (`superadmin` / `999999`)
2. **Create an Owner account** (User Management → Add Owner)
3. **Configure Club Settings** (Settings → Club Details)
4. **Add Tables** (Settings → Tables)
5. **Add Menu Items** (Settings → Menu)
6. **Create Employee accounts** (User Management → Add Employee)

### Daily Operations

**Starting a Session:**
1. Click an available (green) table
2. Select game type (hourly/per-frame/flat)
3. Optionally select customer
4. Click "Start Session"

**Adding F&B Orders:**
1. Click on an active (red) table
2. Click "Add Items"
3. Select food/beverages
4. Items are added to the bill

**Ending a Session:**
1. Click on an active table
2. Review the bill breakdown
3. Apply discount if needed
4. Select payment method
5. Click "End & Pay"

**Day Closure:**
1. Go to Finance → Day Closure
2. Enter actual cash/card/UPI amounts
3. Review variances
4. Add notes if needed
5. Close the day

---

## Data Backup & Restore

### Backup Methods

| Method | Description | When to Use |
|--------|-------------|-------------|
| **Export (JSON)** | Download all data as file | Before updates, periodic backup |
| **Google Drive** | Cloud sync | Automatic backup, multi-device |
| **Auto-Backup** | Scheduled reminders | Daily/weekly reminders |

### Creating a Backup

**Manual Export:**
1. Go to Settings → Backup & Sync
2. Click "Export"
3. Save the `backup-YYYY-MM-DD.json` file
4. Store in a safe location

**Google Drive Backup:**
1. Go to Settings → Backup & Sync
2. Click "Connect" under Google Drive
3. Authorize the app
4. Click "Backup" to sync

### Restoring from Backup

**From JSON File:**
1. Go to Settings → Backup & Sync
2. Click "Import"
3. Select your backup file
4. Confirm the restore
5. App will reload with restored data

**From Google Drive:**
1. Connect to Google Drive
2. Find your backup in the list
3. Click the download icon
4. Confirm the restore

### What Gets Backed Up

- Club settings (name, rates, hours)
- All tables and their configurations
- Complete menu with prices
- Customer database with loyalty points
- All user accounts (owners, employees)
- Sales transactions history
- Expense records
- Day closure records
- Reservations
- Emergency PIN configuration
- Loyalty program settings

---

## Updating the App

### Update Procedure

**IMPORTANT: Always backup before updating!**

```
Step 1: Export your data (Settings → Backup & Sync → Export)
Step 2: Install the new version
Step 3: Import your data (Settings → Backup & Sync → Import)
Step 4: Verify your data is intact
```

### For Web App Users

```bash
# Pull latest changes (if using git)
git pull

# Or download new version and replace files

# Install any new dependencies
npm install

# Restart the server
npm run dev
```

### For Desktop App Users

1. Export your data first!
2. Download new installer
3. Run installer (will update existing installation)
4. Launch app and import your data

### For Cloud Deployments

Vercel/Netlify: Push to GitHub, auto-deploys
Self-hosted: Upload new `dist/` folder, restart server

---

## Troubleshooting

### Common Issues

#### App won't start / White screen
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
npm run dev
```

#### Lost data after update
1. Check Downloads folder for `backup-*.json` files
2. Go to Settings → Backup & Sync → Import
3. Select the most recent backup file

#### Login not working
- SuperAdmin credentials: `superadmin` / `999999`
- Employee login: Use Employee ID (not name) + 6-digit PIN
- Owner login: Use Username + 6-digit PIN

#### Data not persisting
- Check browser allows localStorage
- Try different browser
- Clear browser cache and try again

#### Session timer issues
- Ensure browser tab stays open
- Don't use private/incognito mode
- Check system clock is correct

### Reset Everything

**Warning: This deletes all data!**

1. Open browser DevTools (F12)
2. Go to Application → Local Storage
3. Delete all `snooker_*` entries
4. Refresh the page
5. App resets to initial state

### Getting Help

- Check the console (F12) for error messages
- Ensure Node.js 18+ is installed
- Try a different browser
- Clear browser cache

---

## Development

### Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:5173)
npm run build            # Production build
npm run preview          # Preview production build

# Desktop App
npm run electron         # Run Electron in dev mode
npm run electron:build   # Build for current platform

# Platform-specific builds
npm run electron:build:win       # Windows installer
npm run electron:build:portable  # Windows portable
npm run electron:build:mac       # Mac .dmg
npm run electron:build:linux     # Linux AppImage

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # TypeScript check
```

### Project Structure

```
snooker-club-manager/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page components
│   ├── lib/             # Business logic & stores
│   ├── hooks/           # Custom React hooks
│   ├── contexts/        # React contexts
│   ├── types/           # TypeScript types
│   └── main.tsx         # App entry point
├── electron/
│   ├── main.js          # Electron main process
│   └── preload.js       # Preload script
├── public/              # Static assets
├── dist/                # Production build output
└── dist-electron/       # Electron build output
```

### Version Management

```bash
# Bump version
npm version patch    # 3.0.0 → 3.0.1 (bug fixes)
npm version minor    # 3.0.0 → 3.1.0 (new features)
npm version major    # 3.0.0 → 4.0.0 (breaking changes)
```

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 19, TypeScript |
| **Styling** | Tailwind CSS |
| **Build Tool** | Vite |
| **Desktop** | Electron |
| **Charts** | Recharts |
| **PDF Export** | jsPDF |
| **Security** | bcryptjs (PIN hashing) |
| **Icons** | Lucide React |

---

## License

MIT License - See [LICENSE.txt](LICENSE.txt)

---

## Support

For issues, questions, or feature requests:
- Check the Troubleshooting section above
- Review existing documentation
- Create an issue on the project repository

---

**Built with care for snooker clubs worldwide**
