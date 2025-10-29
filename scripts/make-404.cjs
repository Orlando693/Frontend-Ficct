// Genera dist/404.html a partir de dist/index.html para que Vercel
// devuelva tu SPA en rutas profundas como /admin (evita el 404 del server).
const fs = require("fs");
const path = require("path");

const dist = path.resolve(__dirname, "..", "dist");
const index = path.join(dist, "index.html");
const notFound = path.join(dist, "404.html");

if (!fs.existsSync(dist)) {
  console.error("No existe la carpeta dist. ¿Ejecutaste `vite build`?");
  process.exit(1);
}
fs.copyFileSync(index, notFound);
console.log("✔ SPA fallback: 404.html creado a partir de index.html");
