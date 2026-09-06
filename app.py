"""
app.py — Hanan Signature Flask Application
Authentic Pakistani Fine Dining — Ordering & Chat System
"""

import random
import string
from datetime import datetime

from flask import Flask, jsonify, render_template, request

from menu_data import ALL_ITEMS, MENU, SERVICE_RATE, TAX_RATE
from nlp_engine import build_response, generate_order_id

app = Flask(__name__)
app.config["JSON_SORT_KEYS"] = False


# ── In-memory order log (replace with DB in production) ──────────────────────
ORDER_LOG: list[dict] = []


# ── Routes ───────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    """Serve the main dining interface."""
    return render_template("index.html")


# ── Menu API ─────────────────────────────────────────────────────────────────

@app.route("/api/menu", methods=["GET"])
def get_menu():
    """Return the full structured menu as JSON."""
    return jsonify({"success": True, "menu": MENU})


@app.route("/api/menu/<category>", methods=["GET"])
def get_category(category: str):
    """Return items for a specific category."""
    if category not in MENU:
        return jsonify({"success": False, "error": f"Category '{category}' not found."}), 404
    return jsonify({"success": True, "category": category, "items": MENU[category]})


@app.route("/api/item/<item_id>", methods=["GET"])
def get_item(item_id: str):
    """Return a single menu item by ID."""
    item = ALL_ITEMS.get(item_id)
    if not item:
        return jsonify({"success": False, "error": "Item not found."}), 404
    return jsonify({"success": True, "item": item})


# ── NLP / Chat API ────────────────────────────────────────────────────────────

@app.route("/api/chat", methods=["POST"])
def chat():
    """
    Process a natural-language customer message.
    Body JSON: { "message": str, "cart": dict }
    Returns: { success, text, replies, action?, cat?, item_id?, quantity? }
    """
    data = request.get_json(silent=True) or {}
    message = (data.get("message") or "").strip()
    cart    = data.get("cart", {})

    if not message:
        return jsonify({"success": False, "error": "Message is required."}), 400

    response = build_response(message, cart)
    response["success"] = True
    return jsonify(response)


# ── Order API ─────────────────────────────────────────────────────────────────

@app.route("/api/order", methods=["POST"])
def place_order():
    """
    Submit a confirmed order.
    Body JSON: { cart, tipPct, paymentMethod, tableNumber }
    Returns:   { success, orderId, eta, grandTotal, points, timestamp }
    """
    data   = request.get_json(silent=True) or {}
    cart   = data.get("cart", {})
    tip_pct  = float(data.get("tipPct", 0.15))
    payment  = data.get("paymentMethod", "card")
    table    = data.get("tableNumber", "—")

    if not cart:
        return jsonify({"success": False, "error": "Cart is empty."}), 400

    # Validate & compute totals
    subtotal = 0.0
    line_items = []
    for item_id, entry in cart.items():
        item = ALL_ITEMS.get(item_id)
        if not item:
            continue
        qty  = int(entry.get("qty", 1))
        line = item["price"] * qty
        subtotal += line
        line_items.append({
            "id":    item_id,
            "name":  item["name"],
            "emoji": item["emoji"],
            "qty":   qty,
            "price": item["price"],
            "total": round(line, 2),
            "note":  entry.get("note", "")
        })

    tip      = round(subtotal * tip_pct, 2)
    tax      = round(subtotal * TAX_RATE, 2)
    service  = round(subtotal * SERVICE_RATE, 2)
    grand    = round(subtotal + tip + tax + service, 2)
    points   = int(grand)
    order_id = generate_order_id()
    eta_lo   = random.randint(22, 38)
    eta_hi   = eta_lo + random.randint(5, 10)
    ts       = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    record = {
        "orderId":       order_id,
        "table":         table,
        "items":         line_items,
        "subtotal":      round(subtotal, 2),
        "tip":           tip,
        "tax":           tax,
        "service":       service,
        "grandTotal":    grand,
        "tipPct":        tip_pct,
        "paymentMethod": payment,
        "loyaltyPoints": points,
        "eta":           f"{eta_lo}–{eta_hi}",
        "timestamp":     ts,
        "status":        "received"
    }
    ORDER_LOG.append(record)

    return jsonify({
        "success":     True,
        "orderId":     order_id,
        "eta":         f"{eta_lo}–{eta_hi}",
        "grandTotal":  grand,
        "points":      points,
        "timestamp":   ts,
        "table":       table
    })


@app.route("/api/orders", methods=["GET"])
def list_orders():
    """Return all orders (admin / kitchen view)."""
    return jsonify({"success": True, "orders": ORDER_LOG})


# ── Health Check ──────────────────────────────────────────────────────────────

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status":    "ok",
        "service":   "Hanan Signature API",
        "timestamp": datetime.now().isoformat()
    })


# ── Entry Point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import os

    # Collect only OUR project files to watch — never site-packages
    project_dir = os.path.dirname(os.path.abspath(__file__))
    extra_files = []
    for root, dirs, files in os.walk(project_dir):
        dirs[:] = [d for d in dirs if d not in (
            "__pycache__", ".git", "node_modules", "venv", ".venv", "env", "site-packages"
        )]
        for f in files:
            if f.endswith((".py", ".html", ".css", ".js")):
                extra_files.append(os.path.join(root, f))

    app.run(
        debug=True,
        host="0.0.0.0",
        port=5000,
        use_reloader=True,
        reloader_type="stat",     # stat poller: only checks our listed files, no fs watchers
        extra_files=extra_files,  # only reload when OUR files change
    )