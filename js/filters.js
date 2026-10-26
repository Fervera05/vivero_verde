/**
 * VIVERO VERDE — CATÁLOGO, BÚSQUEDA EN TIEMPO REAL Y FILTRADO
 *
 * Administra el renderizado dinámico de los 28 productos del catálogo,
 * la selección interactiva de variantes de precio por tarjeta,
 * la búsqueda en tiempo real por nombre, ordenamientos (precio y alfabético),
 * filtrado por rangos de precio, y presentación de estados vacíos.
 *
 * Criterio documentado para variantes:
 * Al ordenar o filtrar por precio, se utiliza el precio mínimo (minPrice)
 * de cada producto como referencia base.
 */

'use strict';

const CatalogFilters = (() => {
  // Estado local de filtros y catálogo
  let activeSearchTerm = '';
  let activeSort = 'featured'; // 'featured' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc'
  let activePriceTier = 'all'; // 'all' | 'tier-1' (<=10000) | 'tier-2' (10001-25000) | 'tier-3' (>25000) | 'custom'
  let customMinPrice = null;
  let customMaxPrice = null;

  // Mapa en memoria para recordar qué variante de precio tiene seleccionada cada tarjeta
  // { 'azalea': 15000, 'rosa': 8000, ... }
  const selectedVariantPrices = {};

  // Referencias a elementos del DOM
  let domElements = {};

  /**
   * Inicializa la variante seleccionada por defecto para cada producto (el precio mínimo).
   */
  function initDefaultVariants() {
    PRODUCTS.forEach((product) => {
      selectedVariantPrices[product.id] = product.prices[0];
    });
  }

  /**
   * Filtra los productos según el término de búsqueda y el rango de precio.
   */
  function getFilteredProducts() {
    return PRODUCTS.filter((product) => {
      // 1. Filtro por término de búsqueda (nombre)
      if (activeSearchTerm.trim() !== '') {
        const normalizedName = product.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        const normalizedTerm = activeSearchTerm
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');

        if (!normalizedName.includes(normalizedTerm)) {
          return false;
        }
      }

      // 2. Filtro por precio (criterio: minPrice)
      const refPrice = product.minPrice;

      if (activePriceTier === 'tier-1') {
        // Hasta ₲ 10.000
        if (refPrice > 10000) return false;
      } else if (activePriceTier === 'tier-2') {
        // De ₲ 10.001 a ₲ 25.000
        if (refPrice <= 10000 || refPrice > 25000) return false;
      } else if (activePriceTier === 'tier-3') {
        // Más de ₲ 25.000
        if (refPrice <= 25000) return false;
      } else if (activePriceTier === 'custom') {
        if (customMinPrice !== null && refPrice < customMinPrice) return false;
        if (customMaxPrice !== null && refPrice > customMaxPrice) return false;
      }

      return true;
    });
  }

  /**
   * Ordena la lista de productos filtrada.
   */
  function sortProducts(list) {
    const sorted = [...list];

    switch (activeSort) {
      case 'price-asc':
        // Precio: menor a mayor (basado en minPrice)
        sorted.sort((a, b) => a.minPrice - b.minPrice);
        break;
      case 'price-desc':
        // Precio: mayor a menor (basado en minPrice)
        sorted.sort((a, b) => b.minPrice - a.minPrice);
        break;
      case 'name-asc':
        // Alfabético A - Z
        sorted.sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
        break;
      case 'name-desc':
        // Alfabético Z - A
        sorted.sort((a, b) => b.name.localeCompare(a.name, 'es', { sensitivity: 'base' }));
        break;
      case 'featured':
      default:
        // Orden original de la lista oficial
        break;
    }

    return sorted;
  }

  /**
   * Genera el HTML de una tarjeta de producto.
   */
  function createProductCardHTML(product) {
    const currentPrice = selectedVariantPrices[product.id] || product.prices[0];
    const isSinglePrice = product.prices.length === 1;

    // Render de selector de variantes si existen múltiples precios
    let variantsHTML = '';
    if (!isSinglePrice) {
      const pills = product.prices
        .map((price) => {
          const isSelected = price === currentPrice;
          const label = formatGuaranies(price);
          return `
            <button
              type="button"
              class="variant-pill ${isSelected ? 'variant-pill--active' : ''}"
              data-product-id="${product.id}"
              data-price="${price}"
              aria-pressed="${isSelected}"
              title="Seleccionar variante de ${label}"
            >
              ${label}
            </button>
          `;
        })
        .join('');

      variantsHTML = `
        <div class="product-card__variants" role="group" aria-label="Variantes de precio disponibles">
          <span class="product-card__variants-label">Precios disponibles:</span>
          <div class="variant-pill-list">
            ${pills}
          </div>
        </div>
      `;
    }

    // Texto de precio principal formateado
    const priceDisplay = formatGuaranies(currentPrice, product.unitLabel);

    return `
      <article class="product-card reveal-on-scroll" data-product-id="${product.id}" id="card-${product.id}">
        <div class="product-card__media">
          <img
            src="${product.image}"
            alt="${product.alt}"
            class="product-card__image"
            loading="lazy"
            width="400"
            height="320"
            onerror="this.onerror=null; this.src='${generateBotanicalPlaceholder(product.name)}';"
          />
          ${
            product.hasVariants
              ? `<span class="product-card__badge" title="Este producto dispone de varias opciones de precio">${product.prices.length} precios</span>`
              : ''
          }
          ${
            product.unitLabel
              ? `<span class="product-card__badge product-card__badge--unit">${product.unitLabel}</span>`
              : ''
          }
        </div>

        <div class="product-card__body">
          <div class="product-card__header">
            <h3 class="product-card__title">${product.name}</h3>
            <div class="product-card__price-wrap">
              <span class="product-card__price js-card-price">${priceDisplay}</span>
            </div>
          </div>

          ${variantsHTML}

          <div class="product-card__actions">
            <button
              type="button"
              class="btn btn--primary btn--full js-add-to-cart"
              data-product-id="${product.id}"
              data-price="${currentPrice}"
              aria-label="Agregar ${product.name} al pedido por ${priceDisplay}"
            >
              <svg class="icon icon--sm" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <span>Agregar al pedido</span>
            </button>

            <button
              type="button"
              class="btn btn--whatsapp-subtle js-consult-single"
              data-product-name="${product.name}"
              data-price="${currentPrice}"
              data-unit-label="${product.unitLabel || ''}"
              title="Consultar por WhatsApp directamente sobre ${product.name}"
              aria-label="Consultar por WhatsApp sobre ${product.name}"
            >
              <svg class="icon icon--sm" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              <span>Consultar</span>
            </button>
          </div>
        </div>
      </article>
    `;
  }

  /**
   * Actualiza la variante activa seleccionada en una tarjeta sin necesidad de redibujar todo el DOM.
   */
  function handleVariantSelection(productId, newPrice) {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) return;

    selectedVariantPrices[productId] = newPrice;

    const card = document.getElementById(`card-${productId}`);
    if (!card) return;

    // Actualizar texto de precio
    const priceEl = card.querySelector('.js-card-price');
    if (priceEl) {
      priceEl.textContent = formatGuaranies(newPrice, product.unitLabel);
    }

    // Actualizar estado de las píldoras de variante
    const pills = card.querySelectorAll('.variant-pill');
    pills.forEach((pill) => {
      const pillPrice = Number(pill.dataset.price);
      const isSelected = pillPrice === newPrice;
      pill.classList.toggle('variant-pill--active', isSelected);
      pill.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });

    // Actualizar botones de acción con el nuevo precio
    const addBtn = card.querySelector('.js-add-to-cart');
    if (addBtn) {
      addBtn.dataset.price = newPrice;
      addBtn.setAttribute(
        'aria-label',
        `Agregar ${product.name} al pedido por ${formatGuaranies(newPrice, product.unitLabel)}`
      );
    }

    const consultBtn = card.querySelector('.js-consult-single');
    if (consultBtn) {
      consultBtn.dataset.price = newPrice;
    }
  }

  /**
   * Renderiza el catálogo según el estado actual de filtros y ordenamiento.
   */
  function render() {
    const { gridEl, countEl, emptyEl } = domElements;
    if (!gridEl) return;

    const filtered = getFilteredProducts();
    const sorted = sortProducts(filtered);

    // Actualizar contador de resultados
    if (countEl) {
      const total = PRODUCTS.length;
      if (sorted.length === total) {
        countEl.textContent = `Mostrando las ${total} flores y plantas del vivero`;
      } else {
        countEl.textContent = `Mostrando ${sorted.length} de ${total} variedades disponibles`;
      }
    }

    // Manejo de estado vacío
    if (sorted.length === 0) {
      gridEl.innerHTML = '';
      if (emptyEl) {
        emptyEl.hidden = false;
        const queryTermEl = emptyEl.querySelector('.js-empty-query');
        if (queryTermEl) {
          queryTermEl.textContent = activeSearchTerm ? `"${activeSearchTerm}"` : 'los filtros seleccionados';
        }
      }
      return;
    }

    if (emptyEl) emptyEl.hidden = true;

    // Renderizar tarjetas
    gridEl.innerHTML = sorted.map(createProductCardHTML).join('');

    // Reenganchar el Intersection Observer para animaciones de entrada en nuevos elementos
    if (window.App && typeof window.App.observeNewElements === 'function') {
      window.App.observeNewElements();
    }
  }

  /**
   * Reinicia todos los filtros a sus valores predeterminados.
   */
  function resetFilters() {
    activeSearchTerm = '';
    activeSort = 'featured';
    activePriceTier = 'all';
    customMinPrice = null;
    customMaxPrice = null;

    if (domElements.searchInput) domElements.searchInput.value = '';
    if (domElements.sortSelect) domElements.sortSelect.value = 'featured';

    if (domElements.tierButtons) {
      domElements.tierButtons.forEach((btn) => {
        btn.classList.toggle('filter-chip--active', btn.dataset.tier === 'all');
      });
    }

    if (domElements.minPriceInput) domElements.minPriceInput.value = '';
    if (domElements.maxPriceInput) domElements.maxPriceInput.value = '';

    render();
  }

  /**
   * Inicializa los escuchadores de eventos para la búsqueda y filtros.
   */
  function init() {
    domElements = {
      gridEl: document.getElementById('catalog-grid'),
      countEl: document.getElementById('catalog-count'),
      emptyEl: document.getElementById('catalog-empty-state'),
      searchInput: document.getElementById('catalog-search-input'),
      searchClearBtn: document.getElementById('catalog-search-clear'),
      sortSelect: document.getElementById('catalog-sort-select'),
      tierButtons: Array.from(document.querySelectorAll('.js-filter-tier')),
      minPriceInput: document.getElementById('price-min-input'),
      maxPriceInput: document.getElementById('price-max-input'),
      applyPriceBtn: document.getElementById('price-apply-btn'),
      resetFiltersBtns: Array.from(document.querySelectorAll('.js-reset-filters'))
    };

    initDefaultVariants();
    render();

    // 1. Búsqueda en tiempo real (instantánea)
    if (domElements.searchInput) {
      domElements.searchInput.addEventListener('input', (e) => {
        activeSearchTerm = e.target.value;
        if (domElements.searchClearBtn) {
          domElements.searchClearBtn.hidden = activeSearchTerm.length === 0;
        }
        render();
      });
    }

    // Botón para limpiar búsqueda
    if (domElements.searchClearBtn) {
      domElements.searchClearBtn.addEventListener('click', () => {
        activeSearchTerm = '';
        if (domElements.searchInput) {
          domElements.searchInput.value = '';
          domElements.searchInput.focus();
        }
        domElements.searchClearBtn.hidden = true;
        render();
      });
    }

    // 2. Ordenamiento
    if (domElements.sortSelect) {
      domElements.sortSelect.addEventListener('change', (e) => {
        activeSort = e.target.value;
        render();
      });
    }

    // 3. Chips de filtro de precio rápido
    domElements.tierButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        domElements.tierButtons.forEach((b) => b.classList.remove('filter-chip--active'));
        btn.classList.add('filter-chip--active');

        activePriceTier = btn.dataset.tier;

        // Limpiar inputs numéricos si se selecciona un chip
        if (domElements.minPriceInput) domElements.minPriceInput.value = '';
        if (domElements.maxPriceInput) domElements.maxPriceInput.value = '';
        customMinPrice = null;
        customMaxPrice = null;

        render();
      });
    });

    // 4. Rango de precio personalizado (min / max)
    if (domElements.applyPriceBtn) {
      domElements.applyPriceBtn.addEventListener('click', () => {
        const minVal = domElements.minPriceInput.value ? Number(domElements.minPriceInput.value) : null;
        const maxVal = domElements.maxPriceInput.value ? Number(domElements.maxPriceInput.value) : null;

        if (minVal !== null && maxVal !== null && minVal > maxVal) {
          alert('El precio mínimo no puede ser mayor que el precio máximo.');
          return;
        }

        activePriceTier = 'custom';
        customMinPrice = minVal;
        customMaxPrice = maxVal;

        // Desactivar chips rápidos
        domElements.tierButtons.forEach((b) => b.classList.remove('filter-chip--active'));

        render();
      });
    }

    // 5. Botones de reinicio de filtros
    domElements.resetFiltersBtns.forEach((btn) => {
      btn.addEventListener('click', resetFilters);
    });

    // 6. Delegación de eventos en el grid de catálogo (variantes, agregar al pedido, consulta)
    if (domElements.gridEl) {
      domElements.gridEl.addEventListener('click', (e) => {
        // A. Clic en píldora de variante
        const variantPill = e.target.closest('.variant-pill');
        if (variantPill) {
          const productId = variantPill.dataset.productId;
          const price = Number(variantPill.dataset.price);
          handleVariantSelection(productId, price);
          return;
        }

        // B. Clic en "Agregar al pedido"
        const addBtn = e.target.closest('.js-add-to-cart');
        if (addBtn) {
          const productId = addBtn.dataset.productId;
          const price = Number(addBtn.dataset.price);
          Cart.addItem(productId, price, 1);
          return;
        }

        // C. Clic en "Consultar" individual por WhatsApp
        const consultBtn = e.target.closest('.js-consult-single');
        if (consultBtn) {
          const productName = consultBtn.dataset.productName;
          const price = Number(consultBtn.dataset.price);
          const unitLabel = consultBtn.dataset.unitLabel || '';
          Cart.consultSingleProduct(productName, price, unitLabel);
          return;
        }
      });
    }
  }

  return {
    init,
    render,
    resetFilters
  };
})();
