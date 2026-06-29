/* ============================================================
   DS ID — Núcleo compartido (dsid-core.js)
   Funciones puras usadas por registrar.html, perfil.html y admin.html.
   Escrito para funcionar tanto en el navegador como en Node (para pruebas).
   ============================================================ */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();      // Node (pruebas)
  } else {
    root.DSID = factory();           // Navegador (window.DSID)
  }
})(typeof self !== "undefined" ? self : this, function () {

  // Limpia un teléfono y lo deja listo para wa.me (solo dígitos, con código país Colombia 57)
  function sanitizePhone(raw) {
    if (!raw) return "";
    var digits = ("" + raw).replace(/[^\d]/g, ""); // quita +, espacios, guiones, paréntesis
    if (digits.length === 10 && digits[0] === "3") {
      digits = "57" + digits;             // celular colombiano sin código -> agrega 57
    }
    if (digits.length === 12 && digits.substring(0, 2) === "57") {
      return digits;                       // ya tiene 57 + 10 dígitos
    }
    return digits;                         // otros casos (fijos, internacionales): se deja como está
  }

  // Formato bonito para mostrar el teléfono en pantalla
  function prettyPhone(raw) {
    var d = sanitizePhone(raw);
    if (d.length === 12 && d.substring(0, 2) === "57") {
      var n = d.substring(2);
      return "+57 " + n.substring(0, 3) + " " + n.substring(3, 6) + " " + n.substring(6);
    }
    return raw || "";
  }

  // Construye el enlace de WhatsApp con mensaje pre-escrito
  function buildWhatsApp(phone, petName, extra) {
    var p = sanitizePhone(phone);
    var msg = "¡Hola! Encontré a " + (petName || "tu mascota") + ".";
    if (extra) msg += " " + extra;
    return "https://wa.me/" + p + "?text=" + encodeURIComponent(msg);
  }

  // Enlace a Google Maps con coordenadas
  function buildMaps(lat, lng) {
    return "https://www.google.com/maps?q=" + lat + "," + lng;
  }

  // Convierte un nombre en texto seguro para URL: "Firulais Pérez" -> "firulais-perez"
  function slugify(name) {
    return ("" + (name || "mascota"))
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // quita tildes
      .replace(/[^a-z0-9]+/g, "-")                       // todo lo no alfanumérico -> guion
      .replace(/^-+|-+$/g, "")                            // quita guiones de los bordes
      .substring(0, 20) || "mascota";
  }

  // Genera un ID único corto: slug + 4 caracteres aleatorios. Ej: "nucita-x7k2"
  function generateId(name) {
    var chars = "abcdefghijkmnpqrstuvwxyz23456789"; // sin caracteres confusos (l,o,0,1)
    var rnd = "";
    for (var i = 0; i < 4; i++) rnd += chars[Math.floor(Math.random() * chars.length)];
    return slugify(name) + "-" + rnd;
  }

  // Escapa HTML para que datos del usuario no rompan el diseño ni inyecten código
  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return ("" + str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // Calcula edad aproximada desde una fecha "AAAA-MM-DD"
  function edadDesde(fechaIso) {
    if (!fechaIso) return "";
    var n = new Date(fechaIso);
    if (isNaN(n)) return "";
    var hoy = new Date();
    var meses = (hoy.getFullYear() - n.getFullYear()) * 12 + (hoy.getMonth() - n.getMonth());
    if (meses < 0) return "";
    if (meses < 12) return meses + (meses === 1 ? " mes" : " meses");
    var anios = Math.floor(meses / 12);
    return anios + (anios === 1 ? " año" : " años");
  }

  // Construye la URL pública del perfil a partir del ID y la base del sitio
  function profileUrl(baseUrl, id) {
    var base = baseUrl.replace(/\/+$/, ""); // sin barra final
    return base + "/perfil.html?id=" + encodeURIComponent(id);
  }

  // Saca la carpeta base desde una URL completa (auto-detecta el sitio)
  // Ej: "https://valen.github.io/dsid/registrar.html" -> "https://valen.github.io/dsid"
  function baseDir(href) {
    var u = ("" + href).split("#")[0].split("?")[0];
    var corte = u.lastIndexOf("/");
    return corte > 0 ? u.substring(0, corte) : u;
  }

  return {
    sanitizePhone: sanitizePhone,
    prettyPhone: prettyPhone,
    buildWhatsApp: buildWhatsApp,
    buildMaps: buildMaps,
    slugify: slugify,
    generateId: generateId,
    escapeHtml: escapeHtml,
    edadDesde: edadDesde,
    profileUrl: profileUrl,
    baseDir: baseDir
  };
});
