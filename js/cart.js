/**
 * VIVERO VERDE — MÓDULO DE CARRITO DE COMPRAS Y CONSULTA POR WHATSAPP
 *
 * Administra el estado del carrito de compras, persistencia en LocalStorage,
 * cálculo de subtotales y totales en Guaraníes (₲), control de cantidades,
 * apertura y cierre del panel lateral accesible (drawer), y generación
 * del mensaje formal de consulta para WhatsApp según el formato requerido.
 */

'use strict';

const Cart = (() => {
  // Estado local en memoria de los ítems del carrito
  let items = [];

  // Referencias al DOM (cacheadas tras la inicialización)
  let domElements = {};

  /**
   * Carga el estado inicial del carrito desde LocalStorage.
   */
  function loadFromStorage() {
    try {
      const stored = localStorage.getItem(VIVERO_CONFIG.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          items = parsed.filter(validateItem);
        }
      }
    } catch (e) {
      console.warn('No se pudo acceder a LocalStorage para el carrito:', e);
      items = [];
    }
  }

  /**
   * Guarda el estado actual en LocalStorage.
   */
  function saveToStorage() {
    try {
      localStorage.setItem(VIVERO_CONFIG.storageKey, JSON.stringify(items));
    } catch (e) {
      console.warn('Error al guardar el carrito en LocalStorage:', e);
    }
  }

  /**
   * Valida la estructura de un ítem guardado.
   */
  function validateItem(item) {
    return (
      item &&
      typeof item.id === 'string' &&
      typeof item.name === 'string' &&
      typeof item.price === 'number' &&
      item.price > 0 &&
      typeof item.quantity === 'number' &&
      item.quantity > 0
    );
  }

  /**
   * Genera una clave única para cada ítem basada en su ID y el precio seleccionado.
   * Esto permite que una misma planta con distintas variantes de precio
   * conviva como líneas separadas en el pedido.
   */
  function getItemKey(productId, price) {
    return `${productId}__${price}`;
  }

  /**
   * Agrega un producto al carrito con la variante de precio seleccionada.
   *
   * @param {string} productId - ID del producto
   * @param {number} selectedPrice - Precio específico seleccionado
   * @param {number} [quantity=1] - Cantidad a agregar
   */
  function addItem(productId, selectedPrice, quantity = 1) {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) {
      console.error(`Producto con id ${productId} no encontrado.`);
      return;
    }

    const price = Number(selectedPrice);
    if (!product.prices.includes(price)) {
      console.error(`Precio ${price} no es una variante válida para ${product.name}.`);
      return;
    }

    const key = getItemKey(product.id, price);
    const existingIndex = items.findIndex((i) => i.key === key);

    if (existingIndex > -1) {
      items[existingIndex].quantity += quantity;
    } else {
      items.push({
        key,
        id: product.id,
        name: product.name,
        price,
        unitLabel: product.unitLabel || '',
        image: product.image,
        alt: product.alt,
        quantity
      });
    }

    saveToStorage();
    render();
    animateCartBadge();
    showToastNotification(`Se agregó ${product.name} al pedido`);
  }

  /**
   * Modifica la cantidad de un ítem específico. Si la cantidad baja de 1, lo remueve.
   */
  function updateQuantity(key, delta) {
    const itemIndex = items.findIndex((i) => i.key === key);
    if (itemIndex === -1) return;

    items[itemIndex].quantity += delta;

    if (items[itemIndex].quantity <= 0) {
      items.splice(itemIndex, 1);
    }

    saveToStorage();
    render();
  }

  /**
   * Elimina completamente un ítem del carrito.
   */
  function removeItem(key) {
    const item = items.find((i) => i.key === key);
    items = items.filter((i) => i.key !== key);
    saveToStorage();
    render();
    if (item) {
      showToastNotification(`Se quitó ${item.name} del pedido`);
    }
  }

  /**
   * Vacía todo el carrito previa confirmación.
   */
  function clearCart() {
    if (items.length === 0) return;
    items = [];
    saveToStorage();
    render();
    showToastNotification('El pedido ha sido vaciado');
  }

  /**
   * Calcula el total acumulado en Guaraníes.
   */
  function getTotal() {
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }

  /**
   * Devuelve la cantidad total de unidades en el carrito.
   */
  function getTotalCount() {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }

  /**
   * Genera el mensaje formateado para enviar por WhatsApp.
   *
   * Formato estricto:
   * "Hola, quisiera consultar por el siguiente pedido:
   *
   * - 2 × Rosa (₲ 10.000): ₲ 20.000
   * - 1 × Dipladenia (₲ 35.000): ₲ 35.000
   *
   * Total estimado: ₲ 55.000
   *
   * ¿Podrían confirmarme la disponibilidad?"
   */
  function buildWhatsAppMessage() {
    if (items.length === 0) return '';

    const lines = items.map((item) => {
      const unitNotice = item.unitLabel ? ` ${item.unitLabel}` : '';
      const unitPriceStr = formatGuaranies(item.price) + unitNotice;
      const subtotalStr = formatGuaranies(item.price * item.quantity);
      return `- ${item.quantity} × ${item.name} (${unitPriceStr}): ${subtotalStr}`;
    });

    const totalStr = formatGuaranies(getTotal());

    const message = [
      'Hola, quisiera consultar por el siguiente pedido:',
      '',
      lines.join('\n'),
      '',
      `Total estimado: ${totalStr}`,
      '',
      '¿Podrían confirmarme la disponibilidad?'
    ].join('\n');

    return message;
  }

  /**
   * Redirige al enlace oficial de WhatsApp con el pedido codificado.
   */
  function checkoutWhatsApp() {
    if (items.length === 0) {
      showToastNotification('Tu carrito está vacío. Añadí flores antes de consultar.');
      return;
    }

    const message = buildWhatsAppMessage();
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${VIVERO_CONFIG.whatsappNumber}?text=${encoded}`;

    window.open(url, '_blank', 'noopener,noreferrer');
  }

  /**
   * Genera un enlace directo para consultar por una flor específica por WhatsApp.
   *
   * @param {string} productName
   * @param {number} price
   * @param {string} [unitLabel]
   */
  function consultSingleProduct(productName, price, unitLabel = '') {
    const priceStr = formatGuaranies(price, unitLabel);
    const message = `Hola, quisiera consultar por la disponibilidad de: ${productName} (${priceStr}). ¿Tienen stock en el vivero?`;
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${VIVERO_CONFIG.whatsappNumber}?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  /**
   * Renderiza los ítems del carrito en el panel lateral.
   */
  function render() {
    const { listEl, countBadges, subtotalEl, totalEl, emptyStateEl, footerEl, checkoutBtn } = domElements;

    const totalCount = getTotalCount();
    const totalAmount = getTotal();

    // Actualizar contadores del header y del drawer
    countBadges.forEach((badge) => {
      badge.textContent = totalCount;
      badge.setAttribute('aria-label', `${totalCount} productos en el pedido`);
      if (totalCount > 0) {
        badge.classList.remove('badge--hidden');
      } else {
        badge.classList.add('badge--hidden');
      }
    });

    // Estado vacío o con ítems
    if (items.length === 0) {
      if (listEl) listEl.innerHTML = '';
      if (emptyStateEl) emptyStateEl.hidden = false;
      if (footerEl) footerEl.hidden = true;
      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
    }

    if (emptyStateEl) emptyStateEl.hidden = true;
    if (footerEl) footerEl.hidden = false;
    if (checkoutBtn) checkoutBtn.disabled = false;

    // Totales
    const formattedTotal = formatGuaranies(totalAmount);
    if (subtotalEl) subtotalEl.textContent = formattedTotal;
    if (totalEl) totalEl.textContent = formattedTotal;

    // Renderizado de las tarjetas del carrito
    if (listEl) {
      listEl.innerHTML = items
        .map((item) => {
          const itemSubtotal = formatGuaranies(item.price * item.quantity);
          const unitPrice = formatGuaranies(item.price, item.unitLabel);

          return `
          <li class="cart-item" data-key="${item.key}">
            <div class="cart-item__image-wrap">
              <img
                src="${item.image}"
                alt="${item.alt}"
                class="cart-item__image"
                loading="lazy"
                width="72"
                height="72"
                onerror="this.onerror=null; this.src='${generateBotanicalPlaceholder(item.name)}';"
              />
            </div>
            <div class="cart-item__content">
              <div class="cart-item__header">
                <h4 class="cart-item__name">${item.name}</h4>
                <button
                  type="button"
                  class="cart-item__remove-btn"
                  data-action="remove"
                  data-key="${item.key}"
                  title="Eliminar ${item.name} del pedido"
                  aria-label="Eliminar ${item.name} del pedido"
                >
                  <svg class="icon icon--sm" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <div class="cart-item__unit-price">${unitPrice}</div>
              <div class="cart-item__footer">
                <div class="quantity-control" role="group" aria-label="Cantidad para ${item.name}">
                  <button
                    type="button"
                    class="quantity-btn quantity-btn--minus"
                    data-action="decrease"
                    data-key="${item.key}"
                    aria-label="Disminuir cantidad"
                  >
                    <svg class="icon icon--xs" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </button>
                  <span class="quantity-value" aria-live="polite">${item.quantity}</span>
                  <button
                    type="button"
                    class="quantity-btn quantity-btn--plus"
                    data-action="increase"
                    data-key="${item.key}"
                    aria-label="Aumentar cantidad"
                  >
                    <svg class="icon icon--xs" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </button>
                </div>
                <div class="cart-item__subtotal">${itemSubtotal}</div>
              </div>
            </div>
          </li>
        `;
        })
        .join('');
    }
  }

  /**
   * Abre el drawer del carrito.
   */
  function openDrawer() {
    const { drawerEl, overlayEl } = domElements;
    if (!drawerEl) return;

    drawerEl.classList.add('cart-drawer--open');
    drawerEl.setAttribute('aria-hidden', 'false');
    if (overlayEl) {
      overlayEl.classList.add('cart-overlay--visible');
      overlayEl.setAttribute('aria-hidden', 'false');
    }
    document.body.classList.add('no-scroll');

    // Foco accesible al botón de cerrar
    const closeBtn = drawerEl.querySelector('.cart-drawer__close');
    if (closeBtn) {
      setTimeout(() => closeBtn.focus(), 50);
    }
  }

  /**
   * Cierra el drawer del carrito.
   */
  function closeDrawer() {
    const { drawerEl, overlayEl, toggleBtn } = domElements;
    if (!drawerEl) return;

    drawerEl.classList.remove('cart-drawer--open');
    drawerEl.setAttribute('aria-hidden', 'true');
    if (overlayEl) {
      overlayEl.classList.remove('cart-overlay--visible');
      overlayEl.setAttribute('aria-hidden', 'true');
    }
    document.body.classList.remove('no-scroll');

    if (toggleBtn) {
      toggleBtn.focus();
    }
  }

  /**
   * Efecto visual en los badges del carrito al añadir elementos.
   */
  function animateCartBadge() {
    domElements.countBadges.forEach((badge) => {
      badge.classList.remove('badge--pulse');
      // Forzar reflow para reiniciar la animación
      void badge.offsetWidth;
      badge.classList.add('badge--pulse');
    });
  }

  /**
   * Toast discreto para notificar acciones del carrito.
   */
  function showToastNotification(message) {
    let toast = document.getElementById('vivero-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'vivero-toast';
      toast.className = 'toast-notification';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('toast-notification--visible');

    if (toast._timer) clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('toast-notification--visible');
    }, 2800);
  }

  /**
   * Inicializa los listeners y componentes del carrito.
   */
  function init() {
    domElements = {
      drawerEl: document.getElementById('cart-drawer'),
      overlayEl: document.getElementById('cart-overlay'),
      listEl: document.getElementById('cart-items-list'),
      subtotalEl: document.getElementById('cart-subtotal-val'),
      totalEl: document.getElementById('cart-total-val'),
      emptyStateEl: document.getElementById('cart-empty-state'),
      footerEl: document.getElementById('cart-footer'),
      checkoutBtn: document.getElementById('cart-checkout-btn'),
      clearBtn: document.getElementById('cart-clear-btn'),
      closeBtn: document.getElementById('cart-close-btn'),
      toggleBtn: document.getElementById('cart-toggle-btn'),
      countBadges: Array.from(document.querySelectorAll('.js-cart-count'))
    };

    loadFromStorage();
    render();

    // Eventos de apertura / cierre
    if (domElements.toggleBtn) {
      domElements.toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openDrawer();
      });
    }

    if (domElements.closeBtn) {
      domElements.closeBtn.addEventListener('click', closeDrawer);
    }

    if (domElements.overlayEl) {
      domElements.overlayEl.addEventListener('click', closeDrawer);
    }

    // Tecla ESC para cerrar el carrito
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && domElements.drawerEl && domElements.drawerEl.classList.contains('cart-drawer--open')) {
        closeDrawer();
      }
    });

    // Acciones dentro de la lista de productos del carrito (delegación de eventos)
    if (domElements.listEl) {
      domElements.listEl.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;

        const action = btn.dataset.action;
        const key = btn.dataset.key;

        if (action === 'increase') {
          updateQuantity(key, 1);
        } else if (action === 'decrease') {
          updateQuantity(key, -1);
        } else if (action === 'remove') {
          removeItem(key);
        }
      });
    }

    // Botón vaciar carrito
    if (domElements.clearBtn) {
      domElements.clearBtn.addEventListener('click', () => {
        if (confirm('¿Deseas vaciar todos los productos de tu pedido?')) {
          clearCart();
        }
      });
    }

    // Botón finalizar por WhatsApp
    if (domElements.checkoutBtn) {
      domElements.checkoutBtn.addEventListener('click', checkoutWhatsApp);
    }
  }

  return {
    init,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    openDrawer,
    closeDrawer,
    checkoutWhatsApp,
    consultSingleProduct,
    getTotal,
    getTotalCount,
    getItems: () => [...items]
  };
})();
