# 🎲 Monopoly: The Mega Edition (Full-Stack 3D Web Game)

> A 100% free, real-time digital adaptation of **Monopoly: The Mega Edition** built with Next.js 14, Tailwind CSS, Framer Motion, and Web Audio API. 
> Designed for **Jackbox-style local multiplayer**: the host screen (TV / Laptop) displays the full 52-space deluxe animated board, while up to 4 players join seamlessly on their mobile phone browsers.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
![GitHub repo](https://img.shields.io/badge/GitHub-hunainnoman%2Fmonopoly--mega--edition-red)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## 🌟 Official Mega Edition Rules & Features

- **52 Spaces**: Complete board layout with all 8 new Mega Edition streets (South Temple, West Temple, North Temple, California Ave, Florida Ave, Nicollet Ave, Decatur St, Maryland Ave) plus Gas Company and Auction spaces.
- **The Speed Die**: 2 standard white dice + 1 cobalt blue Speed Die ($1, 2, 3$, Bus 🚌, and Mr. Monopoly 🎩) with tumbling 3D dice physics and sound effects.
- **Bus Tickets & Expiration**: Draw and strategically play Bus Tickets to ride along board sides. Watch out for the "ALL TICKETS EXPIRE!" card.
- **Majority Monopolies & Skyscrapers**: Build up to 4 Houses, Hotels, and massive Skyscrapers on complete color groups.
- **Train Depots**: Double railroad rent by erecting industrial depots on your transit hubs.
- **Emergency Liquidity & Mortgaging**: Mortgage properties directly from your mobile wallet for 50% cash liquidity or unmortgage with 10% interest.
- **Real-time Live Auctions**: Bid in real-time with responsive mobile paddles, accompanied by a 3D swinging wooden auction gavel and live shockwaves on the TV screen.

---

## 🎬 AAA Animation Systems

1. **🏃‍♂️ Step-by-Step Pawn Hopping**: Tokens physically hop tile-by-tile around the track with squashing floor shadows and synchronized acoustic wooden tap clicks (`audio.playTokenHop()`).
2. **🃏 3D Card Draw & Flip**: Chance and Community Chest cards trigger an animated 3D card draw with 180° perspective flip (`rotateY: 180deg`) and gold metallic sheen.
3. **💸 Floating Rent Transfer & Cash Particles**: Automatic reactive float badges (`+$200` emerald / `-$150` crimson) with coin chimes whenever money changes hands.
4. **🏗️ 3D Building Drop-In Physics**: Houses, Hotels, Skyscrapers, and Depots fall from above with landing squash-and-stretch (`scaleY: [0.2, 1.35, 0.85, 1]`) and ground impact rings. Skyscrapers project a vertical spotlight beam!
5. **🔒 Iron Jail Bars Slam-Down**: Heavy vertical steel bars slam shut with screen shake, padlock lock sound, and arrest warrant banner.
6. **🔨 3D Auction Gavel Strike**: An animated 3D wooden gavel strikes the oak sound block on every new bid with shockwave ripples and live leader paddle popups.
7. **🔦 Active Turn Spotlight**: The active player's tile radiates a golden pedestal aura across the TV board.

---

## 🛡️ Security Password Gate

- **Single Password Field**: Clean security access gate protecting host and player routes.
- **3-Strike Brute-Force Lockout**: 3 consecutive incorrect attempts trigger a strict **30-minute lockout** with a live real-time countdown timer.
- **Configurable Environment**: Managed securely via `GAME_PASSWORD` in `.env.local` or Vercel dashboard.

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/hunainnoman/monopoly-mega-edition.git
cd monopoly-mega-edition
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Set your desired game password:

```env
GAME_PASSWORD=monopoly123
```

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000):
- **Host**: Visit `/host` to launch the host board on your laptop or TV.
- **Players**: Scan the on-screen QR code or visit `/play` on mobile phones to join with up to 4 players.

---

## ☁️ Deployment on Vercel

Deploy effortlessly with the Vercel CLI:

```bash
npm install -g vercel
vercel --prod
```

Make sure to set the `GAME_PASSWORD` environment variable in your Vercel Project Settings $\rightarrow$ Environment Variables.

---

## 📜 Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS 3.4
- **Animations**: Framer Motion
- **Visuals**: Precision Isometric 3D SVGs & Canvas Confetti
- **Audio**: Web Audio API (zero external audio file dependencies)
- **Networking**: In-App Realtime Game Engine & WebRTC
