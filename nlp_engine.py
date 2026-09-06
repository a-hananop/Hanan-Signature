"""
nlp_engine.py — Hanan Signature Server-Side NLP Engine
Provides intent detection and response generation for the chat assistant.
Primary NLP also runs client-side (chat.js); this module handles API calls.
"""

import re
import random
import string
from menu_data import MENU, ALL_ITEMS, CATEGORY_LABELS


# ── Intent Patterns ──────────────────────────────────────────────────────────
INTENTS = {
    "greet":       r"^(hi|hello|hey|salam|assalam|good (morning|evening|afternoon)|howdy)",
    "bye":         r"(bye|goodbye|khuda hafiz|allah hafiz|that'?s all|done|nothing else|see you)",
    "thanks":      r"(thank|shukriya|shukria|appreciate|great job|well done|perfect|love it|amazing)",
    "menu":        r"(menu|what.*have|what.*serve|show.*food|browse|see.*menu|all dishes)",
    "specials":    r"(special|chef|signature|featured|today.?s|exclusive)",
    "starters":    r"(starter|appetizer|snack|chaat|tikka|samosa|kebab|seekh|bun kebab|appetiser)",
    "mains":       r"(main|karahi|biryani|nihari|haleem|handi|gosht|curry|daal|dal|lunch|dinner)",
    "desserts":    r"(dessert|sweet|mithai|gulab|kheer|halwa|rasmalai|shahi|kulfi|zarda|after meal)",
    "drinks":      r"(drink|beverage|lassi|chai|tea|juice|water|sharbat|rooh afza|doodh patti|jaljeera)",
    "popular":     r"(popular|best|favourite|recommend|must.?try|most ordered|top dish)",
    "vegetarian":  r"(vegetarian|vegan|no meat|meatless|sabzi|veggie|plant.?based)",
    "spicy":       r"(spicy|hot|mirchi|tez|mild|not.*spicy|medium heat)",
    "gluten_free": r"(gluten.?free|no gluten|wheat.?free)",
    "halal":       r"(halal|haram|pork|alcohol|zabihah|certified)",
    "cart":        r"(cart|basket|my order|what.*ordered|current order|ordered so far)",
    "clear":       r"(clear.*cart|empty.*cart|start over|restart.*order|remove all|new order)",
    "checkout":    r"(checkout|pay|payment|bill|check please|settle|place order|confirm|total)",
    "hours":       r"(hours|open|close|when|timing|schedule|days)",
    "location":    r"(location|address|where.*you|directions|near|find you)",
    "reservation": r"(reserv|booking|book.*table)",
    "price":       r"(price|cost|how much|cheap|expensive|afford|budget)",
    "loyalty":     r"(loyalty|points|rewards|member|tier|status|bronze|silver|gold)",
}


def detect_intents(message: str) -> list[str]:
    """Return list of matched intent keys for the given message."""
    msg = message.lower()
    return [key for key, pattern in INTENTS.items() if re.search(pattern, msg, re.IGNORECASE)]


def find_menu_items(message: str) -> list[dict]:
    """Fuzzy-match menu items from a natural-language message."""
    msg = message.lower()
    found = {}
    for item in ALL_ITEMS.values():
        name_lower = item["name"].lower()
        if name_lower in msg:
            found[item["id"]] = item
            continue
        words = [w for w in re.split(r"\W+", name_lower) if len(w) > 3]
        if words:
            match_count = sum(1 for w in words if w in msg)
            threshold  = max(1, len(words) * 0.6)
            if match_count >= threshold:
                found[item["id"]] = item
    return list(found.values())


def extract_quantity(message: str) -> int:
    """Parse quantity words or digits from a natural-language message."""
    word_map = {
        "one": 1, "a": 1, "an": 1, "two": 2, "three": 3, "four": 4,
        "five": 5, "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
        "do": 2, "teen": 3, "char": 4, "ek": 1,
    }
    # Digit before food keyword
    m = re.search(
        r"(\d+)\s+(?:\w+\s+){0,3}"
        r"(?:chicken|mutton|lamb|biryani|karahi|tikka|samosa|kebab|lassi|chai|haleem|nihari)",
        message, re.IGNORECASE
    )
    if m:
        return int(m.group(1))
    for word, num in word_map.items():
        if re.search(rf"\b{word}\b", message, re.IGNORECASE):
            return num
    return 1


def generate_order_id() -> str:
    """Generate a unique order reference like HS-A4K7B2."""
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"HS-{suffix}"


