# Naga Vignesh — Portfolio

Personal portfolio for **Naga Vignesh Marneni** — Cybersecurity, Network Security, and Penetration Testing.

Pure HTML / CSS / vanilla JS. No build step. AI assistant powered by **Google Gemini** through a Vercel Serverless Function.

---

## Project structure

```
/index.html
/css/
  styles.css         — base + sections
  animations.css     — keyframes + helpers
  chatbot.css        — floating widget styles
/js/
  main.js            — navbar, mobile drawer, magnetic, tilt, form, matrix
  animations.js      — GSAP ScrollTrigger + Typed.js
  chatbot.js         — chat widget logic (calls /api/chat)
  particles-config.js— tsParticles network mesh
/api/
  chat.js            — Vercel serverless: Gemini proxy
/vercel.json         — rewrites + headers
```

The frontend never sees `GEMINI_API_KEY`; the key is read by the serverless function from a Vercel environment variable.

---

## Local preview

Open `index.html` directly in a browser, or serve the folder with any static server:

```bash
# Python
python -m http.server 5500

# Node
npx serve .
```

The chatbot will return an error locally because `/api/chat` only runs in the Vercel environment. To test the bot locally:

```bash
npm i -g vercel
vercel dev
# then open http://localhost:3000
```

---

## Deploy to Vercel (free tier)

### 1. Push to GitHub

If your local repo already points at `Naga-Vignesh/Vignesh-Portifolio`, just commit and push:

```bash
git add .
git commit -m "Rebuild portfolio (HTML/CSS/JS) + Gemini chatbot via Vercel"
git push origin main
```

If not yet a git repo:

```bash
git init
git remote add origin https://github.com/Naga-Vignesh/Vignesh-Portifolio.git
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

### 2. Import the repo into Vercel

1. Go to <https://vercel.com/new>
2. Sign in with GitHub
3. Click **Add New → Project** and select `Vignesh-Portifolio`
4. Framework preset: **Other** (Vercel will auto-detect static + serverless)
5. Build command: leave empty
6. Output directory: leave empty
7. Click **Deploy**

### 3. Add the Gemini API key

1. Get a key at <https://aistudio.google.com/app/apikey>
2. In your Vercel dashboard → the project → **Settings → Environment Variables**
3. Add:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** *paste the key*
   - **Environments:** check **Production**, **Preview**, **Development**
4. Click **Save**
5. Go to **Deployments** → on the latest deployment, click the **⋮** menu → **Redeploy** so the new env var is picked up

### 4. (Optional) Hook up your custom domain `naga-vignesh.me`

1. In the Vercel project → **Settings → Domains**
2. Click **Add** and type `naga-vignesh.me` (and optionally `www.naga-vignesh.me`)
3. Vercel will show DNS records to set at your registrar (an `A` record to `76.76.21.21`, or a `CNAME` to `cname.vercel-dns.com.`)
4. Once DNS propagates, Vercel auto-issues the SSL cert.

> The `CNAME` file in the repo is a leftover from GitHub Pages. Vercel ignores it. You can keep or delete it.

### 5. (Optional) Disable GitHub Pages

If GitHub Pages was previously enabled on this repo:
- GitHub repo → **Settings → Pages → Source: None**

---

## Updating the GitHub remote

If your Git remote still points elsewhere:

```bash
git remote -v                                              # check current remote
git remote set-url origin https://github.com/Naga-Vignesh/Vignesh-Portifolio.git
git push -u origin main
```

---

## Customization quick-refs

| What | Where |
| --- | --- |
| Personal text & data | `index.html` |
| Color tokens | `:root` in `css/styles.css` |
| Hero typing rotation | `js/animations.js` (Typed.js strings) |
| Particles density / colors | `js/particles-config.js` |
| Chatbot system prompt / facts | `SYSTEM_PROMPT` in `api/chat.js` |
| Contact form (Formspree) | `action="https://formspree.io/f/your_form_id"` in `index.html` |

To enable the contact form: create a free form at <https://formspree.io>, copy the form ID, replace `your_form_id` in `index.html`.

---

## Easter egg

Type **`hack`** anywhere on the page (outside an input) to trigger the matrix-rain overlay. Press **Esc** or type `hack` again to dismiss.
