/* ============================================================
   DS ID — Utilidades de interfaz (toast + confirmar)
   Reemplazan los alert() y confirm() del navegador por algo elegante.
   ============================================================ */
(function (root) {
  function ensureWrap() {
    var w = document.getElementById("ds-toast-wrap");
    if (!w) {
      w = document.createElement("div");
      w.id = "ds-toast-wrap";
      w.className = "toast-wrap";
      document.body.appendChild(w);
    }
    return w;
  }

  // Notificación breve. tipo: "ok" | "err" | "info"
  function toast(mensaje, tipo, ms) {
    var wrap = ensureWrap();
    var el = document.createElement("div");
    el.className = "toast toast-" + (tipo || "info");
    var icono = tipo === "ok" ? "✓" : (tipo === "err" ? "⚠" : "ℹ");
    el.innerHTML = '<span class="tic">' + icono + '</span><span>' + escapeHtml(mensaje) + '</span>';
    wrap.appendChild(el);
    var dur = ms || 3400;
    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () { el.remove(); }, 240);
    }, dur);
  }

  // Confirmación con modal. Devuelve una promesa que resuelve true/false.
  // opts: { titulo, texto, confirmar, cancelar, peligro (bool) }
  function confirmar(opts) {
    opts = opts || {};
    return new Promise(function (resolve) {
      var bg = document.createElement("div");
      bg.className = "modal-bg";
      var icono = opts.peligro ? "🗑️" : "❓";
      bg.innerHTML =
        '<div class="modal" role="dialog" aria-modal="true">' +
          '<div class="m-ic">' + icono + '</div>' +
          '<h3>' + escapeHtml(opts.titulo || "¿Confirmar?") + '</h3>' +
          '<p>' + escapeHtml(opts.texto || "") + '</p>' +
          '<div class="m-btns">' +
            '<button class="btn btn-ghost" data-no>' + escapeHtml(opts.cancelar || "Cancelar") + '</button>' +
            '<button class="btn ' + (opts.peligro ? "btn-danger" : "") + '" data-yes>' + escapeHtml(opts.confirmar || "Confirmar") + '</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(bg);

      function cerrar(valor) {
        bg.remove();
        document.removeEventListener("keydown", onKey);
        resolve(valor);
      }
      function onKey(e) { if (e.key === "Escape") cerrar(false); }

      bg.querySelector("[data-yes]").addEventListener("click", function () { cerrar(true); });
      bg.querySelector("[data-no]").addEventListener("click", function () { cerrar(false); });
      bg.addEventListener("click", function (e) { if (e.target === bg) cerrar(false); });
      document.addEventListener("keydown", onKey);
    });
  }

  function escapeHtml(s) {
    if (s === null || s === undefined) return "";
    return ("" + s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  root.DSIDUI = { toast: toast, confirmar: confirmar };
})(typeof window !== "undefined" ? window : this);
