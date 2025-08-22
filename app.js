// Proyecto Final: Simulador Ecommerce
// Requisitos cubiertos:
// - Datos remotos simulados con JSON (fetch a /data/products.json)
// - HTML interactivo generado desde JS (catálogo + carrito)
// - Eventos, funciones con parámetros, arrays/objetos, clases, localStorage
// - Librería externa: SweetAlert2 (reemplaza alert/prompt/confirm)
// - Flujo completo de compra con validación y resumen

(() => {
  'use strict';

  // ---------- Utils ----------
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const money = (n) => n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
  const uid = () => 'N' + Date.now().toString(36);

  // ---------- State ----------
  let allProducts = [];
  let filteredProducts = [];

  class Cart {
    constructor() {
      this.items = [];
      this.load();
    }
    add(product, qty = 1) {
      const found = this.items.find(i => i.id === product.id);
      if (found) {
        const newQty = Math.min(found.qty + qty, product.stock);
        found.qty = newQty;
      } else {
        this.items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          qty: Math.min(qty, product.stock),
          stock: product.stock
        });
      }
      this.save();
      renderCart();
      Swal.fire({ icon: 'success', title: 'Agregado al carrito', timer: 900, showConfirmButton: false });
    }
    remove(id) {
      this.items = this.items.filter(i => i.id !== id);
      this.save();
      renderCart();
    }
    setQty(id, qty) {
      const it = this.items.find(i => i.id === id);
      if (!it) return;
      it.qty = Math.max(1, Math.min(qty, it.stock));
      this.save();
      renderCart();
    }
    clear() {
      this.items = [];
      this.save();
      renderCart();
    }
    count() { return this.items.reduce((a, b) => a + b.qty, 0); }
    total() { return this.items.reduce((a, b) => a + b.qty * b.price, 0); }
    save() { localStorage.setItem('neoshop.cart', JSON.stringify(this.items)); }
    load() {
      try { this.items = JSON.parse(localStorage.getItem('neoshop.cart')) || []; }
      catch { this.items = []; }
    }
  }
  const cart = new Cart();

  // ---------- Fetch data ----------
  async function loadProducts() {
    const res = await fetch('data/products.json');
    const data = await res.json();
    allProducts = data.products || [];
    filteredProducts = allProducts.slice();
    hydrateCategoryFilter();
    renderProducts(filteredProducts);
  }

  // ---------- Filters ----------
  function hydrateCategoryFilter() {
    const set = new Set(allProducts.map(p => p.category));
    const select = $('#category');
    select.innerHTML = '<option value="all">Todas las categorías</option>' +
      Array.from(set).map(c => `<option value="${c}">${c}</option>`).join('');
  }
  function applyFilters() {
    const q = $('#search').value.trim().toLowerCase();
    const cat = $('#category').value;
    const sort = $('#sort').value;
    filteredProducts = allProducts.filter(p => {
      const okText = !q || (p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
      const okCat = (cat === 'all') || p.category === cat;
      return okText && okCat;
    });
    switch (sort) {
      case 'price-asc': filteredProducts.sort((a,b)=>a.price-b.price); break;
      case 'price-desc': filteredProducts.sort((a,b)=>b.price-a.price); break;
      case 'name-asc': filteredProducts.sort((a,b)=>a.name.localeCompare(b.name)); break;
      case 'name-desc': filteredProducts.sort((a,b)=>b.name.localeCompare(a.name)); break;
      default: /* relevance -> no-op */ break;
    }
    renderProducts(filteredProducts);
  }

  // ---------- Render ----------
  function renderProducts(list) {
    const wrap = $('#products');
    if (!list.length) {
      wrap.innerHTML = `<div class="empty">No se encontraron productos para tu búsqueda.</div>`;
      wrap.setAttribute('aria-busy', 'false');
      return;
    }
    wrap.innerHTML = list.map(p => `
      <article class="card">
        <img src="${p.image}" alt="${p.name}">
        <div class="body">
          <div class="tag">${p.category}</div>
          <h3 style="margin:0">${p.name}</h3>
          <div class="rating">★ ${p.rating.toFixed(1)} · Stock: ${p.stock}</div>
          <div class="price">${p.price > 0 ? money(p.price) : "A confirmar"}</div>
          <button class="add" data-id="${p.id}" aria-label="Agregar ${p.name} al carrito" ${p.price > 0 ? "" : "disabled"}>${p.price > 0 ? "Agregar" : "Definir precio"}</button>
        </div>
      </article>
    `).join('');
    wrap.setAttribute('aria-busy', 'false');
  }

  function renderCart() {
    $('#cart-count').textContent = cart.count();
    $('#cart-total').textContent = money(cart.total());
    const list = $('#cart-list');
    if (cart.items.length === 0) {
      list.innerHTML = `<div class="empty">Tu carrito está vacío.</div>`;
      return;
    }
    list.innerHTML = cart.items.map(it => `
      <div class="cart-item">
        <img src="${it.image}" alt="${it.name}">
        <div>
          <div style="font-weight:700">${it.name}</div>
          <div class="tag">Precio: ${money(it.price)}</div>
          <div class="qty">
            <label for="qty-${it.id}">Cantidad</label>
            <input id="qty-${it.id}" data-id="${it.id}" type="number" min="1" max="${it.stock}" value="${it.qty}">
          </div>
        </div>
        <div style="display:grid;gap:6px;justify-items:end">
          <button class="remove" data-id="${it.id}">Quitar</button>
          <div style="font-weight:700">${money(it.qty * it.price)}</div>
        </div>
      </div>
    `).join('');
  }

  // ---------- Cart panel toggle ----------
  function openCart() {
    const panel = $('#cart-panel');
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    $('#cart-toggle').setAttribute('aria-expanded', 'true');
  }
  function closeCart() {
    const panel = $('#cart-panel');
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    $('#cart-toggle').setAttribute('aria-expanded', 'false');
  }

  // ---------- Checkout ----------
  function openCheckout() {
    if (cart.items.length === 0) {
      Swal.fire({ icon: 'info', title: 'Tu carrito está vacío', text: 'Agregá productos para continuar.' });
      return;
    }
    $('#checkout-modal').classList.add('open');
    $('#name').focus();
  }
  function closeCheckout() {
    $('#checkout-modal').classList.remove('open');
  }

  async function handlePay(e) {
    e.preventDefault();
    const form = new FormData($('#checkout-form'));
    const data = Object.fromEntries(form.entries());
    if (!$('#terms').checked) {
      Swal.fire({ icon: 'warning', title: 'Aceptá los términos', text: 'Para continuar debés aceptar los términos y condiciones.' });
      return;
    }
    // Simular procesamiento asíncrono
    await Swal.fire({
      title: 'Procesando pago…',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });
  }

  // ---------- Order submission with summary ----------
  async function submitOrder() {
    const form = new FormData($('#checkout-form'));
    const data = Object.fromEntries(form.entries());
    const orderId = uid();
    const order = {
      id: orderId,
      when: new Date().toISOString(),
      buyer: { name: data.name, email: data.email, address: data.address, payment: data.payment, delivery: data.delivery },
      items: cart.items.map(i => ({ id: i.id, name: i.name, qty: i.qty, price: i.price })),
      total: cart.total()
    };
    // Persist simple history
    const history = JSON.parse(localStorage.getItem('neoshop.orders') || '[]');
    history.push(order);
    localStorage.setItem('neoshop.orders', JSON.stringify(history));

    cart.clear();
    closeCheckout();
    await Swal.fire({
      icon: 'success',
      title: 'Compra confirmada',
      html: `
        <div style="text-align:left">
          <p><strong>Orden:</strong> ${order.id}</p>
          <p><strong>Comprador:</strong> ${order.buyer.name} (${order.buyer.email})</p>
          <p><strong>Envío:</strong> ${order.buyer.delivery} · <strong>Pago:</strong> ${order.buyer.payment}</p>
          <hr>
          <div>${order.items.map(i => `• ${i.qty}× ${i.name} — ${money(i.price * i.qty)}`).join('<br>')}</div>
          <hr>
          <p style="font-size:18px"><strong>Total:</strong> ${money(order.total)}</p>
        </div>
      `
    });
  }

  // ---------- Event wiring ----------
  function wire() {
    // Filters
    $('#search').addEventListener('input', applyFilters);
    $('#category').addEventListener('change', applyFilters);
    $('#sort').addEventListener('change', applyFilters);
    $('#reset').addEventListener('click', () => {
      $('#search').value = '';
      $('#category').value = 'all';
      $('#sort').value = 'relevance';
      applyFilters();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Catalog add buttons (event delegation)
    $('#products').addEventListener('click', (e) => {
      const btn = e.target.closest('.add');
      if (!btn) return;
      const id = btn.dataset.id;
      const product = allProducts.find(p => p.id === id);
      if (!product) return;
      cart.add(product, 1);
      openCart();
    });

    // Cart panel
    $('#cart-toggle').addEventListener('click', () => openCart());
    $('#close-cart').addEventListener('click', () => closeCart());

    // Cart interactions (delegation)
    $('#cart-list').addEventListener('input', (e) => {
      const el = e.target.closest('input[type="number"]');
      if (!el) return;
      cart.setQty(el.dataset.id, parseInt(el.value || '1', 10));
    });
    $('#cart-list').addEventListener('click', async (e) => {
      const btn = e.target.closest('.remove');
      if (!btn) return;
      const id = btn.dataset.id;
      const ok = await Swal.fire({
        icon: 'question',
        title: '¿Quitar producto?',
        showCancelButton: true,
        confirmButtonText: 'Sí, quitar',
        cancelButtonText: 'Cancelar'
      });
      if (ok.isConfirmed) cart.remove(id);
    });

    // Cart actions
    $('#empty-cart').addEventListener('click', async () => {
      if (cart.items.length === 0) return;
      const ok = await Swal.fire({
        icon: 'warning',
        title: 'Vaciar carrito',
        text: 'Esto eliminará todos los productos.',
        showCancelButton: true,
        confirmButtonText: 'Vaciar',
        cancelButtonText: 'Cancelar'
      });
      if (ok.isConfirmed) cart.clear();
    });
    $('#checkout').addEventListener('click', openCheckout);

    // Checkout modal
    $('#cancel-checkout').addEventListener('click', closeCheckout);
    $('#checkout-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      // Validaciones básicas
      const email = $('#email').value.trim();
      const name = $('#name').value.trim();
      const address = $('#address').value.trim();
      if (!name || !email || !address) {
        Swal.fire({ icon: 'error', title: 'Completá tus datos' });
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        Swal.fire({ icon: 'error', title: 'Email inválido' });
        return;
      }
      // Simular pago asíncrono
      await Swal.fire({
        title: 'Procesando pago…',
        timer: 900,
        timerProgressBar: true,
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
      });
      await submitOrder();
    });

    // Initial render
    renderCart();
  }

  // ---------- Bootstrap ----------
  document.addEventListener('DOMContentLoaded', () => {
  /* THEME SWITCHER */
  const THEME_KEY = 'neoshop.theme';
  const applyTheme = (name) => {
    document.documentElement.setAttribute('data-theme', name);
    localStorage.setItem(THEME_KEY, name);
    document.querySelectorAll('.theme-dot').forEach(d=>d.classList.toggle('active', d.dataset.name===name));
  };
  const savedTheme = localStorage.getItem(THEME_KEY) || 'neon';
  applyTheme(savedTheme);
  document.getElementById('theme-switcher').addEventListener('click', (e) => {
    const dot = e.target.closest('.theme-dot');
    if (!dot) return;
    applyTheme(dot.dataset.name);
  });

    wire();
    loadProducts();
  });

})(); // end IIFE