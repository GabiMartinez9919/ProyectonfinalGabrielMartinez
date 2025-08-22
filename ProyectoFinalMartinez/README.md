# ProyectoFinalMartinez — Simulador Ecommerce

Simulador **100% funcional** hecho en **HTML + CSS + JavaScript**, cumpliendo con los criterios del trabajo final:

- **Datos remotos simulados** con `fetch` → `data/products.json`.
- **HTML interactivo generado con JS** (catálogo, filtros, carrito).
- **Eventos y DOM** para interacciones (agregar/quitar, cantidades, checkout).
- **Funciones** con parámetros, **clases**, **arrays/objetos** y **recorridos óptimos**.
- **LocalStorage** para persistir el carrito y el historial de órdenes.
- **Librería externa**: [SweetAlert2](https://sweetalert2.github.io) reemplaza `alert/prompt/confirm`.
- Flujo completo de **compra** con validación de formulario y **resumen de orden**.

---

## Estructura

```
ProyectoFinalMartinez/
├─ index.html
├─ styles.css
├─ app.js
├─ data/
│  └─ products.json
└─ assets/
   └─ img/
      ├─ product-1.svg … product-6.svg
```

Podés reemplazar las imágenes `.svg` por las que quieras, manteniendo el nombre del archivo.

---

## Cómo ejecutar (local)

> **Requisito:** abrir el proyecto con un servidor local. Recomendado: **Live Server** de VS Code (**puerto 5500**).

1. Abrí VS Code en la carpeta `ProyectoFinalMartinez`.
2. Instala la extensión **Live Server** (si no la tenés).
3. Click derecho en `index.html` → **Open with Live Server** (por defecto usa el **puerto 5500**).
4. Navegá en `http://127.0.0.1:5500/` o similar que muestre VS Code.

> Si necesitás otro puerto, también funciona en **8000** (por ejemplo con `python -m http.server 8000`).

---

## Uso rápido

- Buscá por nombre o categoría, filtrá y ordená.
- Presioná **Agregar** para sumar al carrito.
- Abrí el carrito con **🛒 Carrito**, modificá cantidades o quitá ítems.
- **Finalizar compra** abre el checkout (datos **precargados** para tu comodidad).
- Al **Pagar**, verás un **resumen** con número de orden y el carrito se vacía.

---

## Buenas prácticas del código

- Sin `console.log` ni `alert`/`prompt`/`confirm`.
- Nombres de variables y funciones **significativos** y **comentarios** oportunos.
- Código en archivos separados y ordenados.
- Accesibilidad básica (roles/aria en componentes dinámicos).

---

## Entrega

- Subí un **.ZIP** con esta carpeta (ya te dejo uno listo).
- Repositorio con nombre **`ProyectoFinalMartinez`** o **`ProyectoFinal+Martinez`**.
- Incluí el link a tu **GDrive** si te lo piden.

¡Éxitos! 💪