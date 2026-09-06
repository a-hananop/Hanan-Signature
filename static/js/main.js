/**
 * main.js — Hanan Signature ✦
 * Global state, utilities, event bindings, mobile panel system.
 * Panel IDs: panelMenu | panelChat | panelCart
 * Mobile badge ID: mobCartBadge
 */
"use strict";

const App = (() => {

  // ── Shared State ──────────────────────────────────────────────────────
  const state = {
    cart: {},
    tipPct: 0.15,
    filter: "all",
    category: "all",
    search: "",
    orderPlaced: false,
    orderStep: 0,
    tableNumber: "",
    paymentMethod: "card",
    checkoutTipPct: 0.15,
    activePanel: "panelChat",   // "panelMenu" | "panelChat" | "panelCart"
  };

  const TAX_RATE = 0.08875;
  const SERVICE_RATE = 0.12;
  const MOBILE_BP = 768;   // px — below this, only one panel visible

  // ── Utilities ─────────────────────────────────────────────────────────
  function nowTime() {
    return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  }

  function escHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function mdToHtml(text) {
    return escHtml(text)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/_(.+?)_/g, "<em>$1</em>")
      .replace(/\n/g, "<br>");
  }

  // ── Toast ─────────────────────────────────────────────────────────────
  function showToast(msg, type) {
    var c = document.getElementById("toastContainer");
    if (!c) return;
    var d = document.createElement("div");
    d.className = "toast" + (type ? " " + type : "");
    d.textContent = msg;
    c.appendChild(d);
    setTimeout(function () {
      d.style.animation = "toastOut 0.3s forwards";
      setTimeout(function () { d.parentNode && d.parentNode.removeChild(d); }, 350);
    }, 2800);
  }

  // ── Order Progress ────────────────────────────────────────────────────
  function updateProgress(step) {
    state.orderStep = step;
    var fill = document.getElementById("progFill");
    var steps = document.querySelectorAll(".prog-step-item");
    var pcts = ["8%", "38%", "68%", "96%"];
    if (fill) fill.style.width = pcts[step] || "8%";
    steps.forEach(function (el, i) {
      el.classList.toggle("done", i < step);
      el.classList.toggle("active", i === step);
    });
    var prog = document.getElementById("orderProgress");
    if (prog) prog.setAttribute("aria-valuenow", step);
  }

  // ── Category Switch ───────────────────────────────────────────────────
  function switchCategory(cat) {
    state.category = cat;
    
    // Clear global filter
    state.filter = "all";
    document.querySelectorAll(".chip").forEach(function (c) {
      c.classList.toggle("active", c.dataset.filter === "all");
      c.setAttribute("aria-pressed", c.dataset.filter === "all" ? "true" : "false");
    });
    
    // Clear search input
    state.search = "";
    var searchInp = document.getElementById("searchInput");
    if (searchInp) searchInp.value = "";

    document.querySelectorAll(".cat-btn").forEach(function (b) {
      b.classList.toggle("active", b.dataset.cat === cat);
    });
    var ml = document.getElementById("menuList");
    if (ml) ml.scrollTop = 0;
    Menu.renderMenu();
    // On mobile, switch to menu panel so user sees results
    if (window.innerWidth <= MOBILE_BP) showPanel("panelMenu");
  }

  // ── Ripple Effect ─────────────────────────────────────────────────────
  function addRipple(btn, e) {
    var r = btn.getBoundingClientRect();
    var x = e ? e.clientX - r.left : r.width / 2;
    var y = e ? e.clientY - r.top : r.height / 2;
    var rpl = document.createElement("span");
    rpl.style.cssText =
      "position:absolute;border-radius:50%;background:rgba(255,255,255,.22);" +
      "pointer-events:none;width:0;height:0;" +
      "left:" + x + "px;top:" + y + "px;" +
      "transform:translate(-50%,-50%);" +
      "transition:width .5s ease,height .5s ease,opacity .5s ease;opacity:1";
    btn.style.overflow = "hidden";
    btn.style.position = "relative";
    btn.appendChild(rpl);
    requestAnimationFrame(function () {
      var sz = Math.max(r.width, r.height) * 2.5;
      rpl.style.width = rpl.style.height = sz + "px";
      rpl.style.opacity = "0";
    });
    setTimeout(function () { rpl.parentNode && rpl.parentNode.removeChild(rpl); }, 600);
  }

  // ── Close Modal Overlay ───────────────────────────────────────────────
  function closeOverlay(el) {
    if (!el) return;
    var modal = el.querySelector(".modal");
    if (modal) {
      modal.style.animation = "modalOut 0.25s ease forwards";
      setTimeout(function () {
        el.classList.remove("open");
        modal.style.animation = "";
      }, 220);
    } else {
      el.classList.remove("open");
    }
  }

  // ── Mobile Panel Switcher ─────────────────────────────────────────────
  // panelId:  "panelMenu" | "panelChat" | "panelCart"
  // Each maps to a DOM element with that id AND a CSS class:
  //   panelMenu  → id=panelMenu,  class=menu-sidebar
  //   panelChat  → id=panelChat,  class=chat-zone
  //   panelCart  → id=panelCart,  class=cart-panel
  function showPanel(panelId) {
    state.activePanel = panelId;
    var isMobile = window.innerWidth <= MOBILE_BP;
    ["panelMenu", "panelChat", "panelCart"].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      if (isMobile) {
        el.style.display = (id === panelId) ? "" : "none";
      } else {
        // Desktop: always visible, CSS grid handles layout
        el.style.display = "";
      }
    });
    // Sync tab bar active state
    document.querySelectorAll(".mob-tab").forEach(function (btn) {
      var active = btn.dataset.panel === panelId;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  // ── Update mobile cart badge ──────────────────────────────────────────
  function updateMobCartBadge() {
    var count = (typeof Cart !== "undefined") ? Cart.cartCount() : 0;
    var badge = document.getElementById("mobCartBadge");
    if (!badge) return;
    badge.textContent = count;
    badge.style.display = count > 0 ? "inline-flex" : "none";
  }

  // ── Event Bindings ────────────────────────────────────────────────────

  function bindSearch() {
    var el = document.getElementById("searchInput");
    if (!el) return;
    var timer;
    el.addEventListener("input", function () {
      clearTimeout(timer);
      var v = el.value.trim();
      timer = setTimeout(function () { state.search = v; Menu.renderMenu(); }, 160);
    });
    el.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { el.value = ""; state.search = ""; Menu.renderMenu(); el.blur(); }
    });
  }

  function bindFilterChips() {
    document.querySelectorAll(".chip").forEach(function (chip) {
      chip.addEventListener("click", function (e) {
        state.filter = chip.dataset.filter;
        // When changing a global filter (Popular, Veg, etc), reset to 'All Categories'
        // so the user sees results from the entire menu.
        if (state.filter !== "all") {
          state.category = "all";
          document.querySelectorAll(".cat-btn").forEach(function (b) {
            b.classList.toggle("active", b.dataset.cat === "all");
          });
        }

        document.querySelectorAll(".chip").forEach(function (c) {
          var on = c.dataset.filter === state.filter;
          c.classList.toggle("active", on);
          c.setAttribute("aria-pressed", on ? "true" : "false");
        });
        addRipple(chip, e);
        Menu.renderMenu();
        if (window.innerWidth <= MOBILE_BP) showPanel("panelMenu");
      });
    });
  }

  function bindCategoryNav() {
    var nav = document.getElementById("catNav");
    if (!nav) return;
    nav.addEventListener("click", function (e) {
      var btn = e.target.closest(".cat-btn");
      if (btn) { addRipple(btn, e); switchCategory(btn.dataset.cat); }
    });
  }

  function bindMobileTabs() {
    document.querySelectorAll(".mob-tab").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        addRipple(btn, e);
        showPanel(btn.dataset.panel);
      });
    });
  }

  function bindCartToggle() {
    // Header cart button → open cart panel on mobile
    var btn = document.getElementById("cartToggleBtn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      if (window.innerWidth <= MOBILE_BP) showPanel("panelCart");
    });
  }

  function bindTableSelect() {
    var el = document.getElementById("tableSelect");
    if (!el) return;
    el.addEventListener("change", function () {
      state.tableNumber = el.value;
      if (el.value) showToast("🪑 Table " + el.value + " selected", "success");
    });
  }

  function bindCartClear() {
    var btn = document.getElementById("cartClearBtn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      if (Cart.cartCount() > 0) {
        if (window.innerWidth <= MOBILE_BP) showPanel("panelChat");
        Chat.addBotMsg("Are you sure you want to clear your entire order?",
          ["Yes, clear everything", "No, keep my order"]);
      } else {
        showToast("🛒 Your cart is already empty.");
      }
    });
  }

  function bindTipButtons() {
    document.querySelectorAll(".tip-btn").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        document.querySelectorAll(".tip-btn").forEach(function (b) {
          b.classList.remove("active");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-pressed", "true");
        state.tipPct = parseFloat(btn.dataset.tip);
        addRipple(btn, e);
        Cart.updateTotalsDisplay();
      });
    });
  }

  function bindCheckout() {
    var btn = document.getElementById("checkoutBtn");
    if (!btn) return;
    btn.addEventListener("click", function (e) {
      addRipple(btn, e);
      Payment.openCheckout();
    });
  }

  function bindOverlays() {
    ["checkoutOverlay", "successOverlay"].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("click", function (e) {
        if (e.target === e.currentTarget) closeOverlay(el);
      });
    });
    var itemOverlay = document.getElementById("itemOverlay");
    var itemClose = document.getElementById("itemModalClose");
    if (itemOverlay) {
      itemOverlay.addEventListener("click", function (e) {
        if (e.target === e.currentTarget) closeOverlay(itemOverlay);
      });
    }
    if (itemClose) {
      itemClose.addEventListener("click", function () {
        closeOverlay(document.getElementById("itemOverlay"));
      });
    }
  }

  function bindChatInput() {
    var input = document.getElementById("chatInput");
    var sendBtn = document.getElementById("sendBtn");
    if (sendBtn) {
      sendBtn.addEventListener("click", function (e) {
        addRipple(sendBtn, e);
        if (input) Chat.sendMsg(input.value.trim());
      });
    }
    if (input) {
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          Chat.sendMsg(input.value.trim());
        }
      });
      input.addEventListener("input", function () {
        this.style.height = "auto";
        this.style.height = Math.min(this.scrollHeight, 130) + "px";
      });
    }
  }

  function bindKeyboard() {
    document.addEventListener("keydown", function (e) {
      if (e.key === "/" && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
        e.preventDefault();
        var si = document.getElementById("searchInput");
        if (si) { si.focus(); if (window.innerWidth <= MOBILE_BP) showPanel("panelMenu"); }
      }
      if (e.key === "Escape") {
        var open = document.querySelector(".overlay.open");
        if (open) closeOverlay(open);
      }
    });
  }

  function bindResize() {
    window.addEventListener("resize", function () {
      if (window.innerWidth > MOBILE_BP) {
        // Restore all panels on desktop
        ["panelMenu", "panelChat", "panelCart"].forEach(function (id) {
          var el = document.getElementById(id);
          if (el) el.style.display = "";
        });
        // Reset tab states
        document.querySelectorAll(".mob-tab").forEach(function (b) {
          b.classList.remove("active");
          b.setAttribute("aria-pressed", "false");
        });
      } else {
        showPanel(state.activePanel);
      }
    });
  }

  function bindIntroExit() {
    var btn = document.getElementById("introEnterBtn");
    var intro = document.getElementById("introScreen");
    if (!btn || !intro) return;

    btn.addEventListener("click", function (e) {
      addRipple(btn, e);
      intro.style.animation = "introExit 1.2s cubic-bezier(0.7, 0, 0.3, 1) forwards";

      // Delay cleaning up and showing welcome till animation is mid-way
      setTimeout(function () {
        intro.style.display = "none";
        sendWelcomeMsg();
      }, 1000);
    });
  }

  function sendWelcomeMsg() {
    var h = new Date().getHours();
    var g = h < 12 ? "Good morning ☀️" : h < 17 ? "Good afternoon 🌤️" : "Good evening 🌙";
    Chat.addBotMsg(
      g + " Welcome to **Hanan Signature** ✦\n\n" +
      "I'm your personal dining assistant — here to make your experience exceptional.\n\n" +
      "Browse our authentic Pakistani menu, or simply tell me what you'd like!",
      ["Chef's Signatures ✨", "What's popular? ⭐", "Show full menu 📋", "Is everything Halal? ✅"]
    );
  }

  // ── App Init ──────────────────────────────────────────────────────────
  function init() {
    bindIntroExit();
    bindSearch();
    bindFilterChips();
    bindCategoryNav();
    bindMobileTabs();
    bindCartToggle();
    bindTableSelect();
    bindCartClear();
    bindTipButtons();
    bindCheckout();
    bindOverlays();
    bindChatInput();
    bindKeyboard();
    bindResize();

    Menu.renderMenu();
    Cart.renderCart();
    Voice.init();

    // On mobile, start on chat panel
    if (window.innerWidth <= MOBILE_BP) {
      showPanel("panelChat");
    }
  }

  // ── Public API ────────────────────────────────────────────────────────
  return {
    state, TAX_RATE, SERVICE_RATE,
    nowTime, escHtml, mdToHtml,
    showToast, updateProgress,
    switchCategory, showPanel,
    addRipple, closeOverlay,
    updateMobCartBadge,
    init,
  };

})();
