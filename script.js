const products = [...document.querySelectorAll("[data-product-grid] .asset-card")];
const filterButtons = [...document.querySelectorAll("[data-filter]")];
const searchInput = document.querySelector("[data-search]");
const cartToggle = document.querySelector("[data-cart-toggle]");
const cartClose = document.querySelector("[data-cart-close]");
const cartDrawer = document.querySelector("[data-cart-drawer]");
const cartItems = document.querySelector("[data-cart-items]");
const cartCount = document.querySelector("[data-cart-count]");
const cartTotal = document.querySelector("[data-cart-total]");
const checkoutButton = document.querySelector("[data-checkout]");
const cartNote = document.querySelector("[data-cart-note]");
const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");

const cart = new Map();
let activeFilter = "all";

function matchesProduct(card) {
  const category = card.dataset.category || "";
  const name = card.dataset.name || "";
  const query = searchInput.value.trim().toLowerCase();
  const filterMatch = activeFilter === "all" || category.includes(activeFilter);
  const queryMatch = !query || name.includes(query) || card.textContent.toLowerCase().includes(query);
  return filterMatch && queryMatch;
}

function applyFilters() {
  products.forEach((card) => {
    card.hidden = !matchesProduct(card);
  });
}

function renderCart() {
  const lines = [...cart.values()];
  const totalItems = lines.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = lines.reduce((sum, item) => sum + item.quantity * item.price, 0);

  cartCount.textContent = totalItems;
  cartTotal.textContent = `$${totalPrice}`;
  checkoutButton.disabled = !lines.length;

  if (!lines.length) {
    cartItems.innerHTML = '<p class="empty-cart">No assets added yet.</p>';
    cartNote.textContent = "Checkout happens on each product page through protected Payhip delivery.";
    return;
  }

  cartItems.innerHTML = lines.map((item) => `
    <div class="cart-line">
      <div>
        <strong>${item.name}</strong>
        <span>Qty ${item.quantity} · $${item.price} each</span>
        <div class="cart-line-actions" aria-label="${item.name} cart controls">
          <button type="button" data-cart-decrease="${item.name}">−</button>
          <button type="button" data-cart-increase="${item.name}">+</button>
          <button type="button" data-cart-remove="${item.name}">Remove</button>
        </div>
      </div>
      <strong>$${item.quantity * item.price}</strong>
    </div>
  `).join("");

  cartNote.textContent = lines.length === 1
    ? "Checkout will open this product page so you can choose GLB or OBJ through Payhip."
    : "Checkout one product at a time from its product page to keep protected delivery tied to the right file.";
}

function openCart() {
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("active", item === button));
    applyFilters();
  });
});

searchInput.addEventListener("input", applyFilters);

document.querySelectorAll("[data-add-cart]").forEach((button) => {
  button.addEventListener("click", () => {
    const name = button.dataset.name;
    const price = Number(button.dataset.price);
    const url = button.dataset.url;
    const existing = cart.get(name);
    cart.set(name, {
      name,
      price,
      url,
      quantity: existing ? existing.quantity + 1 : 1
    });
    renderCart();
    openCart();
  });
});

cartItems.addEventListener("click", (event) => {
  const decrease = event.target.closest("[data-cart-decrease]");
  const increase = event.target.closest("[data-cart-increase]");
  const remove = event.target.closest("[data-cart-remove]");
  const name = decrease?.dataset.cartDecrease || increase?.dataset.cartIncrease || remove?.dataset.cartRemove;

  if (!name || !cart.has(name)) {
    return;
  }

  const item = cart.get(name);

  if (remove) {
    cart.delete(name);
  } else if (decrease) {
    item.quantity -= 1;
    if (item.quantity <= 0) {
      cart.delete(name);
    } else {
      cart.set(name, item);
    }
  } else if (increase) {
    item.quantity += 1;
    cart.set(name, item);
  }

  renderCart();
});

checkoutButton.addEventListener("click", () => {
  const lines = [...cart.values()];

  if (!lines.length) {
    cartNote.textContent = "Add an asset before checkout.";
    return;
  }

  if (lines.length === 1 && lines[0].url) {
    window.location.href = lines[0].url;
    return;
  }

  cartNote.textContent = "Please checkout one asset at a time from its product page so the GLB/OBJ Payhip delivery stays correct.";
});

document.querySelectorAll("[data-href]").forEach((card) => {
  card.addEventListener("click", (event) => {
    if (event.target.closest("a, button")) {
      return;
    }
    window.location.href = card.dataset.href;
  });
});

cartToggle.addEventListener("click", openCart);
cartClose.addEventListener("click", closeCart);

cartDrawer.addEventListener("click", (event) => {
  if (event.target === cartDrawer) {
    closeCart();
  }
});

navToggle.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("nav-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

nav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    document.body.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
  }
});

renderCart();
