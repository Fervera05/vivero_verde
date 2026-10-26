/**
 * VIVERO VERDE — APLICACIÓN PRINCIPAL, CONTROL DE NAVEGACIÓN Y ANIMACIONES
 *
 * Orquesta la inicialización del sitio, menú móvil, header inteligente,
 * inyección de datos comerciales centralizados, observador de intersección
 * (Intersection Observer) para animaciones al hacer scroll, y accesibilidad.
 */

'use strict';

const App = (() => {
  let scrollObserver = null;

  /**
   * Configura el Intersection Observer para animaciones de entrada fluidas y eficientes.
   * Respeta la preferencia 'prefers-reduced-motion'.
   */
  function setupScrollObserver() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      // Si el usuario prefiere movimiento reducido, mostrar inmediatamente todos los elementos
      document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
        el.classList.add('is-revealed');
      });
      return;
    }

    const options = {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.12
    };

    scrollObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, options);

    observeNewElements();
  }

  /**
   * Registra nuevos elementos que contengan la clase .reveal-on-scroll en el observador.
   */
  function observeNewElements() {
    if (!scrollObserver) return;
    const unrevealedElements = document.querySelectorAll('.reveal-on-scroll:not(.is-revealed)');
    unrevealedElements.forEach((el) => scrollObserver.observe(el));
  }

  /**
   * Manejo inteligente del header al hacer scroll (reduce altura y añade sombra sutil).
   */
  function setupHeaderScroll() {
    const header = document.getElementById('main-header');
    if (!header) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    function onScroll() {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 24) {
        header.classList.add('header--scrolled');
      } else {
        header.classList.remove('header--scrolled');
      }

      lastScrollY = currentScrollY;
      ticking = false;
    }

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          window.requestAnimationFrame(onScroll);
          ticking = true;
        }
      },
      { passive: true }
    );

    // Verificación inicial
    onScroll();
  }

  /**
   * Menú de navegación móvil con accesibilidad y bloqueo de scroll.
   */
  function setupMobileMenu() {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('main-nav');
    const navOverlay = document.getElementById('nav-overlay');

    if (!toggleBtn || !navMenu) return;

    function openMenu() {
      navMenu.classList.add('nav--open');
      toggleBtn.classList.add('is-active');
      toggleBtn.setAttribute('aria-expanded', 'true');
      if (navOverlay) {
        navOverlay.classList.add('nav-overlay--visible');
        navOverlay.setAttribute('aria-hidden', 'false');
      }
      document.body.classList.add('no-scroll');
    }

    function closeMenu() {
      navMenu.classList.remove('nav--open');
      toggleBtn.classList.remove('is-active');
      toggleBtn.setAttribute('aria-expanded', 'false');
      if (navOverlay) {
        navOverlay.classList.remove('nav-overlay--visible');
        navOverlay.setAttribute('aria-hidden', 'true');
      }
      document.body.classList.remove('no-scroll');
    }

    toggleBtn.addEventListener('click', () => {
      const isOpen = navMenu.classList.contains('nav--open');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    if (navOverlay) {
      navOverlay.addEventListener('click', closeMenu);
    }

    // Cerrar al pulsar un enlace de navegación
    navMenu.querySelectorAll('.nav__link').forEach((link) => {
      link.addEventListener('click', () => {
        closeMenu();
      });
    });

    // Cerrar al pulsar ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('nav--open')) {
        closeMenu();
        toggleBtn.focus();
      }
    });
  }

  /**
   * Desplazamiento suave para enlaces ancla teniendo en cuenta el header flotante.
   */
  function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#' || href === '#!') return;

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const headerHeight = document.getElementById('main-header')?.offsetHeight || 70;
          const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight - 12;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });

          // Actualizar foco para accesibilidad
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        }
      });
    });
  }

  /**
   * Inyecta dinámicamente los datos comerciales de VIVERO_CONFIG en el HTML.
   */
  function injectCommercialData() {
    // 1. Copyright dinámico
    const yearEl = document.getElementById('current-year');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }

    // 2. Enlaces directos a WhatsApp (Hero, Contacto, Header)
    const directWaUrl = `https://wa.me/${VIVERO_CONFIG.whatsappNumber}?text=${encodeURIComponent(
      'Hola Vivero Verde, quisiera realizar una consulta sobre sus flores y plantas.'
    )}`;

    document.querySelectorAll('.js-whatsapp-link').forEach((el) => {
      el.setAttribute('href', directWaUrl);
    });

    // 3. Textos comerciales configurables
    document.querySelectorAll('.js-business-name').forEach((el) => {
      el.textContent = VIVERO_CONFIG.businessName;
    });

    document.querySelectorAll('.js-whatsapp-display').forEach((el) => {
      el.textContent = VIVERO_CONFIG.whatsappDisplay;
    });

    document.querySelectorAll('.js-address-display').forEach((el) => {
      el.textContent = VIVERO_CONFIG.address;
    });

    document.querySelectorAll('.js-schedule-weekdays').forEach((el) => {
      el.textContent = VIVERO_CONFIG.scheduleWeekdays;
    });

    document.querySelectorAll('.js-schedule-saturday').forEach((el) => {
      el.textContent = VIVERO_CONFIG.scheduleSaturday;
    });

    document.querySelectorAll('.js-schedule-sunday').forEach((el) => {
      el.textContent = VIVERO_CONFIG.scheduleSunday;
    });

    // 4. Enlaces a redes sociales
    const igLink = document.getElementById('link-instagram');
    if (igLink) igLink.setAttribute('href', VIVERO_CONFIG.socialInstagram);

    const fbLink = document.getElementById('link-facebook');
    if (fbLink) fbLink.setAttribute('href', VIVERO_CONFIG.socialFacebook);
  }

  /**
   * Inicialización global de la aplicación.
   */
  function init() {
    injectCommercialData();
    setupHeaderScroll();
    setupMobileMenu();
    setupSmoothScroll();
    setupScrollObserver();

    // Inicializar subsistemas
    Cart.init();
    CatalogFilters.init();
  }

  return {
    init,
    observeNewElements
  };
})();

// Iniciar aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', App.init);
} else {
  App.init();
}

window.App = App;
