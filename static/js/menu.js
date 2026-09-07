/**
 * menu.js — Hanan Signature ✦
 * Menu data, rendering, filter/search logic, item detail modal.
 */
"use strict";

const Menu = (() => {

  // ── Menu Data ──────────────────────────────────────────────────────────
  const MENU = {
    specials: [
      { id: "sp1", name: "Hanan Dum Biryani", price: 28.00, emoji: "🍚", desc: "Slow-cooked basmati rice layered with saffron-marinated mutton, birista, kewra water & whole spices. Served with raita, salad & mint chutney.", tags: ["popular", "chef-special"], calories: 980, prep: 45, rating: 5.0, votes: 487, allergens: ["Dairy", "Nuts"] },
      { id: "sp2", name: "Royal Nihari — Chef's Pride", price: 24.00, emoji: "🍲", desc: "12-hour slow-braised beef shank in aromatic gravy of ginger, cardamom & nihari masala. Garnished with ginger julienne, coriander, fried onions & lemon.", tags: ["popular", "chef-special"], calories: 820, prep: 30, rating: 4.9, votes: 321, allergens: ["Gluten"] },
      { id: "sp3", name: "Signature Cast-Iron Karahi", price: 26.00, emoji: "🥘", desc: "Bone-in mutton wok-tossed with hand-crushed tomatoes, green chillies, fresh ginger, black pepper & dried fenugreek. Finished tableside in a sizzling cast-iron karahi.", tags: ["chef-special", "spicy"], calories: 760, prep: 35, rating: 4.9, votes: 298, allergens: ["Dairy"] },
    ],
    starters: [
      { id: "s1", name: "Chicken Tikka", price: 14.99, emoji: "🍗", desc: "Overnight-marinated boneless chicken in yoghurt, Kashmiri red chilli, ginger-garlic paste & lemon juice, chargrilled in a clay tandoor. Served with mint chutney & naan.", tags: ["popular", "gluten-free"], calories: 420, prep: 20, rating: 4.8, votes: 643, allergens: ["Dairy"] },
      { id: "s2", name: "Seekh Kebab", price: 13.99, emoji: "🍢", desc: "Minced beef with green chilli, coriander, onion & garam masala, hand-shaped on skewers and grilled over charcoal. Juicy inside, crisp outside.", tags: ["popular"], calories: 380, prep: 18, rating: 4.7, votes: 524, allergens: [] },
      { id: "s3", name: "Crispy Samosa (3 pcs)", price: 9.99, emoji: "🥟", desc: "Golden flaky pastry filled with spiced potato, green peas & fresh herbs. Served with tamarind & mint chutneys.", tags: ["vegetarian", "popular"], calories: 340, prep: 12, rating: 4.7, votes: 782, allergens: ["Gluten"] },
      { id: "s4", name: "Papri Chaat", price: 11.99, emoji: "🥙", desc: "Crispy flour wafers, boiled chickpeas, potato cubes, whisked yoghurt, tamarind chutney, green chutney & chaat masala. A classic Lahori street-food.", tags: ["vegetarian", "popular"], calories: 310, prep: 8, rating: 4.8, votes: 698, allergens: ["Gluten", "Dairy"] },
      { id: "s5", name: "Reshmi Kebab", price: 15.99, emoji: "🍡", desc: "Silky chicken mince blended with cream cheese, cashew paste, green chilli & cardamom — grilled till golden. Melt-in-the-mouth texture.", tags: ["gluten-free"], calories: 450, prep: 22, rating: 4.6, votes: 389, allergens: ["Dairy", "Nuts"] },
      { id: "s6", name: "Aloo Tikki (4 pcs)", price: 10.99, emoji: "🫓", desc: "Pan-fried spiced potato patties with crushed chickpeas, coriander & pomegranate seeds. Served with yoghurt dip & tamarind sauce.", tags: ["vegetarian"], calories: 360, prep: 15, rating: 4.5, votes: 312, allergens: ["Gluten"] },
      { id: "s7", name: "Dahi Bhalle", price: 10.99, emoji: "🥣", desc: "Soft lentil dumplings soaked in chilled sweetened yoghurt, drizzled with tamarind chutney, cumin & red chilli. A beloved Pakistani festive starter.", tags: ["vegetarian"], calories: 290, prep: 10, rating: 4.6, votes: 415, allergens: ["Gluten", "Dairy"] },
      { id: "s8", name: "Bun Kebab", price: 12.99, emoji: "🍔", desc: "Lahore's iconic street burger — spicy chicken shami kebab patty, fried egg, pickled onions & coriander chutney in a toasted bun.", tags: ["popular"], calories: 480, prep: 14, rating: 4.8, votes: 567, allergens: ["Gluten", "Dairy"] },
    ],
    mains: [
      { id: "m1", name: "Chicken Karahi", price: 21.99, emoji: "🥘", desc: "Bone-in chicken wok-cooked with fresh tomatoes, ginger, green chillies, coriander & Pakistani spices. Served with naan.", tags: ["popular", "spicy"], calories: 620, prep: 28, rating: 4.9, votes: 987, allergens: ["Dairy"] },
      { id: "m2", name: "Mutton Dum Biryani", price: 24.99, emoji: "🍚", desc: "Fragrant basmati layered with slow-braised mutton, saffron, rose water, fried onions & whole spices. Slow-cooked on dum (sealed steam).", tags: ["popular"], calories: 890, prep: 40, rating: 4.8, votes: 812, allergens: ["Dairy", "Nuts"] },
      { id: "m3", name: "Dal Makhani", price: 16.99, emoji: "🫕", desc: "Black urad lentils & kidney beans slow-cooked overnight, finished with butter, cream & a smoky tandoor finish.", tags: ["vegetarian", "popular"], calories: 520, prep: 20, rating: 4.8, votes: 724, allergens: ["Dairy"] },
      { id: "m4", name: "Palak Gosht", price: 22.99, emoji: "🍃", desc: "Tender boneless mutton braised in vibrant spinach purée, garlic, ginger & warming spices. Rich, earthy & deeply satisfying.", tags: ["gluten-free"], calories: 640, prep: 30, rating: 4.7, votes: 567, allergens: ["Dairy"] },
      { id: "m5", name: "Chicken Handi", price: 19.99, emoji: "🍛", desc: "Boneless chicken slow-cooked in a clay handi pot with rich tomato-cream gravy, dried fenugreek, cashew paste & aromatic spices.", tags: ["popular"], calories: 680, prep: 25, rating: 4.8, votes: 634, allergens: ["Dairy", "Nuts"] },
      { id: "m6", name: "Haleem", price: 18.99, emoji: "🥣", desc: "A beloved Pakistani slow-cook — shredded beef & broken wheat simmered for hours with whole spices until thick & silky. Topped with ginger, lime & coriander.", tags: ["popular"], calories: 580, prep: 15, rating: 4.9, votes: 743, allergens: ["Gluten"] },
      { id: "m7", name: "Aloo Gosht", price: 20.99, emoji: "🍖", desc: "Classic Pakistani mutton & potato curry — tender chunks slow-braised in a rich onion-tomato gravy. Pure comfort food.", tags: ["gluten-free"], calories: 710, prep: 35, rating: 4.6, votes: 489, allergens: ["Dairy"] },
      { id: "m8", name: "Daal Tadka", price: 14.99, emoji: "🫙", desc: "Yellow lentils simmered with turmeric & ginger, finished with a sizzling tadka of cumin, dried red chilli, garlic & desi ghee.", tags: ["vegetarian", "vegan", "gluten-free"], calories: 410, prep: 20, rating: 4.6, votes: 531, allergens: [] },
      { id: "m9", name: "Chicken Biryani", price: 20.99, emoji: "🍚", desc: "Aromatic basmati layered with spiced bone-in chicken, saffron, fried onions & fresh mint. A classic that never disappoints.", tags: ["popular"], calories: 820, prep: 38, rating: 4.8, votes: 754, allergens: ["Dairy"] },
      { id: "m10", name: "Paya (Trotters)", price: 22.99, emoji: "🦴", desc: "Slow-cooked lamb trotters in a rich collagen broth with ginger, garlic & whole spices. A traditional Pakistani favourite.", tags: ["gluten-free"], calories: 540, prep: 20, rating: 4.7, votes: 398, allergens: [] },
      { id: "m11", name: "Lahori Chargha", price: 23.99, emoji: "🍗", desc: "Whole chicken marinated in spiced yoghurt, steamed then deep-fried golden & crispy. A signature Lahori dish served with raita & salad.", tags: ["popular", "spicy"], calories: 890, prep: 40, rating: 4.9, votes: 612, allergens: ["Dairy"] },
      { id: "m12", name: "Saag Paneer", price: 17.99, emoji: "🟩", desc: "Fresh cottage cheese cubes in a rich slow-cooked mustard greens & spinach purée with garlic, ginger & desi ghee.", tags: ["vegetarian", "gluten-free"], calories: 480, prep: 22, rating: 4.6, votes: 421, allergens: ["Dairy"] },
      { id: "m13", name: "Keema Naan", price: 13.99, emoji: "🫓", desc: "Freshly baked tandoor naan stuffed with spiced minced beef, green chillies & onions. Served with mint chutney.", tags: ["popular"], calories: 520, prep: 18, rating: 4.7, votes: 689, allergens: ["Gluten", "Dairy"] },
      { id: "m14", name: "Mutton Roghan Josh", price: 24.99, emoji: "🥘", desc: "Kashmiri-style mutton braised in a vibrant red gravy of Kashmiri chilli, fennel & whole spices. Aromatic, bold & strikingly beautiful.", tags: ["gluten-free"], calories: 700, prep: 40, rating: 4.8, votes: 456, allergens: ["Dairy"] },
    ],
    desserts: [
      { id: "d1", name: "Gulab Jamun (3 pcs)", price: 8.99, emoji: "🍮", desc: "Soft milk dumplings fried golden, soaked in rose-infused saffron sugar syrup with green cardamom.", tags: ["vegetarian", "popular"], calories: 520, prep: 8, rating: 4.9, votes: 1023, allergens: ["Gluten", "Dairy"] },
      { id: "d2", name: "Kheer", price: 9.99, emoji: "🥛", desc: "Slow-cooked creamy rice pudding with full-fat milk, green cardamom, crushed pistachios & rose water. Pure nostalgia.", tags: ["vegetarian", "gluten-free"], calories: 440, prep: 5, rating: 4.8, votes: 812, allergens: ["Dairy", "Nuts"] },
      { id: "d3", name: "Shahi Tukray", price: 10.99, emoji: "🍞", desc: "Royal bread pudding — fried bread soaked in saffron-cardamom rabri, garnished with silver leaf, crushed almonds & rose petals.", tags: ["vegetarian", "popular"], calories: 610, prep: 10, rating: 4.7, votes: 678, allergens: ["Gluten", "Dairy", "Nuts"] },
      { id: "d4", name: "Gajar Halwa", price: 9.99, emoji: "🥕", desc: "Slow-cooked grated carrot halwa in desi ghee, whole milk, sugar & green cardamom. Topped with pistachios & served warm.", tags: ["vegetarian", "gluten-free"], calories: 490, prep: 8, rating: 4.7, votes: 589, allergens: ["Dairy", "Nuts"] },
      { id: "d5", name: "Rasmalai", price: 11.99, emoji: "🍡", desc: "Velvety cottage cheese dumplings in chilled saffron-cream sauce with green cardamom & crushed pistachios. Light, delicate & utterly divine.", tags: ["vegetarian", "gluten-free", "popular"], calories: 390, prep: 5, rating: 4.9, votes: 756, allergens: ["Dairy", "Nuts"] },
      { id: "d6", name: "Kulfi (2 pcs)", price: 9.99, emoji: "🍦", desc: "Traditional frozen Pakistani ice cream — dense, creamy & intensely flavoured with cardamom, pistachio & rose water. Served on a stick.", tags: ["vegetarian", "gluten-free"], calories: 360, prep: 4, rating: 4.8, votes: 634, allergens: ["Dairy", "Nuts"] },
      { id: "d7", name: "Zarda (Sweet Rice)", price: 10.99, emoji: "🍯", desc: "Festive saffron-tinted sweet rice with sugar, cardamom, raisins, almonds & silver leaf. Traditionally served at celebrations.", tags: ["vegetarian"], calories: 510, prep: 8, rating: 4.6, votes: 398, allergens: ["Dairy", "Nuts", "Gluten"] },
    ],
    drinks: [
      { id: "dr1", name: "Mango Lassi", price: 6.99, emoji: "🥭", desc: "Thick chilled blend of fresh Alphonso mango pulp, full-fat yoghurt, sugar & a pinch of cardamom. Creamy, sweet & incredibly refreshing.", tags: ["vegetarian", "popular"], calories: 220, prep: 5, rating: 4.9, votes: 1145, allergens: ["Dairy"] },
      { id: "dr2", name: "Kashmiri Chai (Pink Tea)", price: 5.99, emoji: "🍵", desc: "Iconic blush-pink Kashmiri tea brewed with gunpowder green tea, milk, baking soda & cardamom. Topped with almond flakes & pistachios.", tags: ["vegetarian"], calories: 180, prep: 8, rating: 4.8, votes: 834, allergens: ["Dairy", "Nuts"] },
      { id: "dr3", name: "Sweet Lassi", price: 5.99, emoji: "🥛", desc: "Chilled yoghurt whisked with sugar, ice & rose water. Cool, light and wonderfully refreshing.", tags: ["vegetarian", "popular"], calories: 190, prep: 4, rating: 4.7, votes: 723, allergens: ["Dairy"] },
      { id: "dr4", name: "Rooh Afza Sharbat", price: 4.99, emoji: "🌹", desc: "Classic Pakistani rose-based concentrate with chilled milk. Floral, sweet & utterly nostalgic. A beloved Iftar favourite.", tags: ["vegetarian", "popular"], calories: 140, prep: 3, rating: 4.6, votes: 612, allergens: ["Dairy"] },
      { id: "dr5", name: "Doodh Patti Chai", price: 4.99, emoji: "☕", desc: "Traditional Pakistani milk tea brewed strong with Assam leaves, whole cardamom & fresh ginger. No water added — pure doodh patti bliss.", tags: ["popular"], calories: 120, prep: 6, rating: 4.8, votes: 945, allergens: ["Dairy"] },
      { id: "dr6", name: "Fresh Lime Soda", price: 4.99, emoji: "🍋", desc: "Freshly squeezed lime, sparkling soda, mint, kala namak & cumin. Choose sweet, salted or mixed.", tags: ["vegan"], calories: 60, prep: 3, rating: 4.6, votes: 498, allergens: [] },
      { id: "dr7", name: "Jaljeera", price: 4.99, emoji: "🌿", desc: "Tangy chilled drink made with cumin, mint, tamarind, black salt & lemon. A cooling, digestive drink perfect after a spicy meal.", tags: ["vegan", "popular"], calories: 55, prep: 3, rating: 4.7, votes: 576, allergens: [] },
      { id: "dr8", name: "Sugarcane Juice", price: 5.99, emoji: "🎋", desc: "Freshly pressed sugarcane with ginger, lemon & a pinch of black salt. Sweet, earthy & incredibly energising.", tags: ["vegan"], calories: 110, prep: 5, rating: 4.8, votes: 489, allergens: [] },
    ],
  };

  // ── Flat ID → item lookup ─────────────────────────────────────────────
  const ALL_ITEMS = {};
  Object.values(MENU).flat().forEach(function (item) { ALL_ITEMS[item.id] = item; });

  const CAT_NAMES = {
    all: "All Categories",
    specials: "Chef's Signatures",
    starters: "Starters & Snacks",
    mains: "Main Course",
    desserts: "Desserts & Mithai",
    drinks: "Drinks & Beverages",
  };

  // ── Tag helpers ───────────────────────────────────────────────────────
  function tagClass(t) {
    return {
      vegetarian: "tag-veg", vegan: "tag-veg", popular: "tag-popular",
      spicy: "tag-spicy", "chef-special": "tag-special", "gluten-free": "tag-gf"
    }[t] || "tag-popular";
  }
 function tagLabel(t) {
    var labels = {
      vegetarian: "Vegetarian", vegan: "Vegan", popular: "Popular", spicy: "Spicy",
      "chef-special": "Chef's Special", "gluten-free": "Gluten-Free"
    };
    return labels[t] || t;
  }

  function detailIcon(name) {
    var paths = {
      flame: "<path d='M12 21c4.2 0 7-2.7 7-6.5 0-3.1-1.8-5.4-4.1-7.4.1 2-1 3.3-2.2 4.1.2-3.6-1.4-6.2-4.4-8.2.2 3.3-2.8 5.5-2.8 9.1C5.5 17.9 8.3 21 12 21Z'/><path d='M9.7 16.8c0-1.4 1-2.4 2.2-3.6.8 1.1 1.6 2.1 1.6 3.6a1.9 1.9 0 0 1-3.8 0Z'/> ",
      clock: "<circle cx='12' cy='12' r='8.5'/><path d='M12 7v5l3.2 2'/><path d='M8 3.8 6.5 2.5M16 3.8l1.5-1.3'/>",
      star: "<path d='m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z'/>",
      shield: "<path d='M12 3 19 6v5.2c0 4.3-2.8 7.3-7 8.8-4.2-1.5-7-4.5-7-8.8V6l7-3Z'/><path d='m8.5 12 2.2 2.2 4.8-4.8'/>",
      warning: "<path d='m12 4 8 14H4L12 4Z'/><path d='M12 9v4'/><circle cx='12' cy='16' r='.6' fill='currentColor' stroke='none'/>",
      leaf: "<path d='M19.5 4.5C12 4.6 6 7.1 6 13c0 2.2 1.8 4 4 4 5.9 0 8.4-6 9.5-12.5Z'/><path d='M4 21c2.2-4.4 5.6-7.4 10-10'/>",
      chef: "<path d='M7 10h10v9H7z'/><path d='M6 10a3 3 0 1 1 2.5-4.7A3.8 3.8 0 0 1 15.5 6 3 3 0 1 1 18 10'/><path d='M5 21h14'/>",
      cart: "<path d='M4 5h2l1.3 9.2a2 2 0 0 0 2 1.8h6.9a2 2 0 0 0 1.9-1.4L20 8H7'/><circle cx='10' cy='19' r='1.2'/><circle cx='17' cy='19' r='1.2'/>",
      plus: "<path d='M12 5v14M5 12h14'/>",
      minus: "<path d='M5 12h14'/>",
    };
    return "<span class='detail-icon detail-icon-" + name + "' aria-hidden='true'><svg viewBox='0 0 24 24' focusable='false'>" + (paths[name] || paths.star) + "</svg></span>";
  }

  function tagMarkup(t) {
    var icons = { vegetarian: "leaf", vegan: "leaf", popular: "star", spicy: "flame", "chef-special": "chef", "gluten-free": "leaf" };
    return "<span class='tag " + tagClass(t) + "'>" + detailIcon(icons[t] || "star") + "<span>" + tagLabel(t) + "</span></span>";
    return {
      vegetarian: "🌿 Veg", vegan: "🌱 Vegan", popular: "⭐ Popular",
      spicy: "🌶️ Spicy", "chef-special": "👨‍🍳 Special", "gluten-free": "🌾 GF"
    }[t] || t;
  }

  function starsHtml(rating) {
    var full = Math.floor(rating);
    var half = (rating % 1 >= 0.5) ? 1 : 0;
    var empty = 5 - full - half;
    return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
  }

  // ── Filter logic ──────────────────────────────────────────────────────
  function getFilteredSections() {
    var cat = App.state.category;
    var filter = App.state.filter;
    var search = App.state.search.toLowerCase();
    var cats = cat === "all" ? Object.keys(MENU) : [cat];
    var sections = [];
    cats.forEach(function (c) {
      var items = (MENU[c] || []).slice();
      if (filter !== "all") {
        items = items.filter(function (i) {
          if (filter === "vegetarian") return i.tags.includes("vegetarian") || i.tags.includes("vegan");
          return i.tags.includes(filter);
        });
      }
      if (search) items = items.filter(function (i) {
        return i.name.toLowerCase().includes(search) || i.desc.toLowerCase().includes(search);
      });
      if (items.length) sections.push({ cat: c, items: items });
    });
    return sections;
  }

  // ── Render menu list ──────────────────────────────────────────────────
  function renderMenu() {
    var listEl = document.getElementById("menuList");
    if (!listEl) return;

    // Update category counts
    Object.keys(MENU).forEach(function (c) {
      var el = document.getElementById("cnt-" + c);
      if (el) el.textContent = MENU[c].length;
    });
    var allEl = document.getElementById("cnt-all");
    if (allEl) allEl.textContent = Object.values(MENU).flat().length;

    var sections = getFilteredSections();
    if (!sections.length) {
      listEl.innerHTML =
        "<div style='padding:28px 16px;text-align:center;color:var(--mahogany-ghost)'>" +
        "<div style='font-size:2.5rem;opacity:.3;margin-bottom:10px'>🔍</div>" +
        "<p style='font-family:var(--font-display);font-style:italic;font-size:1rem'>No dishes found</p>" +
        "<small style='font-size:.75rem;opacity:.7'>Try a different filter or search term</small></div>";
      return;
    }

    var html = "";
    sections.forEach(function (sec) {
      if (App.state.category === "all") {
        html += "<div class='cat-section-header'>" + CAT_NAMES[sec.cat] + "</div>";
      }
      sec.items.forEach(function (item, idx) {
        var inCart = App.state.cart[item.id];
        var cartLabel = inCart
          ? "<span style='color:var(--emerald-hi);font-size:.65rem;font-weight:700;margin-left:4px'>✓ ×" + inCart.qty + "</span>"
          : "";
        var tagsHtml = item.tags.map(function (t) {
          return tagMarkup(t);
        }).join("");
        var delay = Math.min(idx * 0.04, 0.5).toFixed(2);

        html +=
          "<div class='menu-card" + (inCart ? " in-cart" : "") + "'" +
          " style='animation-delay:" + delay + "s'" +
          " onclick=\"Menu.openItemModal('" + item.id + "')\"" +
          " role='button' tabindex='0'" +
          " aria-label='" + App.escHtml(item.name) + ", $" + item.price.toFixed(2) + "'>" +
          "<div class='menu-card-top'>" +
          "<img class='menu-card-image' src='" + imageSrc(item) + "' alt='' loading='lazy' onerror=\"this.style.visibility='hidden'\">" +
          "<div class='menu-card-info'>" +
          "<div class='menu-card-name'>" + App.escHtml(item.name) + cartLabel + "</div>" +
          "<div class='menu-card-price'>$" + item.price.toFixed(2) + "</div>" +
          "</div></div>" +
          "<div class='menu-card-tags'>" + tagsHtml +
          "<span class='menu-card-meta'>⭐" + item.rating + " · " + item.prep + "min</span>" +
          "</div>" +
          "<button class='menu-card-add'" +
          " onclick=\"event.stopPropagation();Cart.addToCart('" + item.id + "',1)\"" +
          " title='Add to order' aria-label='Add " + App.escHtml(item.name) + " to order'>+</button>" +
          "</div>";
      });
    });
    listEl.innerHTML = html;

    // Keyboard nav for menu cards
    listEl.querySelectorAll(".menu-card").forEach(function (card) {
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); card.click(); }
      });
      // Premium mouse-following spotlight
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        card.style.setProperty("--mouse-x", x + "px");
        card.style.setProperty("--mouse-y", y + "px");
      });
    });
  }

  // ── Item modal ────────────────────────────────────────────────────────
  var _modalItemId = null;

  // Add photos by placing files in static/images/dishes/{item-id}.jpg (or by
  // adding an `image` URL to an item). Missing photos automatically fall back
  // to the dish emoji, so the menu remains usable while the photo library is
  // being prepared.
  var DISH_IMAGES = {
    sp1: "Hanan Dum Biryani.jpg", sp2: "Royal Nihari — Chef’s Pride.jpg", sp3: "Signature Cast-Iron Karahi.jpg",
    s1: "Chicken Tikka.jpg", s2: "Seekh Kebab.jpg", s3: "Crispy Samosa (3 pcs).jpg", s4: "Papri Chaat.jpg",
    s5: "Reshmi Kebab.jpg", s6: "Aloo Tikki (4 pcs).jpg", s7: "Dahi Bhalle.jpg", s8: "Bun Kebab.jpg",
    m1: "Chicken Karahi.jpg", m2: "Mutton Dum Biryani.jpg", m3: "Dal Makhani.jpg", m4: "Palak Gosht.jpg",
    m5: "Chicken Handi.jpg", m6: "Haleem.jpg", m7: "Aloo Gosht.jpg", m8: "Daal Tadka.jpg",
    m9: "Chicken Biryani.jpg", m10: "Paya (Trotters).jpg", m11: "Lahori Chargha.jpg", m12: "Saag Paneer.jpg",
    m13: "Keema Naan.jpg", m14: "Mutton Roghan Josh.jpg", d1: "Gulab Jamun (3 pcs).jpg", d2: "Kheer.jpg",
    d3: "Shahi Tukray.jpg", d4: "Gajar Halwa.jpg", d5: "Rasmalai.jpg", d6: "Kulfi (2 pcs).jpg",
    d7: "Zarda (Sweet Rice).jpg", dr1: "Mango Lassi.jpg", dr2: "Kashmiri Chai (Pink Tea).jpg",
    dr3: "Sweet Lassi.jpg", dr4: "Rooh Afza Sharbat.jpg", dr5: "Doodh Patti Chai.jpg",
    dr6: "Fresh Lime Soda.jpg", dr7: "Jaljeera.jpg", dr8: "Sugarcane Juice.jpg"
  };

  function imageSrc(item) {
    // The uploaded files use the dish name. Keep the one filename whose
    // apostrophe differs from the menu data as an explicit alias.
    var filename = item.imageFile || DISH_IMAGES[item.id] || item.name + ".jpg";
    if (item.id === "sp2") filename = "Royal Nihari — Chef’s Pride.jpg";
    // Resolve by item ID on the server to avoid deployment filename/case issues.
    return item.image || "/api/dish-image/" + encodeURIComponent(item.id);
  }

  function viewerImageMarkup(item) {
    return "<div class='dish-viewer' data-angle='0' data-zoom='1' tabindex='0' aria-label='Interactive view of " + App.escHtml(item.name) + "'>" +
      "<div class='dish-viewer-glow'></div>" +
      "<div class='dish-viewer-orbit'></div>" +
      "<div class='dish-viewer-stage' id='dishViewerStage'>" +
      "<img class='dish-viewer-image' id='dishViewerImage' src='" + imageSrc(item) + "' alt='" + App.escHtml(item.name) + "' onerror=\"this.style.display='none';this.nextElementSibling.style.display='grid'\">" +
      "<div class='dish-viewer-fallback' aria-hidden='true'>" + detailIcon("chef") + "</div>" +
      "</div>" +
      "<div class='dish-viewer-caption'><span>Interactive presentation</span><span>Drag to rotate · scroll to zoom</span></div>" +
      "</div>";
  }

  function openItemModal(id) {
    var item = ALL_ITEMS[id];
    if (!item) return;
    _modalItemId = id;

    var overlay = document.getElementById("itemOverlay");
    var header = document.getElementById("modalHeader");
    var body = document.getElementById("modalBody");
    if (!overlay || !header || !body) return;

    header.innerHTML =
      viewerImageMarkup(item) +
      "<div class='modal-title-block'>" +
      "<div class='modal-title'>" + App.escHtml(item.name) + "</div>" +
      "<div class='modal-price'>$" + item.price.toFixed(2) + "</div>" +
      "</div>";

    var allergenText = item.allergens.length ? item.allergens.join(", ") : "None declared";
    var tagsHtml = item.tags.map(function (t) {
      return tagMarkup(t);
    }).join("");
    var currentQty = App.state.cart[id] ? App.state.cart[id].qty : 1;
    var existingNote = App.state.cart[id] ? (App.state.cart[id].note || "") : "";
    var ratingHtml = detailIcon("star") + "<span class='rating-score'>" + Number(item.rating).toFixed(1) + "/5</span>" +
      " <span style='font-size:.7rem;opacity:.7'>(" + item.votes + ")</span>";

    body.innerHTML =
      "<p class='modal-desc'>" + App.escHtml(item.desc) + "</p>" +
      "<div class='modal-meta-grid'>" +
      "<div class='meta-pill'><span class='meta-pill-icon'>" + detailIcon("flame") + "</span>" +
      "<div><div class='meta-pill-label'>Calories</div><div class='meta-pill-val'>" + item.calories + " kcal</div></div></div>" +
      "<div class='meta-pill'><span class='meta-pill-icon'>" + detailIcon("clock") + "</span>" +
      "<div><div class='meta-pill-label'>Prep Time</div><div class='meta-pill-val'>~" + item.prep + " min</div></div></div>" +
      "<div class='meta-pill'><span class='meta-pill-icon'>" + detailIcon("star") + "</span>" +
      "<div><div class='meta-pill-label'>Rating</div><div class='meta-pill-val'>" + ratingHtml + "</div></div></div>" +
      "<div class='meta-pill'><span class='meta-pill-icon'>" + detailIcon("shield") + "</span>" +
      "<div><div class='meta-pill-label'>Certified</div><div class='meta-pill-val'>100% Halal</div></div></div>" +
      "</div>" +
      "<div class='modal-tags'>" + tagsHtml + "</div>" +
      "<div class='modal-allergens'><strong>" + detailIcon("warning") + "Allergens:</strong> " + allergenText + "</div>" +
      "<textarea class='modal-note-input' id='modalNote'" +
      " placeholder='Special requests? e.g. extra spicy, no coriander, less salt…'" +
      " aria-label='Special instructions'>" + App.escHtml(existingNote) + "</textarea>" +
      "<div class='modal-add-row'>" +
      "<div class='modal-qty-ctrl'>" +
      "<button class='modal-qty-btn' onclick='Menu.changeModalQty(-1)' aria-label='Decrease'>−</button>" +
      "<span class='modal-qty-num' id='modalQty'>" + currentQty + "</span>" +
      "<button class='modal-qty-btn' onclick='Menu.changeModalQty(1)' aria-label='Increase'>+</button>" +
      "</div>" +
      "<button class='modal-add-btn' onclick=\"Menu.addFromModal('" + id + "')\">" +
      "<span>" + (App.state.cart[id] ? "Update Order" : "Add to Order") + " · $" + item.price.toFixed(2) + "</span>" +
      "</button></div>";

    overlay.classList.add("open");
    initDishViewer();
  }

  function initDishViewer() {
    var viewer = document.querySelector("#itemOverlay.open .dish-viewer");
    var stage = document.getElementById("dishViewerStage");
    if (!viewer || !stage || viewer.dataset.ready) return;
    viewer.dataset.ready = "1";
    var angle = 0;
    var zoom = 1;
    var dragging = false;
    var lastX = 0;

    function paint() {
      stage.style.setProperty("--dish-rotate", angle + "deg");
      stage.style.setProperty("--dish-zoom", zoom);
    }
    function pointX(event) { return event.touches ? event.touches[0].clientX : event.clientX; }
    function start(event) {
      dragging = true;
      lastX = pointX(event);
      viewer.classList.add("is-dragging");
      if (event.cancelable) event.preventDefault();
    }
    function move(event) {
      if (!dragging) return;
      var x = pointX(event);
      angle = Math.max(-18, Math.min(18, angle + (x - lastX) * 0.22));
      lastX = x;
      paint();
      if (event.cancelable) event.preventDefault();
    }
    function end() { dragging = false; viewer.classList.remove("is-dragging"); }
    viewer.addEventListener("mousedown", start);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", end);
    viewer.addEventListener("touchstart", start, { passive: false });
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", end);
    viewer.addEventListener("wheel", function (event) {
      event.preventDefault();
      zoom = Math.max(.82, Math.min(1.28, zoom + (event.deltaY < 0 ? .06 : -.06)));
      paint();
    }, { passive: false });
    viewer.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") angle = Math.max(-18, angle - 3);
      if (event.key === "ArrowRight") angle = Math.min(18, angle + 3);
      if (event.key === "Home") { angle = 0; zoom = 1; }
      paint();
    });
    paint();
  }

  function changeModalQty(delta) {
    var el = document.getElementById("modalQty");
    if (!el) return;
    var q = Math.max(1, Math.min(20, parseInt(el.textContent) + delta));
    el.textContent = q;
    el.style.transform = delta > 0 ? "scale(1.4)" : "scale(0.75)";
    el.style.color = delta > 0 ? "var(--emerald-hi)" : "var(--spice)";
    setTimeout(function () {
      el.style.transition = "all 0.25s var(--ease-spring)";
      el.style.transform = "scale(1)";
      el.style.color = "";
    }, 10);
  }

  function addFromModal(id) {
    var item = ALL_ITEMS[id];
    if (!item) return;
    var qty = parseInt(document.getElementById("modalQty")?.textContent) || 1;
    var note = (document.getElementById("modalNote")?.value || "").trim();
    var isNew = !App.state.cart[id];

    if (App.state.cart[id]) {
      App.state.cart[id].qty = qty;
      App.state.cart[id].note = note;
    } else {
      App.state.cart[id] = { ...item, qty, note };
    }

    Cart.renderCart();
    renderMenu();
    App.closeOverlay(document.getElementById("itemOverlay"));

    var badge = document.getElementById("cartBadge");
    if (badge) { badge.classList.remove("bump"); void badge.offsetWidth; badge.classList.add("bump"); }

    App.showToast("✅ " + item.emoji + " " + item.name + " × " + qty + (isNew ? " added!" : " updated!"), "success");
    App.updateProgress(1);
  }

  return { MENU, ALL_ITEMS, CAT_NAMES, tagClass, tagLabel, imageSrc, renderMenu, openItemModal, changeModalQty, addFromModal };

})();
