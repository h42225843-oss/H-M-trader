# H.M Traders — Ledger

A professional inventory, sales, dues, and purchase ledger for H.M Traders (bottles). Installable as an app on both PC and mobile (PWA), synced live via Firebase, deployed on Vercel, version-controlled on GitHub.

## What's included
- **Dashboard** — today's sales, total dues, low stock alerts, stock value
- **Inventory** — add/edit products, stock, cost & sale price, low-stock threshold
- **Sales** — record a sale (multiple items), auto-deducts stock, tracks partial payment & due
- **Customers & Dues** — customer list, running due balance, record payments
- **Suppliers & Purchases** — record purchases, auto-increases stock

No build step required (plain HTML/CSS/JS + Firebase CDN) — easy to deploy anywhere.

## 1. Set up Firebase
1. Go to [console.firebase.google.com](https://console.firebase.google.com) → create a project (or reuse an existing one).
2. **Build → Authentication** → Sign-in method → enable **Email/Password**. Then add yourself as a user under the **Users** tab (this is your login).
3. **Build → Firestore Database** → Create database → start in **production mode**.
4. Go to **Project settings → General → Your apps → Add app (Web)**. Copy the config object.
5. Paste that config into `js/firebase-config.js`, replacing the placeholder values.
6. In Firestore, go to **Rules** tab and paste the contents of `firestore.rules` from this project, then Publish.

## 2. Push to GitHub
```bash
cd hm-traders-pro
git init
git add .
git commit -m "Initial commit — H.M Traders ledger"
git branch -M main
git remote add origin https://github.com/media315/hm-traders-pro.git
git push -u origin main
```
(Create the empty repo first on github.com, or use `gh repo create`.)

## 3. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) → **New Project** → Import the GitHub repo.
2. Framework preset: **Other** (it's static files, no build command needed).
3. Deploy. Every future `git push` to `main` auto-deploys.

## 4. Install as an app
- **On phone (Android/iOS)**: open the deployed link in Chrome/Safari → menu → "Add to Home Screen" / "Install app".
- **On PC**: open in Chrome/Edge → click the install icon in the address bar.

## Notes
- Only you (or anyone you add under Firebase Authentication → Users) can sign in and access the data.
- All data syncs live across every device signed in — add a sale on your phone, see it instantly on your PC.
- To add a staff login later, just add another user under Firebase Authentication.
