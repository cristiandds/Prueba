/**
 * Ricos Burger — lógica del carrito, filtros y modal (vanilla JS)
 */

(function () {
  "use strict";

  /** @typedef {"clasica"|"premium"|"picante"|"vegetariana"} BurgerType */

  /**
   * @typedef {Object} Product
   * @property {number} id
   * @property {string} name
   * @property {string} shortDesc
   * @property {string} longDesc
   * @property {number} price
   * @property {string} image
   * @property {BurgerType} type
   * @property {string} typeLabel
   */

  /** @type {Product[]} */
  const PRODUCTS = [
    {
      id: 1,
      name: "Clásica Ricos",
      shortDesc: "Doble carne, cheddar, lechuga, tomate y salsa especial.",
      longDesc:
        "Nuestra burger insignia: dos medallones de carne 100% vacuna a la parrilla, doble cheddar derretido, lechuga fresca, tomate y cebolla morada, con nuestra salsa secreta en pan brioche tostado.",
      price: 8500,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
      type: "clasica",
      typeLabel: "Clásica",
    },
    {
      id: 2,
      name: "Cheese Bacon",
      shortDesc: "Carne, bacon crocante y abundante queso cheddar.",
      longDesc:
        "Carne jugosa, bacon ahumado bien crocante, triple capa de cheddar y mayonesa de ajo. Ideal si buscás sabor intenso sin complicaciones.",
      price: 9200,
      image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&q=80",
      type: "clasica",
      typeLabel: "Clásica",
    },
    {
      id: 3,
      name: "Smash BBQ",
      shortDesc: "Smash burger con cebolla caramelizada y BBQ ahumada.",
      longDesc:
        "Técnica smash para costra perfecta, cebolla caramelizada lentamente, pepinillos, queso americano y salsa BBQ casera con un toque ahumado.",
      price: 9800,
      image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&q=80",
      type: "premium",
      typeLabel: "Premium",
    },
    {
      id: 4,
      name: "Blue Premium",
      shortDesc: "Carne premium, queso azul y cebolla confitada.",
      longDesc:
        "Medallón de 180 g de corte seleccionado, queso azul cremoso, cebolla confitada al vino tinto y rúcula fresca. Una experiencia gourmet en formato burger.",
      price: 11500,
      image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&q=80",
      type: "premium",
      typeLabel: "Premium",
    },
    {
      id: 5,
      name: "Inferno",
      shortDesc: "Jalapeños, salsa picante y pepper jack.",
      longDesc:
        "Para valientes: jalapeños frescos, salsa picante de la casa, queso pepper jack y un toque de chipotle. Advertencia: pica de verdad.",
      price: 9400,
      image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600&q=80",
      type: "picante",
      typeLabel: "Picante",
    },
    {
      id: 6,
      name: "Chili Fire",
      shortDesc: "Chili con carne, nachos y salsa habanero.",
      longDesc:
        "Inspiración tex-mex: chili de carne casero, chips de nachos, queso fundido y salsa habanero. Textura crocante y fuego controlado.",
      price: 10100,
      image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&q=80",
      type: "picante",
      typeLabel: "Picante",
    },
    {
      id: 7,
      name: "Garden Veggie",
      shortDesc: "Medallón de legumbres, palta y chimichurri.",
      longDesc:
        "Opción vegetariana: medallón de legumbres y especias, palta en rodajas, brotes verdes, tomate y chimichurri casero. Ligera y sabrosa.",
      price: 8800,
      image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=600&q=80",
      type: "vegetariana",
      typeLabel: "Vegetariana",
    },
    {
      id: 8,
      name: "Portobello Stack",
      shortDesc: "Portobello grillado, mozzarella y pesto.",
      longDesc:
        "Portobello marinado a la parrilla, mozzarella fresca, tomate seco, pesto genovés y rúcula. Hamburguesa vegetariana con estilo italiano.",
      price: 9100,
      image: "https://images.unsplash.com/photo-1550315083-f6631e2ef49f?w=600&q=80",
      type: "vegetariana",
      typeLabel: "Vegetariana",
    },
  ];

  const WHATSAPP_COMPRA_URL = "https://w.app/xu5z3y";

  const formatPrice = (n) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

  /** @type {"todas"|BurgerType} */
  let activeFilter = "todas";

  /** @type {Map<number, number>} productId -> quantity */
  const cart = new Map();

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const els = {
    productsGrid: $("#productsGrid"),
    cartBtn: $("#cartBtn"),
    cartCount: $("#cartCount"),
    cartOverlay: $("#cartOverlay"),
    cartDrawer: $("#cartDrawer"),
    cartClose: $("#cartClose"),
    cartList: $("#cartList"),
    cartEmpty: $("#cartEmpty"),
    cartTotal: $("#cartTotal"),
    checkoutBtn: $("#checkoutBtn"),
    productModal: $("#productModal"),
    modalBackdrop: $("#modalBackdrop"),
    modalClose: $("#modalClose"),
    modalInner: $("#modalInner"),
    navToggle: $("#navToggle"),
    mainNav: $("#mainNav"),
    year: $("#year"),
  };

  function getProductById(id) {
    return PRODUCTS.find((p) => p.id === id);
  }

  function getCartItemCount() {
    let n = 0;
    cart.forEach((qty) => {
      n += qty;
    });
    return n;
  }

  function getCartTotal() {
    let total = 0;
    cart.forEach((qty, productId) => {
      const p = getProductById(productId);
      if (p) total += p.price * qty;
    });
    return total;
  }

  function updateCartUI() {
    const count = getCartItemCount();
    els.cartCount.textContent = String(count);
    els.cartCount.style.display = count > 0 ? "" : "none";
    els.cartTotal.textContent = formatPrice(getCartTotal());
    els.checkoutBtn.disabled = count === 0;

    const lines = [];
    cart.forEach((qty, productId) => {
      const p = getProductById(productId);
      if (p) lines.push({ product: p, qty });
    });

    if (lines.length === 0) {
      els.cartList.innerHTML = "";
      els.cartEmpty.hidden = false;
      return;
    }

    els.cartEmpty.hidden = true;
    els.cartList.innerHTML = lines
      .map(
        ({ product: p, qty }) => `
      <li class="cart-item" data-id="${p.id}">
        <img class="cart-item__img" src="${p.image}" alt="" width="64" height="64" />
        <div>
          <p class="cart-item__name">${escapeHtml(p.name)}</p>
          <p class="cart-item__meta">${qty} × ${formatPrice(p.price)} = ${formatPrice(p.price * qty)}</p>
        </div>
        <button type="button" class="cart-item__remove" data-remove="${p.id}">Quitar</button>
      </li>
    `
      )
      .join("");

    $$("[data-remove]", els.cartList).forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.getAttribute("data-remove"));
        removeFromCart(id);
      });
    });
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function addToCart(productId) {
    const prev = cart.get(productId) || 0;
    cart.set(productId, prev + 1);
    updateCartUI();
  }

  function removeFromCart(productId) {
    cart.delete(productId);
    updateCartUI();
  }

  function openCart() {
    els.cartOverlay.hidden = false;
    els.cartDrawer.classList.add("is-open");
    els.cartOverlay.classList.add("is-open");
    els.cartDrawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("cart-open");
  }

  function closeCart() {
    els.cartDrawer.classList.remove("is-open");
    els.cartOverlay.classList.remove("is-open");
    els.cartDrawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("cart-open");
    window.setTimeout(() => {
      if (!els.cartDrawer.classList.contains("is-open")) els.cartOverlay.hidden = true;
    }, 350);
  }

  function openModal(product) {
    els.modalInner.innerHTML = `
      <img class="modal__img" src="${product.image}" alt="${escapeHtml(product.name)}" width="560" height="350" />
      <div class="modal__body">
        <h3 id="modalTitle">${escapeHtml(product.name)}</h3>
        <p class="modal__price">${formatPrice(product.price)}</p>
        <p>${escapeHtml(product.longDesc)}</p>
        <div style="display:flex;gap:0.75rem;flex-wrap:wrap;">
          <button type="button" class="btn btn--primary" data-modal-add="${product.id}">Agregar al carrito</button>
          <button type="button" class="btn btn--ghost" data-modal-close>Seguir viendo</button>
        </div>
      </div>
    `;
    const addBtn = $("[data-modal-add]", els.modalInner);
    const closeSecondary = $("[data-modal-close]", els.modalInner);
    if (addBtn) {
      addBtn.addEventListener("click", () => {
        addToCart(product.id);
        closeModal();
        openCart();
      });
    }
    if (closeSecondary) closeSecondary.addEventListener("click", closeModal);

    els.productModal.hidden = false;
    document.body.classList.add("modal-open");
    els.modalClose.focus();
  }

  function closeModal() {
    els.productModal.hidden = true;
    document.body.classList.remove("modal-open");
    els.modalInner.innerHTML = "";
  }

  function filterProducts() {
    if (activeFilter === "todas") return PRODUCTS;
    return PRODUCTS.filter((p) => p.type === activeFilter);
  }

  function renderProducts() {
    const list = filterProducts();
    if (list.length === 0) {
      els.productsGrid.innerHTML = '<p class="section-head__subtitle" style="grid-column:1/-1;">No hay productos en esta categoría.</p>';
      return;
    }

    els.productsGrid.innerHTML = list
      .map(
        (p) => `
      <article class="product-card" data-product-id="${p.id}">
        <div class="product-card__image-wrap" data-open-modal="${p.id}" role="button" tabindex="0" aria-label="Ver detalles de ${escapeHtml(p.name)}">
          <img src="${p.image}" alt="${escapeHtml(p.name)}" width="400" height="300" loading="lazy" />
          <span class="product-card__badge">${escapeHtml(p.typeLabel)}</span>
        </div>
        <div class="product-card__body">
          <h3 class="product-card__title">${escapeHtml(p.name)}</h3>
          <p class="product-card__desc">${escapeHtml(p.shortDesc)}</p>
          <div class="product-card__footer">
            <span class="product-card__price">${formatPrice(p.price)}</span>
            <div class="product-card__actions">
              <button type="button" class="btn btn--ghost btn--small" data-open-modal="${p.id}">Detalles</button>
              <a href="${WHATSAPP_COMPRA_URL}" target="_blank" rel="noopener noreferrer" class="btn btn--primary btn--small">Comprar</a>
            </div>
          </div>
        </div>
      </article>
    `
      )
      .join("");

    $$("[data-open-modal]", els.productsGrid).forEach((el) => {
      const handler = () => {
        const id = Number(el.getAttribute("data-open-modal"));
        const p = getProductById(id);
        if (p) openModal(p);
      };
      el.addEventListener("click", handler);
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handler();
        }
      });
    });
  }

  function setupFilters() {
    $$(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        $$(".filter-btn").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        const f = btn.getAttribute("data-filter");
        activeFilter = f === "todas" ? "todas" : /** @type {BurgerType} */ (f);
        renderProducts();
      });
    });
  }

  function setupNav() {
    els.navToggle.addEventListener("click", () => {
      const open = els.mainNav.classList.toggle("is-open");
      els.navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    $$(".nav__link", els.mainNav).forEach((link) => {
      link.addEventListener("click", () => {
        els.mainNav.classList.remove("is-open");
        els.navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function setupCartDrawer() {
    els.cartBtn.addEventListener("click", openCart);
    els.cartClose.addEventListener("click", closeCart);
    els.cartOverlay.addEventListener("click", closeCart);

    els.checkoutBtn.addEventListener("click", () => {
      if (getCartItemCount() === 0) return;
      alert(
        `¡Gracias por tu pedido en Ricos Burger!\n\nTotal: ${formatPrice(getCartTotal())}\n\nPronto implementaremos pago online. Por ahora llamanos al +54 11 2345-6789.`
      );
    });
  }

  function setupModal() {
    els.modalClose.addEventListener("click", closeModal);
    els.modalBackdrop.addEventListener("click", closeModal);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (!els.productModal.hidden) closeModal();
        else closeCart();
      }
    });
  }

  if (els.year) els.year.textContent = String(new Date().getFullYear());

  updateCartUI();
  renderProducts();
  setupFilters();
  setupNav();
  setupCartDrawer();
  setupModal();
})();
