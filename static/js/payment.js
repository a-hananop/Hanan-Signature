/**
 * payment.js — Hanan Signature ✦ Enhanced Edition
 * Checkout modal, gratuity, payment method, order placement, success screen.
 */

"use strict";

const Payment = (() => {

  // ── Open Checkout Modal ───────────────────────────────────────────────────
  function openCheckout() {
    const overlay = document.getElementById("checkoutOverlay");
    const modal   = document.getElementById("checkoutModal");
    if (!overlay || !modal) return;

    const items = Object.values(App.state.cart);
    if (!items.length) return;

    const tot  = Cart.cartTotals();
    const tip  = tot.sub * App.state.checkoutTipPct;
    const grand = tot.sub + tip + tot.tax + tot.service;

    modal.innerHTML = `
      <button class="modal-close" onclick="document.getElementById('checkoutOverlay').classList.remove('open')"
        aria-label="Close checkout">✕</button>

      <div class="modal-header" style="display:block; padding:22px 24px 18px;">
        <div class="modal-title" style="font-size:1.6rem; margin-bottom:4px">Confirm Order ✦</div>
        <div style="color:var(--sand);font-size:.78rem;opacity:.8">
          Hanan Signature · Table ${App.escHtml(App.state.tableNumber || "—")}
        </div>
      </div>

      <div class="co-section">
        <div class="co-section-title">🛒 Your Items</div>
        <div class="co-items-list">
          ${items.map(i => `
            <div class="co-item">
              <span class="co-item-name">${i.emoji} ${App.escHtml(i.name)} ×${i.qty}
                ${i.note ? `<em style="font-size:.65rem;opacity:.6;margin-left:4px">(${App.escHtml(i.note)})</em>` : ""}
              </span>
              <span class="co-item-price">$${(i.price * i.qty).toFixed(2)}</span>
            </div>`).join("")}
        </div>
      </div>

      <div class="co-section">
        <div class="co-section-title">🎁 Gratuity</div>
        <div class="tip-options" id="coTipOpts">
          ${[["None","0"],["10%","0.10"],["15%","0.15"],["20%","0.20"],["25%","0.25"]].map(
            ([label, val]) => `
            <button class="co-tip-btn${parseFloat(val) === App.state.checkoutTipPct ? " active" : ""}"
              data-tip="${val}" onclick="Payment.setCoTip(${val})">${label}</button>`
          ).join("")}
        </div>
      </div>

      <div class="co-section">
        <div class="co-section-title">💳 Payment Method</div>
        <div class="payment-methods">
          ${[["card","💳","Credit / Debit"],["cash","💵","Cash"],["apple","🍎","Apple Pay"],["wallet","📱","Digital Wallet"]].map(
            ([key,icon,label]) => `
            <div class="pm-btn${App.state.paymentMethod === key ? " active" : ""}"
              onclick="Payment.setPayment('${key}', this)" role="button" tabindex="0"
              aria-pressed="${App.state.paymentMethod === key}">
              <div class="pm-icon">${icon}</div>
              <div class="pm-label">${label}</div>
            </div>`
          ).join("")}
        </div>
      </div>

      <div class="co-section">
        <div class="co-section-title">📋 Order Summary</div>
        <div class="co-totals">
          <div class="co-total-row"><span>Subtotal</span><span>$${tot.sub.toFixed(2)}</span></div>
          <div class="co-total-row">
            <span>Gratuity (${Math.round(App.state.checkoutTipPct * 100)}%)</span>
            <span id="coTipAmt">$${tip.toFixed(2)}</span>
          </div>
          <div class="co-total-row"><span>Tax (8.875%)</span><span>$${tot.tax.toFixed(2)}</span></div>
          <div class="co-total-row"><span>Service (12%)</span><span>$${tot.service.toFixed(2)}</span></div>
          <div class="co-total-row grand">
            <span>Total</span>
            <span id="coGrandTotal">$${grand.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div class="co-section" style="padding-bottom:22px">
        <button class="co-place-btn" onclick="Payment.placeOrder()">
          <span>✦ Confirm &amp; Place Order</span>
        </button>
      </div>`;

    overlay.classList.add("open");
  }

  // ── Tip Selection ─────────────────────────────────────────────────────────
  function setCoTip(val) {
    App.state.checkoutTipPct = val;
    App.state.tipPct         = val;

    document.querySelectorAll(".co-tip-btn").forEach(btn => {
      const isActive = parseFloat(btn.getAttribute("data-tip")) === val;
      btn.classList.toggle("active", isActive);
    });

    // Update gratuity label
    const tipLabel = document.querySelector(".co-total-row:nth-child(2) span:first-child");
    if (tipLabel) tipLabel.textContent = `Gratuity (${Math.round(val * 100)}%)`;

    const tot   = Cart.cartTotals();
    const tip   = tot.sub * val;
    const grand = tot.sub + tip + tot.tax + tot.service;

    const tipEl   = document.getElementById("coTipAmt");
    const grandEl = document.getElementById("coGrandTotal");
    if (tipEl) {
      tipEl.style.color = "var(--gold-hi)";
      tipEl.textContent = `$${tip.toFixed(2)}`;
      setTimeout(() => tipEl.style.color = "", 400);
    }
    if (grandEl) {
      grandEl.style.color = "var(--gold-hi)";
      grandEl.textContent = `$${grand.toFixed(2)}`;
      setTimeout(() => grandEl.style.color = "", 400);
    }

    Cart.updateTotalsDisplay();
  }

  // ── Payment Method ────────────────────────────────────────────────────────
  function setPayment(method, clickedEl) {
    App.state.paymentMethod = method;
    document.querySelectorAll(".pm-btn").forEach(b => {
      b.classList.remove("active");
      b.setAttribute("aria-pressed", "false");
    });
    if (clickedEl) {
      clickedEl.classList.add("active");
      clickedEl.setAttribute("aria-pressed", "true");
    }
  }

  // ── Place Order ───────────────────────────────────────────────────────────
  async function placeOrder() {
    if (!Cart.cartCount()) return;

    // Disable button during request
    const placeBtn = document.querySelector(".co-place-btn");
    if (placeBtn) {
      placeBtn.disabled = true;
      placeBtn.querySelector("span").textContent = "⏳ Processing…";
    }

    const payload = {
      cart: App.state.cart,
      tipPct: App.state.checkoutTipPct,
      paymentMethod: App.state.paymentMethod,
      tableNumber: App.state.tableNumber,
    };
    const receiptItems = Object.values(App.state.cart);

    let result;
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      result = await res.json();
    } catch (err) {
      // Offline fallback
      const suffix = Math.random().toString(36).substr(2,6).toUpperCase();
      const sub = Cart.cartSubtotal();
      const tip = sub * App.state.checkoutTipPct;
      const grand = sub + tip + sub * App.TAX_RATE + sub * App.SERVICE_RATE;
      const etaLo = Math.floor(Math.random() * 17 + 22);
      result = {
        success: true,
        orderId: "HS-" + suffix,
        eta: `${etaLo}–${etaLo + 8}`,
        grandTotal: grand,
        points: Math.floor(grand),
        table: App.state.tableNumber,
        timestamp: new Date().toLocaleTimeString("en-US", { hour:"2-digit", minute:"2-digit" }),
      };
    }

    if (!result.success) {
      App.showToast("❌ Order failed. Please try again.", "error");
      if (placeBtn) { placeBtn.disabled = false; placeBtn.querySelector("span").textContent = "✦ Confirm & Place Order"; }
      return;
    }

    document.getElementById("checkoutOverlay")?.classList.remove("open");
    renderSuccessModal(result, receiptItems);

    App.state.orderPlaced = true;
    App.state.cart = {};
    Cart.renderCart();
    Menu.renderMenu();
    App.updateProgress(1);

    // Simulate kitchen progression
    let step = 1;
    const kInterval = setInterval(() => {
      step++;
      App.updateProgress(step);
      if (step >= 3) clearInterval(kInterval);
    }, 9000);

    Chat.addBotMsg(
      `✅ **Order Confirmed! (${result.orderId})**\n\n⏱️ Estimated time: **${result.eta} minutes**\n🍽️ Being prepared with love.\n\nThank you for dining with **Hanan Signature** ✦`,
      []
    );
  }

  // ── Success / Receipt Modal ───────────────────────────────────────────────
  function renderSuccessModal(data, items) {
    const overlay = document.getElementById("successOverlay");
    const modal   = document.getElementById("successModal");
    if (!overlay || !modal) return;

    const payLabel = { card:"Card", cash:"Cash", apple:"Apple Pay", wallet:"Digital Wallet" }[App.state.paymentMethod] || "Cash";
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const tip      = subtotal * App.state.checkoutTipPct;
    const tax      = subtotal * App.TAX_RATE;
    const service  = subtotal * App.SERVICE_RATE;
    const total    = subtotal + tip + tax + service;

    const dateStr = new Date().toLocaleString("en-US", {
      year:"numeric", month:"short", day:"numeric", hour:"2-digit", minute:"2-digit"
    });

    modal.innerHTML = `
      <div class="receipt-paper">
        <div class="receipt-header">
          <div class="receipt-logo">🍽️</div>
          <div class="receipt-brand">HANAN SIGNATURE</div>
          <div class="receipt-info">
            Authentic Pakistani Fine Dining<br>
            128 Spice Lane, Little Pakistan, NY 10013<br>
            Tel: (555) 786-0001
          </div>
        </div>

        <div class="receipt-meta">
          <div><strong>Order#</strong> ${App.escHtml(data.orderId)}</div>
          <div>${dateStr}</div>
          <div><strong>Table:</strong> ${App.escHtml(String(data.table || "N/A"))}</div>
          <div><strong>Server:</strong> Hanan AI</div>
        </div>

        <div class="receipt-divider"></div>

        <div class="receipt-items">
          ${items.map(item => `
            <div class="receipt-item">
              <div class="ri-row">
                <span>${App.escHtml(item.name)}</span>
                <span>$${(item.price * item.qty).toFixed(2)}</span>
              </div>
              <div class="ri-qty">${item.qty} × $${item.price.toFixed(2)}${item.note ? ` · <em>${App.escHtml(item.note)}</em>` : ""}</div>
            </div>`).join("")}
        </div>

        <div class="receipt-divider"></div>

        <div class="receipt-totals">
          <div class="rt-row"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
          <div class="rt-row"><span>Tax (8.875%)</span><span>$${tax.toFixed(2)}</span></div>
          <div class="rt-row"><span>Service (12%)</span><span>$${service.toFixed(2)}</span></div>
          <div class="rt-row"><span>Gratuity (${Math.round(App.state.checkoutTipPct * 100)}%)</span><span>$${tip.toFixed(2)}</span></div>
          <div class="rt-row grand"><span>TOTAL</span><span>$${total.toFixed(2)}</span></div>
        </div>

        <div class="receipt-footer">
          <div class="rf-payment">Paid via: <strong>${payLabel}</strong></div>
          <div class="rf-points">
            ⭐ Loyalty Points Earned: <strong>+${data.points} pts</strong>
          </div>
          <div class="rf-barcode">||| | ||| | |||| | || ||| | |||</div>
          <div class="rf-thankyou">Shukriya! Come back soon ♥</div>
        </div>

        <button class="receipt-close-btn" onclick="Payment.closeSuccess()">
          Close Receipt
        </button>
      </div>`;

    overlay.classList.add("open");
  }

  function closeSuccess() {
    document.getElementById("successOverlay")?.classList.remove("open");
  }

  return { openCheckout, setCoTip, setPayment, placeOrder, closeSuccess };

})();