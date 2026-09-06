# 🍽️ Hanan Signature — Restaurant Ordering Chatbot

A full-featured, cinematic luxury restaurant ordering chatbot with advanced NLP,
voice I/O, animated UI, and a complete payment slip flow.

## 📂 Project Structure

```
restaurant-bot/
├── app.py              # Flask application + all API routes
├── nlp_engine.py       # Advanced NLP: intent detection, entity extraction, fuzzy matching
├── menu_data.py        # Full menu data (35+ dishes, allergens, calories, ratings)
├── requirements.txt
├── templates/
│   └── index.html      # Main HTML (cinematic Velvet Noir design)
└── static/
    ├── css/
    │   ├── main.css        # Design system, layout, variables
    │   ├── animations.css  # All keyframes & transitions
    │   └── components.css  # UI component styles
    └── js/
        ├── main.js         # App init, cursor, canvas particles, toast
        ├── chat.js         # Chat engine & message rendering
        ├── menu.js         # Menu browsing, search, item modal
        ├── cart.js         # Cart CRUD & order tracking
        ├── voice.js        # Web Speech API (input + TTS output)
        └── payment.js      # Payment flow, tip, split, receipt
```

## 🚀 Quick Start

```bash
pip install flask
python app.py
# Open http://localhost:5000
```

## ✨ Features

### 🤖 Advanced NLP
- Intent detection with keyword scoring (30+ intents)
- Entity extraction: item names, quantities ("add 2 truffle arancini")
- Fuzzy matching: finds items even with typos
- Context-aware conversation
- Multi-item orders in one message

### 🎤 Voice I/O
- **Voice Input**: Click mic or press voice button → speak your order
- **Text-to-Speech**: Bot responses are read aloud
- Real-time transcript display with waveform animation
- Supports all languages (en-US default)

### 🍽️ Menu
- 35+ dishes across 5 categories (Chef's Specials, Starters, Mains, Desserts, Drinks)
- Allergen info, calories, prep time, star ratings
- Live search across all dishes
- Dietary filters (Vegetarian, Gluten-Free, Popular)
- Happy Hour pricing (drinks -20% from 5–7 PM)
- Item detail modal with special instructions

### 🛒 Cart
- Add/remove/update quantities
- Per-item special instructions
- Real-time subtotal, tax (8.875%), service charge (12%)
- Table number selection
- Order progress tracker (Placed → Preparing → Ready → Served)

### 💳 Payment Slip
- Tip selection (0%, 15%, 18%, 20%, custom amount)
- Bill splitting (2–6 people) with per-person amount
- Payment method (Credit Card, Apple Pay, Google Pay, Cash)
- Grand total display
- Beautiful printable receipt with:
  - Itemized breakdown
  - All tax/service/tip lines
  - Transaction ID & timestamp
  - QR code
  - Loyalty points earned
  - Print & Email buttons

### 💎 Loyalty Program
- Earn 1 point per $1 spent
- Bronze / Silver / Gold tiers
- Points displayed in header

### 🎨 Design
- **Velvet Noir** aesthetic: deep obsidian + 24k gold + burgundy
- Custom animated cursor
- Canvas particle field
- Floating ambient orbs
- Film grain texture overlay
- Cinematic intro sequence (curtain reveal)
- Smooth spring animations on all interactions
- Toast notification system
- Ripple effects on all buttons
## Dish photos and interactive view

Clicking any menu card opens the centered Dish Studio. It supports mouse/touch drag to tilt the presentation, wheel/touch zoom, keyboard arrow rotation, and the existing order controls.

The repository includes real dish photographs in `static/images/dishes/`. Each photo is matched to its menu item by the dish name, for example:

```text
static/images/dishes/Chicken Karahi.jpg
static/images/dishes/Mutton Dum Biryani.jpg
static/images/dishes/Chicken Tikka.jpg
```

The menu cards, Dish Studio, cart, and checkout automatically load the matching photo. If a photo is missing, the image area stays unobtrusive instead of breaking the layout. For best results use a sharp square image (at least 1200×1200), overhead or 45-degree angle, consistent warm lighting, and a clean background.

The current browser effect is a lightweight 3D-style presentation around a real photo. For true rotatable 3D, capture or model each dish as a textured `.glb`/`.gltf`: Polycam can export photogrammetry captures as GLTF and other formats, while Blender is useful for cleaning, retopology, materials, lighting, and final rendering. The web viewer should then use Google's `<model-viewer>` component with `camera-controls` and the GLB file.
