const menu = [
  { id: 1, name: "Sunshine Poke", category: "plates", price: 320, description: "Salmon, avocado, mango, sesame rice, ginger ponzu", image: "public/assets/atiri-food/poke-bowl.png" },
  { id: 2, name: "Truffle Smash", category: "plates", price: 360, description: "Double beef, cheddar, pickles, truffle sauce, brioche", image: "public/assets/atiri-food/truffle-smash-burger.png" },
  { id: 3, name: "Green Coast Curry", category: "plates", price: 290, description: "Coconut green curry, seasonal vegetables, jasmine rice", image: "public/assets/atiri-food/thai-green-curry.png" },
  { id: 4, name: "Crispy Wings", category: "bites", price: 220, description: "Sticky tamarind glaze, toasted sesame, lime", image: "public/assets/atiri-food/chicken-wings.png" },
  { id: 5, name: "Golden Truffle Fries", category: "bites", price: 180, description: "Parmesan, sea salt, herbs, house truffle dip", image: "public/assets/atiri-food/truffle-fries.png" },
  { id: 6, name: "Sunset Spritz", category: "drinks", price: 160, description: "Strawberry, matcha, coconut cloud, crushed ice", image: "public/assets/atiri-food/iced-matcha-strawberry.png" },
  { id: 7, name: "Mango Coco Bowl", category: "sweet", price: 240, description: "Frozen coconut yogurt, mango, granola, passionfruit", image: "public/assets/atiri-food/frozen-yoghurt-bowl.png" },
  { id: 8, name: "Atirimisu", category: "sweet", price: 210, description: "Espresso, mascarpone cloud, dark cocoa, sea salt", image: "public/assets/atiri-food/atirimisu.png" },
  { id: 9, name: "Summer Rolls", category: "bites", price: 190, description: "Fresh herbs, vegetables, rice paper, bright chili dip", image: "public/assets/atiri-food/spring-rolls.png" }
];

const menuGrid = document.querySelector(".menu-grid");
const filters = document.querySelectorAll(".filter");
const overlay = document.querySelector(".order-overlay");
const orderItems = document.querySelector(".order-items");
const emptyState = document.querySelector(".order-empty");
const bagCount = document.querySelector(".bag-count");
const total = document.querySelector(".order-total strong");
const sendButton = document.querySelector(".send-order");
const toast = document.querySelector(".toast");
let order = [];
let activeFilter = "all";

const money = value => `THB ${value.toLocaleString()}`;

function renderMenu() {
  const items = activeFilter === "all" ? menu : menu.filter(item => item.category === activeFilter);
  menuGrid.innerHTML = items.map(item => `
    <article class="menu-card" data-id="${item.id}" tabindex="0" aria-label="Add ${item.name} to your order">
      <img src="${item.image}" alt="${item.name}" loading="lazy">
      <div class="card-top"><h3>${item.name}</h3><span class="price">${money(item.price)}</span></div>
      <p>${item.description}</p>
      <button class="plus" type="button" data-id="${item.id}" aria-label="Add ${item.name}">+</button>
    </article>
  `).join("");
}

function renderOrder() {
  const count = order.reduce((sum, item) => sum + item.quantity, 0);
  const amount = order.reduce((sum, item) => sum + item.price * item.quantity, 0);
  bagCount.textContent = count;
  total.textContent = money(amount);
  emptyState.classList.toggle("hidden", order.length > 0);
  sendButton.disabled = order.length === 0;
  orderItems.innerHTML = order.map(item => `
    <div class="order-item">
      <img src="${item.image}" alt="">
      <div><strong>${item.name}</strong><p>${item.quantity} × ${money(item.price)}</p></div>
      <button class="remove-item" data-remove="${item.id}" type="button" aria-label="Remove one ${item.name}">−</button>
    </div>
  `).join("");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove("show"), 1700);
}

function addItem(id) {
  const item = menu.find(product => product.id === id);
  const existing = order.find(product => product.id === id);
  if (existing) existing.quantity += 1;
  else order.push({ ...item, quantity: 1 });
  renderOrder();
  showToast(`${item.name} added`);
}

function removeItem(id) {
  const existing = order.find(item => item.id === id);
  if (!existing) return;
  existing.quantity -= 1;
  order = order.filter(item => item.quantity > 0);
  renderOrder();
}

function openOrder() {
  overlay.classList.add("open");
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("drawer-open");
  document.querySelector(".close-order").focus();
}

function closeOrder() {
  overlay.classList.remove("open");
  overlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("drawer-open");
}

filters.forEach(button => button.addEventListener("click", () => {
  activeFilter = button.dataset.filter;
  filters.forEach(filter => filter.classList.toggle("active", filter === button));
  renderMenu();
}));

menuGrid.addEventListener("click", event => {
  const card = event.target.closest(".menu-card");
  if (card) addItem(Number(card.dataset.id));
});
menuGrid.addEventListener("keydown", event => {
  if ((event.key === "Enter" || event.key === " ") && event.target.matches(".menu-card")) {
    event.preventDefault();
    addItem(Number(event.target.dataset.id));
  }
});

document.querySelector(".bag-button").addEventListener("click", openOrder);
document.querySelector(".close-order").addEventListener("click", closeOrder);
overlay.addEventListener("click", event => { if (event.target === overlay) closeOrder(); });
document.addEventListener("keydown", event => { if (event.key === "Escape") closeOrder(); });
orderItems.addEventListener("click", event => {
  const button = event.target.closest("[data-remove]");
  if (button) removeItem(Number(button.dataset.remove));
});

sendButton.addEventListener("click", () => {
  const lines = order.map(item => `• ${item.name} × ${item.quantity} — ${money(item.price * item.quantity)}`);
  const amount = order.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const message = ["Hi Summer Bar! I'd like to order:", "", ...lines, "", `Total: ${money(amount)}`].join("\n");
  window.open(`https://wa.me/66838744818?text=${encodeURIComponent(message)}`, "_blank", "noopener");
});

renderMenu();
renderOrder();
