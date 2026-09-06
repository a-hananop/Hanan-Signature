/**
 * chat.js — Hanan Signature ✦
 * Chat UI, NLP intent detection, response generation.
 */
"use strict";

const Chat = (() => {

  // ── Intent Patterns ───────────────────────────────────────────────────
  const INTENTS = {
    greet:       /^(hi|hello|hey|salam|assalam|good (morning|evening|afternoon)|howdy)/i,
    bye:         /(bye|goodbye|khuda hafiz|allah hafiz|that'?s all|done|nothing else|see you)/i,
    thanks:      /(thank|shukriya|shukria|appreciate|great job|well done|perfect|love it|amazing)/i,
    menu:        /(menu|what.*have|what.*serve|show.*food|browse|see.*menu|all dishes|full menu)/i,
    specials:    /(special|chef|signature|featured|today.?s|exclusive)/i,
    starters:    /(starter|appetizer|snack|chaat|tikka|samosa|kebab|seekh|bun kebab|appetiser)/i,
    mains:       /(main|karahi|biryani|nihari|haleem|handi|gosht|curry|daal|dal|lunch|dinner)/i,
    desserts:    /(dessert|sweet|mithai|gulab|kheer|halwa|rasmalai|shahi|kulfi|zarda|after meal)/i,
    drinks:      /(drink|beverage|lassi|chai|tea|juice|water|sharbat|rooh afza|doodh patti|jaljeera)/i,
    popular:     /(popular|best|favourite|recommend|must.?try|most ordered|top dish)/i,
    vegetarian:  /(vegetarian|vegan|no meat|meatless|sabzi|veggie|plant.?based)/i,
    spicy:       /(spicy|hot|mirchi|tez|not.*spicy|medium heat)/i,
    glutenfree:  /(gluten.?free|no gluten|wheat.?free)/i,
    halal:       /(halal|haram|pork|alcohol|zabihah|certified)/i,
    cart:        /(cart|basket|my order|what.*ordered|current order|ordered so far)/i,
    checkout:    /(checkout|pay|payment|bill|check please|settle|place order|confirm.*order|total)/i,
    clear:       /(clear.*cart|empty.*cart|start over|restart.*order|remove all|new order)/i,
    hours:       /(hours|open|close|when|timing|schedule|days)/i,
    location:    /(location|address|where.*you|directions|near|find you)/i,
    reservation: /(reserv|booking|book.*table)/i,
    price:       /(price|cost|how much|cheap|expensive|afford|budget)/i,
    calories:    /(calori|healthy|light|diet|nutrition|low.*calori)/i,
    loyalty:     /(loyalty|points|rewards|member|tier|status|bronze|silver|gold)/i,
  };

  function detectIntents(msg) {
    return Object.entries(INTENTS)
      .filter(function (kv) { return kv[1].test(msg); })
      .map(function (kv) { return kv[0]; });
  }

  // ── Fuzzy item matching ───────────────────────────────────────────────
  function findMenuItems(msg) {
    var lower = msg.toLowerCase();
    var found = new Map();
    Object.values(Menu.ALL_ITEMS).forEach(function (item) {
      var name = item.name.toLowerCase();
      if (lower.includes(name)) { found.set(item.id, item); return; }
      var words = name.split(/\W+/).filter(function (w) { return w.length > 3; });
      if (words.length) {
        var hits = words.filter(function (w) { return lower.includes(w); }).length;
        if (hits >= Math.ceil(words.length * 0.6)) found.set(item.id, item);
      }
    });
    return Array.from(found.values());
  }

  function extractQty(msg) {
    var words = { one:1,a:1,an:1,two:2,do:2,three:3,teen:3,
                  four:4,char:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,ek:1 };
    var nm = msg.match(/(\d+)\s+(?:\w+\s+){0,3}(?:chicken|mutton|lamb|biryani|karahi|tikka|samosa|kebab|lassi|chai|haleem|nihari)/i);
    if (nm) return parseInt(nm[1]);
    for (var w in words) {
      if (new RegExp("\\b" + w + "\\b", "i").test(msg)) return words[w];
    }
    return 1;
  }

  // ── NLP Response Engine ───────────────────────────────────────────────
  function nlpRespond(msg) {
    var intents    = detectIntents(msg);
    var foundItems = findMenuItems(msg);
    var isAdd      = /\b(add|order|want|i'?d like|can i have|give me|bring me|get me|i want|please|ek|do|two|one|three|four|2|3|4|5)\b/i.test(msg);
    var isRemove   = /\b(remove|delete|cancel|take off|don'?t want|no more|get rid)\b/i.test(msg);
    var msgL       = msg.toLowerCase().trim();

    // ── Handle clear confirmation ──────────────────────────────────────
    if (msgL === "yes, clear everything" || msgL === "yes clear" || msgL === "yes, clear" || msgL === "clear") {
      Cart.clearCart();
      return { text: "🗑️ Your order has been cleared! Ready to start fresh?",
               replies: ["Show menu 📋", "Chef's Signatures ✨"] };
    }
    if (msgL === "no, keep my order" || msgL === "no keep" || msgL === "cancel") {
      return { text: "Got it! Your order is safe. 😊", replies: ["View cart 🛒", "Continue browsing"] };
    }

    // ── Greet ──────────────────────────────────────────────────────────
    if (intents.includes("greet") && !foundItems.length) {
      var h = new Date().getHours();
      var g = h < 12 ? "Good morning ☀️" : h < 17 ? "Good afternoon 🌤️" : "Good evening 🌙";
      return {
        text: g + " Welcome to **Hanan Signature** ✦\n\nI'm your personal dining assistant. I can help you:\n\n• 📋 **Browse** our full Pakistani menu\n• ✨ **Discover** today's Chef's Signatures\n• 🛒 **Place** your order effortlessly\n• 💳 **Checkout** with ease\n\nHow may I serve you today?",
        replies: ["Chef's Signatures ✨", "What's popular? ⭐", "Show full menu 📋", "Is everything Halal? ✅"]
      };
    }

    // ── Bye ────────────────────────────────────────────────────────────
    if (intents.includes("bye")) {
      return {
        text: "Khuda Hafiz! 🙏 Thank you for dining with **Hanan Signature** ✦\n\n_Shukriya aur khush rahein!_ 🌸\n\nWe hope to welcome you back very soon.",
        replies: ["Start a new order 🍽️"]
      };
    }

    // ── Thanks ─────────────────────────────────────────────────────────
    if (intents.includes("thanks") && !foundItems.length) {
      return {
        text: "Shukriya! 🙏 It's truly our pleasure.\n\nIs there anything else I can help you with?",
        replies: ["Show menu", "View my cart", "That's all, thanks"]
      };
    }

    // ── Halal ──────────────────────────────────────────────────────────
    if (intents.includes("halal")) {
      return {
        text: "✅ **100% Halal Certified**\n\nEvery single dish at Hanan Signature is prepared with:\n\n• Halal-certified meat from approved suppliers\n• **No pork** products of any kind\n• **No alcohol** in cooking or marinades\n• Strict halal kitchen protocols throughout\n\nYou can dine with complete confidence. 🕌",
        replies: ["Show menu", "Chef's Signatures", "What's popular?"]
      };
    }

    // ── Remove item ────────────────────────────────────────────────────
    if (isRemove && foundItems.length) {
      var rem = foundItems[0];
      if (App.state.cart[rem.id]) {
        Cart.removeFromCart(rem.id);
        return { text: "🗑️ **" + rem.name + "** removed from your order.", replies: ["View cart", "Show menu"] };
      }
      return { text: "**" + rem.name + "** isn't in your current order.", replies: ["View cart", "Show menu"] };
    }

    // ── Add found items ────────────────────────────────────────────────
    if (foundItems.length && isAdd) {
      var item = foundItems[0];
      var qty  = extractQty(msg);
      Cart.addToCart(item.id, qty);
      var extra = "";
      if (foundItems.length > 1) {
        var names = foundItems.slice(1, 3).map(function (i) { return "**" + i.name + "**"; }).join(", ");
        extra = "\n\nI also found: " + names + ". Want those too?";
      }
      return {
        text: "Added **" + item.emoji + " " + item.name + "** × " + qty + " to your order! 🎉" + extra + "\n\n_$" + (item.price * qty).toFixed(2) + "_",
        replies: ["View cart 🛒", "Continue browsing", "Checkout 💳"]
      };
    }

    // ── Clear cart intent ──────────────────────────────────────────────
    if (intents.includes("clear")) {
      return {
        text: "⚠️ Are you sure you want to clear your entire order?",
        replies: ["Yes, clear everything", "No, keep my order"]
      };
    }

    // ── Category shortcuts ─────────────────────────────────────────────
    if (intents.includes("specials")) {
      return { text: "Here are our **Chef's Signatures** ✨\n\nCrafted with passion, served with pride:",
               replies: ["Add Hanan Dum Biryani", "Add Royal Nihari", "Add Signature Karahi", "See all specials"],
               action:"show_cat", cat:"specials" };
    }
    if (intents.includes("starters")) {
      return { text: "Explore our **Starters & Snacks** 🥙\n\nPerfect for sharing or whetting your appetite.",
               replies: ["Add Chicken Tikka", "Add Seekh Kebab", "Add Crispy Samosa", "Add Papri Chaat"],
               action:"show_cat", cat:"starters" };
    }
    if (intents.includes("mains")) {
      return { text: "Our **Main Course** 🍛 is the heart of Pakistani cuisine.\n\nSlow-cooked, richly spiced & absolutely satisfying.",
               replies: ["Add Chicken Karahi", "Add Haleem", "Add Mutton Biryani", "Add Dal Makhani"],
               action:"show_cat", cat:"mains" };
    }
    if (intents.includes("desserts")) {
      return { text: "Indulge in our **Desserts & Mithai** 🍮\n\nAuthentic Pakistani sweets to end your meal perfectly.",
               replies: ["Add Gulab Jamun", "Add Rasmalai", "Add Kheer", "Add Gajar Halwa"],
               action:"show_cat", cat:"desserts" };
    }
    if (intents.includes("drinks")) {
      return { text: "Quench your thirst with our **Drinks & Beverages** 🥤\n\nFrom creamy lassi to aromatic chai.",
               replies: ["Add Mango Lassi", "Add Kashmiri Chai", "Add Doodh Patti Chai", "Add Jaljeera"],
               action:"show_cat", cat:"drinks" };
    }

    // ── Popular ────────────────────────────────────────────────────────
    if (intents.includes("popular")) {
      var pops = Object.values(Menu.ALL_ITEMS)
        .filter(function (i) { return i.tags.includes("popular"); })
        .sort(function (a, b) { return b.votes - a.votes; }).slice(0, 5);
      var lines = pops.map(function (i) {
        return i.emoji + " **" + i.name + "** — $" + i.price.toFixed(2) + " · ⭐" + i.rating;
      }).join("\n");
      return { text: "⭐ **Most Popular Dishes:**\n\n" + lines + "\n\nAll-time customer favourites!",
               replies: ["Add Chicken Karahi", "Add Mango Lassi", "Show full menu"] };
    }

    // ── Vegetarian ─────────────────────────────────────────────────────
    if (intents.includes("vegetarian")) {
      var vegs  = Object.values(Menu.ALL_ITEMS).filter(function (i) { return i.tags.includes("vegetarian"); });
      var vlines = vegs.map(function (i) { return i.emoji + " **" + i.name + "** — $" + i.price.toFixed(2); }).join("\n");
      return { text: "🌿 **Vegetarian Options** (" + vegs.length + " dishes)\n\n" + vlines + "\n\nAll prepared in our dedicated vegetarian section.",
               replies: ["Add Dal Makhani", "Add Saag Paneer", "Add Rasmalai"] };
    }

    // ── Gluten-free ────────────────────────────────────────────────────
    if (intents.includes("glutenfree")) {
      var gf    = Object.values(Menu.ALL_ITEMS).filter(function (i) { return i.tags.includes("gluten-free"); });
      var glines = gf.map(function (i) { return i.emoji + " **" + i.name + "** — $" + i.price.toFixed(2); }).join("\n");
      return { text: "🌾 **Gluten-Free Options** (" + gf.length + " dishes)\n\n" + glines,
               replies: ["Add Chicken Tikka", "Show full menu"] };
    }

    // ── Spicy ──────────────────────────────────────────────────────────
    if (intents.includes("spicy")) {
      var sp    = Object.values(Menu.ALL_ITEMS).filter(function (i) { return i.tags.includes("spicy"); });
      var slines = sp.map(function (i) { return i.emoji + " **" + i.name + "**"; }).join("\n");
      return { text: "🌶️ **Spicy Dishes:**\n\n" + slines + "\n\n_All spice levels can be adjusted on request!_",
               replies: ["Show full menu", "Vegetarian options"] };
    }

    // ── Calories ───────────────────────────────────────────────────────
    if (intents.includes("calories")) {
      var light = Object.values(Menu.ALL_ITEMS)
        .filter(function (i) { return i.calories < 350; })
        .sort(function (a, b) { return a.calories - b.calories; }).slice(0, 5);
      var llines = light.map(function (i) { return i.emoji + " **" + i.name + "** — " + i.calories + " kcal"; }).join("\n");
      return { text: "🥗 **Lighter Options (under 350 kcal):**\n\n" + llines + "\n\n_All dishes can be prepared with reduced oil on request._",
               replies: ["Show full menu", "Vegetarian options", "What's popular?"] };
    }

    // ── Cart ───────────────────────────────────────────────────────────
    if (intents.includes("cart")) {
      var cartItems = Object.values(App.state.cart);
      if (!cartItems.length) {
        return { text: "🛒 Your cart is empty!\n\nBrowse our menu and add your favourite dishes.",
                 replies: ["Show menu", "What's popular?"] };
      }
      var total = Cart.cartTotals().total;
      var clines = cartItems.map(function (i) {
        return "• " + i.emoji + " **" + i.name + "** ×" + i.qty + " — $" + (i.price * i.qty).toFixed(2);
      }).join("\n");
      return {
        text: "🛒 **Your current order:**\n\n" + clines + "\n\n" + "─".repeat(28) + "\n💰 Total: **$" + total.toFixed(2) + "**",
        replies: ["Proceed to checkout", "Show menu 📋", "Clear cart"]
      };
    }

    // ── Checkout ───────────────────────────────────────────────────────
    if (intents.includes("checkout")) {
      if (!Cart.cartCount()) {
        return { text: "🛒 Your cart is empty — add some dishes first!", replies: ["Show menu", "What's popular?"] };
      }
      Payment.openCheckout();
      return { text: "💳 Opening checkout for you…", replies: [] };
    }

    // ── Info ───────────────────────────────────────────────────────────
    if (intents.includes("hours")) {
      return { text: "🕐 **Opening Hours:**\n\n📅 Mon–Thu: 12:00 PM – 10:30 PM\n📅 Fri–Sat: 12:00 PM – 12:00 AM\n📅 Sunday: 1:00 PM – 10:00 PM\n\n_Kitchen closes 45 min before closing._",
               replies: ["Make a reservation", "Get directions"] };
    }
    if (intents.includes("location")) {
      return { text: "📍 **Find Us:**\n\n🏠 128 Spice Lane, Little Pakistan\nNew York, NY 10013\n\n📞 (555) 786-0001\n✉️ dine@hanansignature.com\n\n🚇 Nearest: Canal St (6/J/Z)\n🅿️ Street parking available",
               replies: ["Opening hours", "Make a reservation"] };
    }
    if (intents.includes("reservation")) {
      return { text: "📅 **Reservations:**\n\n📞 **(555) 786-0001**\n✉️ dine@hanansignature.com\n🌐 www.hanansignature.com/book\n\nBook 48 hrs ahead for weekends.\nPrivate dining available for groups of 8+.",
               replies: ["Opening hours", "Show menu"] };
    }
    if (intents.includes("loyalty")) {
      return { text: "⭐ **Hanan Signature Rewards**\n\nEarn **1 point per $1** spent:\n\n🥉 **Bronze** — 0–499 pts (welcome tier)\n🥈 **Silver** — 500–999 pts (free naan + priority seating)\n🥇 **Gold** — 1000+ pts (chef's table + complimentary dessert)\n\nAsk our staff to enroll today!",
               replies: ["Show menu", "Make a reservation"] };
    }
    if (intents.includes("price")) {
      return { text: "💰 **Price Guide:**\n\n✨ Chef's Signatures: $24–$28\n🥙 Starters & Snacks: $9.99–$15.99\n🍛 Main Course: $14.99–$24.99\n🍮 Desserts & Mithai: $8.99–$11.99\n🥤 Drinks: $4.99–$6.99\n\n_Plus tax (8.875%) & service charge (12%)._",
               replies: ["Show full menu", "Chef's Signatures"] };
    }
    if (intents.includes("menu")) {
      return { text: "Welcome to **Hanan Signature's** full menu! 🍽️\n\nWhat would you like to explore?",
               replies: ["Chef's Signatures ✨", "Starters & Snacks", "Main Course", "Desserts & Mithai", "Drinks"] };
    }

    // ── Fallback ───────────────────────────────────────────────────────
    return {
      text: "I'm here to help! 😊 Try:\n\n• 📋 **\"Show me the menu\"**\n• ⭐ **\"What's popular?\"**\n• ➕ **\"Add 2 chicken karahi\"**\n• 🛒 **\"View my cart\"**\n• 💳 **\"Checkout please\"**\n• 📍 **\"Where are you located?\"**",
      replies: ["Show menu", "What's popular?", "View cart", "Opening hours"]
    };
  }

  // ── Chat UI ───────────────────────────────────────────────────────────
  function addBotMsg(text, replies) {
    replies = replies || [];
    var el  = document.createElement("div");
    el.className = "msg bot";
    var repliesHtml = replies.length
      ? "<div class='quick-replies'>" +
        replies.map(function (r, i) {
          return "<button class='qr' style='animation-delay:" + (i * 0.07) + "s'" +
                 " onclick=\"Chat.sendMsg(" + App.escHtml(JSON.stringify(r)) + ")\">" + r + "</button>";
        }).join("") +
        "</div>"
      : "";
    el.innerHTML =
      "<div class='msg-avatar' aria-hidden='true'>🤖</div>" +
      "<div>" +
      "<div class='msg-bubble'>" + App.mdToHtml(text) + "</div>" +
      "<div class='msg-time'>" + App.nowTime() + "</div>" +
      repliesHtml +
      "</div>";
    var msgs = document.getElementById("chatMessages");
    if (msgs) msgs.appendChild(el);
    scrollChat();
  }

  function addUserMsg(text) {
    var el = document.createElement("div");
    el.className = "msg user";
    el.innerHTML =
      "<div class='msg-avatar' aria-hidden='true'>👤</div>" +
      "<div>" +
      "<div class='msg-bubble'>" + App.escHtml(text) + "</div>" +
      "<div class='msg-time'>" + App.nowTime() + "</div>" +
      "</div>";
    var msgs = document.getElementById("chatMessages");
    if (msgs) msgs.appendChild(el);
    scrollChat();
  }

  function showTyping() {
    var el = document.createElement("div");
    el.className = "msg bot";
    el.id        = "typingMsg";
    el.innerHTML =
      "<div class='msg-avatar' aria-hidden='true'>🤖</div>" +
      "<div class='msg-bubble' style='padding:0' aria-label='Typing'>" +
      "<div class='typing-dots'><span></span><span></span><span></span></div></div>";
    var msgs = document.getElementById("chatMessages");
    if (msgs) msgs.appendChild(el);
    scrollChat();
  }

  function removeTyping() {
    var t = document.getElementById("typingMsg");
    if (t) t.parentNode && t.parentNode.removeChild(t);
  }

  function scrollChat() {
    var s = document.getElementById("chatScroll");
    if (s) requestAnimationFrame(function () { s.scrollTo({ top: s.scrollHeight, behavior: "smooth" }); });
  }

  // ── Send ──────────────────────────────────────────────────────────────
  function sendMsg(msg) {
    if (!msg || !msg.trim()) return;
    var inputEl = document.getElementById("chatInput");
    if (inputEl) { inputEl.value = ""; inputEl.style.height = "auto"; }

    addUserMsg(msg);
    showTyping();

    var delay = 350 + Math.random() * 600;
    setTimeout(function () {
      removeTyping();
      var resp = nlpRespond(msg);
      if (resp.action === "show_cat" && resp.cat) App.switchCategory(resp.cat);
      addBotMsg(resp.text, resp.replies || []);
    }, delay);
  }

  return { addBotMsg, addUserMsg, sendMsg, scrollChat };

})();
