/**
 * cart.js — Hanan Signature ✦
 * Cart state, mutations, and rich UI rendering.
 */
"use strict";

const Cart = (() => {

  // ── Calculations ──────────────────────────────────────────────────────
  function cartSubtotal() {
    return Object.values(App.state.cart).reduce(function (s, v) { return s + v.price * v.qty; }, 0);
  }
  function cartCount() {
    return Object.values(App.state.cart).reduce(function (s, v) { return s + v.qty; }, 0);
  }
  function cartTotals() {
    var sub     = cartSubtotal();
    var tip     = sub * App.state.tipPct;
    var tax     = sub * App.TAX_RATE;
    var service = sub * App.SERVICE_RATE;
    return { sub: sub, tip: tip, tax: tax, service: service, total: sub + tip + tax + service };
  }

  // ── Mutations ─────────────────────────────────────────────────────────
  function addToCart(id, qty, note) {
    qty  = qty  || 1;
    note = note || "";
    var item = Menu.ALL_ITEMS[id];
    if (!item) return;
    var isNew = !App.state.cart[id];
    if (App.state.cart[id]) {
      App.state.cart[id].qty += qty;
    } else {
      App.state.cart[id] = Object.assign({}, item, { qty: qty, note: note });
    }
    renderCart();
    Menu.renderMenu();

    var badge = document.getElementById("cartBadge");
    if (badge) { badge.classList.remove("bump"); void badge.offsetWidth; badge.classList.add("bump"); }

    var msg = isNew
      ? ("✅ " + item.emoji + " " + item.name + " added to order!")
      : ("✅ " + item.emoji + " " + item.name + " ×" + App.state.cart[id].qty + " in cart");
    App.showToast(msg, "success");
    App.updateProgress(1);
  }

  function removeFromCart(id) {
    var entry = App.state.cart[id];
    if (!entry) return;
    var el = document.getElementById("citem-" + id);
    function doRemove() {
      delete App.state.cart[id];
      renderCart();
      Menu.renderMenu();
    }
    if (el) {
      el.style.transition = "all 0.28s cubic-bezier(.4,0,.2,1)";
      el.style.opacity    = "0";
      el.style.transform  = "translateX(40px) scale(0.88)";
      el.style.maxHeight  = el.offsetHeight + "px";
      requestAnimationFrame(function () {
        el.style.maxHeight  = "0";
        el.style.padding    = "0";
        el.style.marginBottom = "0";
        el.style.overflow   = "hidden";
      });
      setTimeout(doRemove, 290);
    } else {
      doRemove();
    }
    App.showToast("🗑️ " + entry.name + " removed.");
    if (!cartCount()) App.updateProgress(0);
  }

  function changeQty(id, delta) {
    if (!App.state.cart[id]) return;
    App.state.cart[id].qty += delta;
    if (App.state.cart[id].qty <= 0) {
      removeFromCart(id);
    } else {
      var priceEl = document.querySelector("#citem-" + id + " .cart-item-price");
      if (priceEl) {
        priceEl.style.transform = "scale(1.3)";
        priceEl.style.color     = "var(--gold-hi)";
        setTimeout(function () {
          priceEl.style.transition = "all 0.3s var(--ease-spring)";
          priceEl.style.transform  = "scale(1)";
          priceEl.style.color      = "";
        }, 10);
      }
      renderCart();
      Menu.renderMenu();
    }
  }

  function clearCart() {
    App.state.cart        = {};
    App.state.orderPlaced = false;
    App.updateProgress(0);
    renderCart();
    Menu.renderMenu();
    App.showToast("🗑️ Order cleared.");
  }

  // ── Empty state element ───────────────────────────────────────────────
  function getEmptyEl() {
    var el = document.getElementById("cartEmpty");
    if (!el) {
      el = document.createElement("div");
      el.id        = "cartEmpty";
      el.className = "cart-empty";
      el.innerHTML =
        "<div class='cart-empty-icon' aria-hidden='true'>🍽️</div>" +
        "<p>Your table is empty</p>" +
        "<small>Browse our authentic Pakistani menu<br>and add your favourite dishes!</small>";
    }
    return el;
  }

  // ── Render ────────────────────────────────────────────────────────────
  function renderCart() {
    var items    = Object.values(App.state.cart);
    var cartEl   = document.getElementById("cartItems");
    var footerEl = document.getElementById("cartFooter");
    var badgeEl  = document.getElementById("cartBadge");
    var btnEl    = document.getElementById("checkoutBtn");
    var count    = cartCount();

    if (badgeEl) badgeEl.textContent = count;
    if (btnEl)   btnEl.disabled = (count === 0);

    // Always update mobile badge
    App.updateMobCartBadge();

    // Detach empty el before clearing innerHTML
    var emptyEl = getEmptyEl();
    if (emptyEl.parentNode) emptyEl.parentNode.removeChild(emptyEl);

    if (!items.length) {
      if (footerEl) footerEl.style.display = "none";
      if (cartEl)   cartEl.innerHTML = "";
      emptyEl.style.display = "flex";
      if (cartEl)   cartEl.appendChild(emptyEl);
      updateTotalsDisplay();
      return;
    }

    if (footerEl) footerEl.style.display = "block";

    if (cartEl) {
      var html = "";
      items.forEach(function (item) {
        var noteHtml = item.note
          ? "<div class='cart-item-note'>📝 " + App.escHtml(item.note) + "</div>"
          : "";
        html +=
          "<div class='cart-item' id='citem-" + item.id + "'>" +
          "<div class='cart-item-top'>" +
          "<span class='cart-item-emoji'>" + item.emoji + "</span>" +
          "<span class='cart-item-name'>" + App.escHtml(item.name) + "</span>" +
          "<button class='cart-item-remove' onclick=\"Cart.removeFromCart('" + item.id + "')\"" +
          " title='Remove' aria-label='Remove " + App.escHtml(item.name) + "'>✕</button>" +
          "</div>" +
          "<div class='cart-item-bottom'>" +
          "<div class='qty-ctrl'>" +
          "<button class='qty-btn' onclick=\"Cart.changeQty('" + item.id + "',-1)\" aria-label='Decrease'>−</button>" +
          "<span class='qty-num'>" + item.qty + "</span>" +
          "<button class='qty-btn' onclick=\"Cart.changeQty('" + item.id + "',1)\" aria-label='Increase'>+</button>" +
          "</div>" +
          "<span class='cart-item-price'>$" + (item.price * item.qty).toFixed(2) + "</span>" +
          "</div>" +
          noteHtml +
          "</div>";
      });
      cartEl.innerHTML = html;
    }

    emptyEl.style.display = "none";
    if (cartEl) cartEl.appendChild(emptyEl);

    updateTotalsDisplay();
  }

  function updateTotalsDisplay() {
    var t = cartTotals();
    function fmt(n) { return "$" + n.toFixed(2); }
    function set(id, val) {
      var el = document.getElementById(id);
      if (!el) return;
      if (el.textContent !== val) {
        el.style.transition = "color 0.25s";
        el.style.color = "var(--gold-hi)";
        el.textContent = val;
        setTimeout(function () { el.style.color = ""; }, 300);
      }
    }
    set("subtotalCell", fmt(t.sub));
    set("tipCell",      fmt(t.tip));
    set("taxCell",      fmt(t.tax));
    set("serviceCell",  fmt(t.service));
    set("totalCell",    fmt(t.total));
  }

  return {
    cartSubtotal, cartCount, cartTotals,
    addToCart, removeFromCart, changeQty, clearCart,
    renderCart, updateTotalsDisplay,
  };

})();