def build_response(message: str, cart: dict | None = None) -> dict:
    """
    Build an NLP response dict for the given customer message.
    Returns: { text, replies, action?, cat? }
    cart is optional server-side cart state; client manages cart directly.
    """
    intents    = detect_intents(message)
    found_items = find_menu_items(message)
    is_add     = bool(re.search(
        r"\b(add|order|want|i'?d like|can i have|give me|bring me|get me|i want|please|ek|do|two|one|three|four)\b",
        message, re.IGNORECASE
    ))

    # ── Greet ──────────────────────────────────────────────────────────────
    if "greet" in intents and not found_items:
        return {
            "text": (
                "Welcome to **Hanan Signature** 🌸\n\n"
                "I'm your personal dining assistant. I can help you:\n\n"
                "• 📋 **Browse** our full Pakistani menu\n"
                "• ✨ **Discover** today's Chef's Signatures\n"
                "• 🛒 **Place** your order\n"
                "• 💳 **Checkout** seamlessly\n\n"
                "How may I serve you today?"
            ),
            "replies": ["Chef's Signatures", "What's popular?", "Show full menu", "Is everything Halal?"]
        }

    # ── Bye ────────────────────────────────────────────────────────────────
    if "bye" in intents:
        return {
            "text": (
                "Khuda Hafiz! 🙏 Thank you for dining with **Hanan Signature**.\n\n"
                "_Shukriya aur khush rahein!_ 🌸\n\n"
                "We hope to see you very soon."
            ),
            "replies": ["Start a new order"]
        }

    # ── Thanks ─────────────────────────────────────────────────────────────
    if "thanks" in intents and not found_items:
        return {
            "text": "Shukriya! 🙏 It's our pleasure.\n\nIs there anything else I can help you with?",
            "replies": ["Show menu", "View my cart", "That's all, thanks"]
        }

    # ── Halal ──────────────────────────────────────────────────────────────
    if "halal" in intents:
        return {
            "text": (
                "✅ **100% Halal Certified**\n\n"
                "Every single dish at Hanan Signature is prepared with:\n\n"
                "• Halal-certified meat from approved suppliers\n"
                "• **No pork** products of any kind\n"
                "• **No alcohol** in cooking or marinades\n"
                "• Strict halal kitchen protocols\n\n"
                "You can dine with complete confidence."
            ),
            "replies": ["Show menu", "Chef's Signatures"]
        }

    # ── Item Found ─────────────────────────────────────────────────────────
    if found_items and is_add:
        item = found_items[0]
        qty  = extract_quantity(message)
        extra = ""
        if len(found_items) > 1:
            extras = ", ".join(f"**{i['name']}**" for i in found_items[1:3])
            extra  = f"\n\nI also found: {extras}. Want those too?"
        return {
            "text": (
                f"Adding **{item['emoji']} {item['name']}** × {qty} to your order! 🎉{extra}\n\n"
                f"_${item['price'] * qty:.2f}_"
            ),
            "replies": ["View cart", "Continue browsing", "Checkout"],
            "action": "add_item",
            "item_id": item["id"],
            "quantity": qty
        }

    # ── Category Intents ───────────────────────────────────────────────────
    if "specials" in intents:
        return {
            "text": "Here are our **Chef's Signatures** ✨\n\nToday's highlights:",
            "replies": ["Add Hanan Dum Biryani", "Add Royal Nihari", "Add Signature Karahi", "See all specials"],
            "action": "show_cat", "cat": "specials"
        }
    if "starters" in intents:
        return {
            "text": "Explore our **Starters & Snacks** 🥙\n\nPerfect for sharing or starting your meal.",
            "replies": ["Add Chicken Tikka", "Add Seekh Kebab", "Add Crispy Samosa", "Add Papri Chaat"],
            "action": "show_cat", "cat": "starters"
        }
    if "mains" in intents:
        return {
            "text": "Our **Main Course** 🍛 is the heart of Pakistani cuisine.\n\nSlow-cooked, richly spiced & absolutely satisfying.",
            "replies": ["Add Chicken Karahi", "Add Haleem", "Add Mutton Biryani", "Add Dal Makhani"],
            "action": "show_cat", "cat": "mains"
        }
    if "desserts" in intents:
        return {
            "text": "Indulge in our **Desserts & Mithai** 🍮\n\nAuthentic Pakistani sweets to end your meal perfectly.",
            "replies": ["Add Gulab Jamun", "Add Rasmalai", "Add Kheer", "Add Gajar Halwa"],
            "action": "show_cat", "cat": "desserts"
        }
    if "drinks" in intents:
        return {
            "text": "Quench your thirst with our **Drinks & Beverages** 🥤\n\nFrom creamy lassi to aromatic Pakistani chai.",
            "replies": ["Add Mango Lassi", "Add Kashmiri Chai", "Add Doodh Patti Chai", "Add Jaljeera"],
            "action": "show_cat", "cat": "drinks"
        }

    # ── Popular ────────────────────────────────────────────────────────────
    if "popular" in intents:
        pops = sorted(
            [i for i in ALL_ITEMS.values() if "popular" in i["tags"]],
            key=lambda x: x["votes"], reverse=True
        )[:5]
        lines = "\n".join(
            f"{i['emoji']} **{i['name']}** — ${i['price']:.2f} · ⭐{i['rating']}" for i in pops
        )
        return {
            "text": f"⭐ **Most Popular Dishes:**\n\n{lines}\n\nAll-time customer favourites!",
            "replies": ["Add Chicken Karahi", "Add Mango Lassi", "Show full menu"]
        }

    # ── Vegetarian ─────────────────────────────────────────────────────────
    if "vegetarian" in intents:
        vegs = [i for i in ALL_ITEMS.values() if "vegetarian" in i["tags"]]
        lines = "\n".join(f"{i['emoji']} **{i['name']}** — ${i['price']:.2f}" for i in vegs)
        return {
            "text": f"🌿 **Vegetarian Options** ({len(vegs)} dishes)\n\n{lines}\n\nAll prepared in our dedicated vegetarian section.",
            "replies": ["Add Dal Makhani", "Add Saag Paneer", "Add Rasmalai"]
        }

    # ── Gluten-Free ────────────────────────────────────────────────────────
    if "gluten_free" in intents:
        gf = [i for i in ALL_ITEMS.values() if "gluten-free" in i["tags"]]
        lines = "\n".join(f"{i['emoji']} **{i['name']}** — ${i['price']:.2f}" for i in gf)
        return {
            "text": f"🌾 **Gluten-Free Options** ({len(gf)} dishes)\n\n{lines}",
            "replies": ["Add Chicken Tikka", "Show full menu"]
        }

    # ── Spicy ──────────────────────────────────────────────────────────────
    if "spicy" in intents:
        spicy = [i for i in ALL_ITEMS.values() if "spicy" in i["tags"]]
        lines = "\n".join(f"{i['emoji']} **{i['name']}**" for i in spicy)
        return {
            "text": f"🌶️ **Spicy Dishes:**\n\n{lines}\n\n_All spice levels can be adjusted on request!_",
            "replies": ["Show full menu", "Vegetarian options"]
        }

    # ── Hours ──────────────────────────────────────────────────────────────
    if "hours" in intents:
        return {
            "text": (
                "🕐 **Opening Hours:**\n\n"
                "📅 Mon–Thu: 12:00 PM – 10:30 PM\n"
                "📅 Fri–Sat: 12:00 PM – 12:00 AM\n"
                "📅 Sunday: 1:00 PM – 10:00 PM\n\n"
                "_Kitchen closes 45 min before closing._"
            ),
            "replies": ["Make a reservation", "Get directions"]
        }

    # ── Location ───────────────────────────────────────────────────────────
    if "location" in intents:
        return {
            "text": (
                "📍 **Find Us:**\n\n"
                "🏠 128 Spice Lane, Little Pakistan\nNew York, NY 10013\n\n"
                "📞 (555) 786-0001\n"
                "✉️ dine@hanansignature.com\n\n"
                "🚇 Nearest subway: Canal St (6/J/Z)\n"
                "🅿️ Street parking available"
            ),
            "replies": ["Opening hours", "Make a reservation"]
        }

    # ── Reservation ────────────────────────────────────────────────────────
    if "reservation" in intents:
        return {
            "text": (
                "📅 **Reservations:**\n\n"
                "📞 **(555) 786-0001**\n"
                "✉️ dine@hanansignature.com\n"
                "🌐 www.hanansignature.com/book\n\n"
                "Book 48 hrs ahead for weekends.\n"
                "Private dining available for groups of 8+."
            ),
            "replies": ["Opening hours", "Show menu"]
        }

    # ── Loyalty ────────────────────────────────────────────────────────────
    if "loyalty" in intents:
        return {
            "text": (
                "⭐ **Hanan Signature Rewards**\n\n"
                "Earn **1 point per $1** spent:\n\n"
                "🥉 **Bronze** — 0–499 pts (welcome tier)\n"
                "🥈 **Silver** — 500–999 pts (free naan + priority seating)\n"
                "🥇 **Gold** — 1000+ pts (chef's table + complimentary dessert)\n\n"
                "Ask our staff to enroll today!"
            ),
            "replies": ["Show menu", "Make a reservation"]
        }

    # ── Price ──────────────────────────────────────────────────────────────
    if "price" in intents:
        return {
            "text": (
                "💰 **Price Guide:**\n\n"
                "✨ Chef's Signatures: $24–$28\n"
                "🥙 Starters & Snacks: $9.99–$15.99\n"
                "🍛 Main Course: $14.99–$24.99\n"
                "🍮 Desserts & Mithai: $8.99–$11.99\n"
                "🥤 Drinks: $4.99–$6.99\n\n"
                "_Plus tax & service charge._"
            ),
            "replies": ["Show full menu", "Chef's Signatures"]
        }

    # ── Menu ───────────────────────────────────────────────────────────────
    if "menu" in intents:
        return {
            "text": "Welcome to **Hanan Signature's** full menu! 🍽️\n\nWhat would you like to explore?",
            "replies": ["Chef's Signatures", "Starters & Snacks", "Main Course", "Desserts & Mithai", "Drinks"]
        }

    # ── Fallback ───────────────────────────────────────────────────────────
    return {
        "text": (
            "I'm here to help! 😊 Try:\n\n"
            "• 📋 **\"Show me the menu\"**\n"
            "• ⭐ **\"What's popular?\"**\n"
            "• ➕ **\"Add 2 chicken karahi\"**\n"
            "• 🛒 **\"View my cart\"**\n"
            "• 💳 **\"Checkout please\"**\n"
            "• 📍 **\"Where are you located?\"**"
        ),
        "replies": ["Show menu", "What's popular?", "View cart", "Opening hours"]
    }