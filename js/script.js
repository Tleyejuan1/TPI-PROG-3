 // INICIAMOS EL CONTADOR DESDE 50 YA QUE TENEMOS 49 IDS ANTERIORES EN mockAPI
let reservaIdCounter = Number(localStorage.getItem("reservaIdCounter")) || 50;

// Usuarios base del sistema
const usuariosBase = [
  { id: 1, nombre: "Juan",  email: "admin@gmail.com",  password: "1234", role: "admin" },
  { id: 2, nombre: "Lucas", email: "admin1@gmail.com", password: "1234", role: "admin" },
  { id: 3, nombre: "Nico",  email: "admin2@gmail.com", password: "1234", role: "admin" },
  { id: 4, nombre: "Nacho", email: "admin3@gmail.com", password: "1234", role: "admin" },

  { id: 5, nombre: "Juan",  email: "usuario@gmail.com",  password: "5678", role: "usuario" },
  { id: 6, nombre: "Lucas", email: "usuario1@gmail.com", password: "5678", role: "usuario" },
  { id: 7, nombre: "Nico",  email: "usuario2@gmail.com", password: "5678", role: "usuario" },
  { id: 8, nombre: "Nacho", email: "usuario3@gmail.com", password: "5678", role: "usuario" }
];

// Usuarios creados con el formulario de registro
let usuariosCustom = JSON.parse(localStorage.getItem("usuariosCustom")) || [];

// Mezcla final
function getUsuariosTotales() {
  return [...usuariosBase, ...usuariosCustom];
}

let autos = [];
let reservas = [];

const API_AUTOS = "https://691626e5a7a34288a27c8064.mockapi.io/autos";
const API_RESERVAS = "https://691626e5a7a34288a27c8064.mockapi.io/reservas";

/* ============================================================
   ✨ UTILIDAD PARA FORMATO DE DINERO
============================================================ */

function money(n) {
  return "$" + Number(n ?? 0).toLocaleString("es-AR");
}



/* ============================================================
   🔐 LOGIN UNIFICADO (FUNCIONA CON Y SIN SELECT DE ROL)
============================================================ */
function login() {

  const email = document.getElementById("email")?.value.trim();
  const pass  = document.getElementById("password")?.value.trim();
  const msg   = document.getElementById("mensaje");
  
  // Posible select de rol (solo existe en algunas versiones)
  const rolSelect = document.getElementById("rol");
  const rolElegido = rolSelect ? rolSelect.value : null;

  if (!email || !pass) {
    msg.textContent = "⚠️ Completá email y contraseña.";
    msg.style.color = "red";
    return;
  }

  const usuariosTotales = getUsuariosTotales();

  // Buscar usuario
  let user = usuariosTotales.find(u => u.email === email && u.password === pass);

  if (!user) {
    msg.textContent = "❌ Correo o contraseña incorrectos.";
    msg.style.color = "red";
    return;
  }

  // ✔ Los usuarios creados desde registro SIEMPRE son "usuario"
  if (usuariosCustom.some(u => u.email === email)) {
    user.role = "usuario";
  }

  // ✔ Los usuarios base (admins) deben validar rol SOLO si existe el select
  if (rolSelect) {
    if (rolElegido === "") {
      msg.textContent = "⚠️ Seleccioná un rol.";
      msg.style.color = "red";
      return;
    }

    if (rolElegido !== user.role) {
      msg.textContent = "⚠️ Rol incorrecto para este usuario.";
      msg.style.color = "red";
      return;
    }
  }

  // Guardar sesión
  localStorage.setItem("usuarioActivo", JSON.stringify(user));

  msg.textContent = "Ingresando...";
  msg.style.color = "green";

  setTimeout(() => {
    window.location.href = user.role === "admin" ? "admin.html" : "usuario.html";
  }, 800);
}



/* ============================================================
   🟦 REGISTRO DE USUARIO NUEVO
============================================================ */

function registrarUsuario() {
  const nombre   = document.getElementById("reg-nombre").value.trim();
  const email    = document.getElementById("reg-email").value.trim();
  const telefono = document.getElementById("reg-telefono").value.trim();
  const password = document.getElementById("reg-password").value.trim();
  const msg      = document.getElementById("reg-mensaje");

  if (!nombre || !email || !telefono || !password) {
    msg.textContent = "⚠️ Completá todos los campos.";
    msg.style.color = "red";
    return;
  }

  const usuarios = getUsuariosTotales();

  if (usuarios.some(u => u.email === email)) {
    msg.textContent = "❌ Ese correo ya está registrado.";
    msg.style.color = "red";
    return;
  }

  // Crear usuario nuevo
  const nuevo = {
    id: Date.now(),
    nombre,
    email,
    telefono,
    password,
    role: "usuario"  // siempre usuario
  };

  usuariosCustom.push(nuevo);
  localStorage.setItem("usuariosCustom", JSON.stringify(usuariosCustom));

  msg.textContent = "✅ Cuenta creada correctamente. Redirigiendo...";
  msg.style.color = "green";

  setTimeout(() => { window.location.href = "index.html"; }, 1200);
}


/* ============================================================
   🔐 CONTROL DE SESIÓN
============================================================ */

function initSessionGuard(role) {
  const u = JSON.parse(localStorage.getItem("usuarioActivo"));
  if (!u) return window.location.href = "index.html";

  if (role && u.role !== role) {
    window.location.href = u.role === "admin" ? "admin.html" : "usuario.html";
  }
}

function cerrarSesion() {
  localStorage.removeItem("usuarioActivo");
  window.location.href = "index.html";
}

function getNombreActivo() {
  const u = JSON.parse(localStorage.getItem("usuarioActivo"));
  return u ? `Hola, ${u.nombre}` : "";
}


/* ============================================================
   💾 CARGA DE DATOS (AUTOS + RESERVAS)
============================================================ */

async function loadState() {
  try {
    const res = await fetch(API_AUTOS);
    autos = (await res.json()).map(a => ({
      id: Number(a.id),
      marca: a.marca,
      modelo: a.modelo,
      precioDia: Number(a.precio),
      disponible: a.disponible,
      img: a.imagen
    }));
  } catch (e) {
    console.error("Error cargando autos:", e);
  }

  try {
    const res = await fetch(API_RESERVAS);
    reservas = (await res.json()).map(r => ({
      ...r,
      id: Number(r.id),
      userId: Number(r.userId),
      carId: Number(r.carId),
      total: Number(r.total),
      fechaInicio: r.fechaInicio.split("T")[0],
      fechaFin: r.fechaFin.split("T")[0]
    }));
  } catch (e) {
    console.error("Error cargando reservas:", e);
  }
}


/* ============================================================
   🧰 PANEL ADMIN — LISTA AUTOS
============================================================ */

function renderAdmin() {
  document.getElementById("count-total").textContent = autos.length;

  const disp = autos.filter(a => a.disponible).length;
  document.getElementById("count-disponibles").textContent = disp;
  document.getElementById("count-no-disponibles").textContent = autos.length - disp;

  const ctx = document.getElementById("grafico");
  if (window._graficoPrincipal) window._graficoPrincipal.destroy();

  window._graficoPrincipal = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Disponibles", "No disponibles"],
      datasets: [{ data: [disp, autos.length - disp], backgroundColor: ["#4caf50", "#e15759"] }]
    },
    options: { cutout: "60%" }
  });

  pintarListaAutosAdmin();
  renderReservasAdmin();
  generarEstadisticas();
}

function pintarListaAutosAdmin() {
  const cont = document.getElementById("listaAutos");
  cont.innerHTML = "";

  autos.forEach(a => {
    cont.innerHTML += `
      <div class="card">
        <img src="${a.img}">
        <h4>${a.marca} ${a.modelo}</h4>
        <p class="price">${money(a.precioDia)} / día</p>

        <span class="badge ${a.disponible ? "ok" : "no"}">
          ${a.disponible ? "Disponible" : "No disponible"}
        </span>

        <div class="row">
          <button onclick="toggleDisponible(${a.id})">
            ${a.disponible ? "Marcar no disp." : "Marcar disponible"}
          </button>

          <button class="btn-delete" onclick="eliminarAuto(${a.id})">Eliminar</button>
        </div>
      </div>
    `;
  });
}


/* ============================================================
   ➕ AGREGAR AUTO
============================================================ */

async function agregarAuto(e) {
  e.preventDefault();

  const marca = document.getElementById("auto-marca").value.trim();
  const modelo = document.getElementById("auto-modelo").value.trim();
  const precio = Number(document.getElementById("auto-precio").value);
  const img = document.getElementById("auto-img").value.trim();
  const disp = document.getElementById("auto-disponible").checked;

  if (!marca || !modelo || !precio) {
    document.getElementById("msg-auto").textContent = "⚠️ Completá bien los datos.";
    return;
  }

  await fetch(API_AUTOS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ marca, modelo, precio, disponible: disp, imagen: img })
  });

  await loadState();
  renderAdmin();
}


/* ============================================================
   🔁 CAMBIAR DISPONIBILIDAD AUTO
============================================================ */

async function toggleDisponible(id) {
  const a = autos.find(x => x.id === id);

  await fetch(`${API_AUTOS}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...a,
      precio: a.precioDia,
      imagen: a.img,
      disponible: !a.disponible
    })
  });

  await loadState();
  renderAdmin();
}


/* ============================================================
   🗑 ELIMINAR AUTO
============================================================ */

async function eliminarAuto(id) {
  if (!confirm("¿Seguro?")) return;

  await fetch(`${API_AUTOS}/${id}`, { method: "DELETE" });

  await loadState();
  renderAdmin();
}


/* ============================================================
   👤 PANEL USUARIO — AUTOS DISPONIBLES
============================================================ */

function renderUsuario() {
  pintarAutosUsuario();
  pintarMisReservas();
}

function filtrarAutosUsuario() {
  pintarAutosUsuario();
}

function pintarAutosUsuario() {
  const cont = document.getElementById("autosUsuario");
  cont.innerHTML = "";

  let data = [...autos];

  const texto = document.getElementById("filtro-texto")?.value.toLowerCase() || "";
  if (texto) {
    data = data.filter(a =>
      a.marca.toLowerCase().includes(texto) ||
      a.modelo.toLowerCase().includes(texto)
    );
  }

  const marcaFiltro = document.getElementById("filtro-marca")?.value || "";
  if (marcaFiltro) data = data.filter(a => a.marca === marcaFiltro);

  const maxP = Number(document.getElementById("filtro-precio")?.value || 999999);
  data = data.filter(a => a.precioDia <= maxP);

  if (!data.length) {
    cont.innerHTML = `<div class="msg-user-pro">No hay autos que coincidan.</div>`;
    return;
  }

  data.forEach(a => {
    cont.innerHTML += `
      <div class="card fade-card">
        <img src="${a.img}">
        <h4>${a.marca} ${a.modelo}</h4>
        <p class="price">💰 ${money(a.precioDia)} / día</p>

        <span class="badge-status ${a.disponible ? "ok" : "no"}">
          ${a.disponible ? "Disponible" : "No disponible"}
        </span>

        <button 
          onclick="${a.disponible ? `reservar(${a.id})` : ""}"
          ${a.disponible ? "" : "disabled"}
          class="${a.disponible ? "btn-active" : "btn-disabled"}"
        >
          ${a.disponible ? "Reservar" : "No disponible"}
        </button>
      </div>
    `;
  });
}


/* ============================================================
   📅 VALIDAR FECHAS
============================================================ */

function validarFechas(fi, ff) {
  if (!fi || !ff) return { ok: false, msg: "Elegí fecha inicio y fin." };

  const i = new Date(fi);
  const f = new Date(ff);

  if (f <= i) return { ok: false, msg: "La fecha fin debe ser mayor." };

  return {
    ok: true,
    dias: Math.ceil((f - i) / (1000 * 60 * 60 * 24))
  };
}


/* ============================================================
   📝 RESERVAR AUTO
============================================================ */
let nextIdReserva = Number(localStorage.getItem("nextIdReserva")) || 50;

async function reservar(id) {
  const msg = document.getElementById("msg-usuario");
  const user = JSON.parse(localStorage.getItem("usuarioActivo"));
  const auto = autos.find(a => a.id === id);

  const fi = document.getElementById("fechaInicio").value;
  const ff = document.getElementById("fechaFin").value;

  const val = validarFechas(fi, ff);
  if (!val.ok) { msg.textContent = val.msg; return; }

  const total = val.dias * auto.precioDia;

  // Generamos ID controlado
  // 1) Crear reserva y OBTENER LA RESPUESTA (IMPORTANTE VER Y CORREGIR)
// 1) Generar nuestro propio ID visible
const nuevoId = reservaIdCounter;

// 2) Crear la reserva en MockAPI
const nuevaReserva = await fetch(API_RESERVAS, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    reservaId: nuevoId,       // nuestro ID real
    userId: user.id,
    carId: auto.id,
    fechaInicio: fi,
    fechaFin: ff,
    total,
    estado: "pendiente",
    nombre: user.nombre || "",
    dni: user.dni || "",
    telefono: user.telefono || ""
  })
}).then(r => r.json());

// 3) Incrementar contador
reservaIdCounter++;
localStorage.setItem("reservaIdCounter", reservaIdCounter);


// 2) Asegurar que el ID devuelto se convierta a número
nuevaReserva.id = Number(nuevaReserva.id);

// 3) Guardar la reserva en tu arreglo local también
reservas.push(nuevaReserva);



  // Actualizar auto
  await fetch(`${API_AUTOS}/${auto.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      marca: auto.marca,
      modelo: auto.modelo,
      precio: auto.precioDia,
      imagen: auto.img,
      disponible: false
    })
  });

  await loadState();
  pintarAutosUsuario();
  pintarMisReservas();

  msg.textContent = `✅ Reserva creada (#${idForzado}) — Total: ${money(total)}`;
}





/* ============================================================
   📅 MIS RESERVAS
============================================================ */

function formatoArg(f) {
  const [a, m, d] = f.split("-");
  return `${d}/${m}/${a}`;
}

async function pintarMisReservas() {
  const u = JSON.parse(localStorage.getItem("usuarioActivo"));
  const cont = document.getElementById("misReservas");

  const res = await fetch(API_RESERVAS);
  reservas = await res.json();

  reservas = reservas.map(r => ({
    ...r,
    id: Number(r.id),
    userId: Number(r.userId),
    carId: Number(r.carId),
    fechaInicio: r.fechaInicio.split("T")[0],
    fechaFin: r.fechaFin.split("T")[0]
  }));

  const mis = reservas.filter(r => r.userId === u.id);

  cont.innerHTML = "";

  if (!mis.length) {
    cont.innerHTML = `<div class="msg">No tenés reservas aún.</div>`;
    return;
  }

  mis.forEach(r => {
  const auto = autos.find(a => a.id === r.carId);

  cont.innerHTML += `
    <div class="item">
      <div class="reserva-card-pro">
        <strong>Reserva #${r.reservaId}</strong>
        <p>${auto.marca} ${auto.modelo}</p>
        <p>${formatoArg(r.fechaInicio)} → ${formatoArg(r.fechaFin)}</p>
        <p class="total">Total: ${money(r.total)}</p>

        ${r.estado === "pendiente"
          ? `<button class="btn-cancel" onclick="cancelarReserva(${r.id})">Cancelar</button>`
          : `<span class="badge-status no">Cancelada</span>`}
      </div>
    </div>
  `;
});
}


/* ============================================================
   ❌ CANCELAR RESERVA
============================================================ */

async function cancelarReserva(id) {
  try {
    console.log("Cancelando reserva ID:", id);

    // 1) Traemos la reserva desde MockAPI
    const resApi = await fetch(`${API_RESERVAS}/${id}`);
    if (!resApi.ok) {
      console.error("❌ Error obteniendo reserva", resApi.status);
      return;
    }

    const reservaOriginal = await resApi.json();

    // 2) Creamos objeto actualizado COMPLETO
    const reservaActualizada = {
      id: reservaOriginal.id, // 👈 Aseguramos que NO sea NaN
      userId: Number(reservaOriginal.userId),
      carId: Number(reservaOriginal.carId),
      fechaInicio: reservaOriginal.fechaInicio,
      fechaFin: reservaOriginal.fechaFin,
      total: Number(reservaOriginal.total),
      estado: "cancelado",
      nombre: reservaOriginal.nombre || "",
      telefono: reservaOriginal.telefono || "",
      dni: reservaOriginal.dni || ""
    };

    // 3) Guardamos actualización en MockAPI
    await fetch(`${API_RESERVAS}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reservaActualizada)
    });

    // 4) Volvemos a poner el auto disponible
    const auto = autos.find(a => a.id === reservaOriginal.carId);
    if (auto) {
      await fetch(`${API_AUTOS}/${auto.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marca: auto.marca,
          modelo: auto.modelo,
          precio: auto.precioDia,
          disponible: true,
          imagen: auto.img
        })
      });
    }

    // 5) Recargar pantallas
    await loadState();

    if (document.getElementById("misReservas")) pintarMisReservas();
    if (document.getElementById("tablaReservas")) renderReservasAdmin();

    console.log("✅ Reserva cancelada correctamente");

  } catch (error) {
    console.error("🔥 ERROR CANCELANDO RESERVA:", error);
  }
}



/* ============================================================
   📋 RESERVAS EN ADMIN
============================================================ */

function renderReservasAdmin() {
  const tbody = document.getElementById("tablaReservas");
  if (!tbody) return;

  tbody.innerHTML = "";

  reservas.forEach(r => {
    const auto = autos.find(a => a.id === r.carId);

    tbody.innerHTML += `
      <tr>
        <td>${r.id}</td>
        <td>${r.nombre || "-"}</td>
        <td>${r.telefono || "-"}</td>
        <td>${auto ? auto.marca + " " + auto.modelo : "-"}</td>
        <td>${r.fechaInicio}</td>
        <td>${r.fechaFin}</td>
        <td>${money(r.total)}</td>
        <td>${r.estado}</td>
        <td>
          ${r.estado === "pendiente"
            ? `<button onclick="cancelarReserva(${r.id})" class="btn-cancel-admin">Cancelar</button>`
            : `<span class="badge no">Cancelada</span>`}
        </td>
      </tr>
    `;
  });
}


/* ============================================================
   📌 FILTROS DE FECHAS PARA ESTADÍSTICAS
============================================================ */

function filtrarOctubre() {
  return reservas.filter(r => {
    if (!r.fechaInicio) return false;
    const f = new Date(r.fechaInicio);
    return f >= new Date("2025-10-01") && f <= new Date("2025-10-31");
  });
}

function filtrarActual() {
  return reservas.filter(r => {
    if (!r.fechaInicio) return false;
    const f = new Date(r.fechaInicio);
    return f >= new Date("2025-11-01") && f <= new Date("2025-12-31");
  });
}



/* ============================================================
   📌 AGRUPAR RESERVAS POR AUTO
============================================================ */

function agruparPorAuto(listado) {
  const mapa = {};

  listado.forEach(r => {
    if (!mapa[r.carId]) mapa[r.carId] = [];
    mapa[r.carId].push(r);
  });

  return mapa;
}



/* ============================================================
   📌 GRAFICAR ESTADÍSTICAS
============================================================ */

function graficarEstadisticas(mapaAutos, titulo, id1, id2, id3, id4, id5, id6) {

  const labels = Object.keys(mapaAutos).map(id => {
    const a = autos.find(x => x.id == id);
    return a ? `${a.marca} ${a.modelo}` : `Auto ${id}`;
  });

  const cantReservas = Object.values(mapaAutos).map(arr => arr.length);

  const diasReservados = Object.values(mapaAutos).map(arr =>
    arr.reduce((acc, r) => {
      const i = new Date(r.fechaInicio);
      const f = new Date(r.fechaFin);
      return acc + ((f - i) / (1000 * 60 * 60 * 24));
    }, 0)
  );

  const ingresosTotales = Object.values(mapaAutos).map(arr =>
    arr.reduce((acc, r) => acc + (Number(r.total) || 0), 0)
  );

  if (!window._charts) window._charts = [];


  /* --- Gráfico 1: Cantidad de reservas por auto --- */
  let ctx = document.getElementById(id1);
  if (ctx) {
    window._charts.push(new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: `Reservas ${titulo}`,
          data: cantReservas,
          backgroundColor: "#4a90e2"
        }]
      }
    }));
  }


  /* --- Gráfico 2: Días reservados por auto --- */
  ctx = document.getElementById(id2);
  if (ctx) {
    window._charts.push(new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: `Días reservados ${titulo}`,
          data: diasReservados,
          backgroundColor: "#2ecc71"
        }]
      }
    }));
  }


  /* --- Gráfico 3: Ingresos por auto --- */
  ctx = document.getElementById(id3);
  if (ctx) {
    window._charts.push(new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: `Ingresos ${titulo}`,
          data: ingresosTotales,
          borderColor: "#f1c40f",
          borderWidth: 3
        }]
      }
    }));
  }


  /* --- Gráfico 4: Top 5 autos más rentables --- */
  const topIngresos = labels.map((n, i) => ({ name: n, total: ingresosTotales[i] }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  ctx = document.getElementById(id4);
  if (ctx) {
    window._charts.push(new Chart(ctx, {
      type: "bar",
      data: {
        labels: topIngresos.map(a => a.name),
        datasets: [{
          label: `Top 5 rentables ${titulo}`,
          data: topIngresos.map(a => a.total),
          backgroundColor: "#e74c3c"
        }]
      }
    }));
  }


  /* --- Gráfico 5: % de ocupación general --- */
  const diasOcupados = diasReservados.reduce((a, b) => a + b, 0);
  const diasTotales = autos.length * 31;

  ctx = document.getElementById(id5);
  if (ctx) {
    window._charts.push(new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Ocupado", "Libre"],
        datasets: [{
          data: [diasOcupados, diasTotales - diasOcupados],
          backgroundColor: ["#2ecc71", "#e74c3c"]
        }]
      }
    }));
  }


  /* --- Gráfico 6: Top 5 por cantidad de reservas --- */
  const topReservas = labels.map((name, i) => ({
    name,
    cant: cantReservas[i]
  }))
    .sort((a, b) => b.cant - a.cant)
    .slice(0, 5);

  ctx = document.getElementById(id6);
  if (ctx) {
    window._charts.push(new Chart(ctx, {
      type: "bar",
      data: {
        labels: topReservas.map(a => a.name),
        datasets: [{
          label: `Reservas ${titulo}`,
          data: topReservas.map(a => a.cant),
          backgroundColor: "#3498db"
        }]
      }
    }));
  }
}



/* ============================================================
   🚀 GENERAR PANELES DE ESTADÍSTICAS
============================================================ */

function generarEstadisticas() {

  if (window._charts) {
    window._charts.forEach(c => c.destroy());
    window._charts = [];
  }

  const dataOct = filtrarOctubre();
  const mapaOct = agruparPorAuto(dataOct);

  graficarEstadisticas(
    mapaOct,
    "Octubre 2025",
    "grafico-marcas",
    "grafico-disponibilidad-marcas",
    "grafico-promedios",
    "grafico-top5",
    "grafico-porcentaje",
    "grafico-top5-baratos"
  );


  const dataAct = filtrarActual();
  const mapaAct = agruparPorAuto(dataAct);

  graficarEstadisticas(
    mapaAct,
    "Nov–Dic 2025",
    "grafico-marcas-actual",
    "grafico-disponibilidad-actual",
    "grafico-promedios-actual",
    "grafico-top5-actual",
    "grafico-porcentaje-actual",
    "grafico-top5-baratos-actual"
  );
}



/* ============================================================
   📋 RENDER RESERVAS ADMIN
============================================================ */

function renderReservasAdmin() {
  const tbody = document.getElementById("tablaReservas");
  if (!tbody) return;

  tbody.innerHTML = "";

  reservas.forEach(r => {
    const auto = autos.find(a => a.id === r.carId);

    tbody.innerHTML += `
      <tr>
        <td>${r.id}</td>
        <td>${r.nombre || "-"}</td>
        <td>${r.dni || "-"}</td>
        <td>${r.telefono || "-"}</td>
        <td>${auto ? `${auto.marca} ${auto.modelo}` : "-"}</td>
        <td>${r.fechaInicio}</td>
        <td>${r.fechaFin}</td>
        <td>${money(r.total)}</td>
        <td>${r.estado}</td>
        <td>
          ${r.estado === "pendiente"
            ? `<button onclick="cancelarReserva(${r.id})" class="btn-cancel-admin">Cancelar</button>`
            : `<span class="badge no">Cancelada</span>`}
        </td>
      </tr>
    `;
  });
}



/* ============================================================
   ❌ CANCELAR RESERVA
============================================================ */

async function cancelarReserva(id) {
  try {
    const resApi = await fetch(`${API_RESERVAS}/${id}`);
    const reservaOriginal = await resApi.json();

    const reservaActualizada = {
      userId: Number(reservaOriginal.userId),
      carId: Number(reservaOriginal.carId),
      fechaInicio: reservaOriginal.fechaInicio,
      fechaFin: reservaOriginal.fechaFin,
      total: Number(reservaOriginal.total),
      estado: "cancelado",
      ...(reservaOriginal.nombre && { nombre: reservaOriginal.nombre }),
      ...(reservaOriginal.dni && { dni: reservaOriginal.dni }),
      ...(reservaOriginal.telefono && { telefono: reservaOriginal.telefono })
    };

    await fetch(`${API_RESERVAS}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reservaActualizada)
    });

    const auto = autos.find(a => a.id === Number(reservaOriginal.carId));
    if (auto) {
      await fetch(`${API_AUTOS}/${auto.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marca: auto.marca,
          modelo: auto.modelo,
          precio: auto.precioDia,
          disponible: true,
          imagen: auto.img
        })
      });
    }

    await loadState();

    if (document.getElementById("misReservas")) pintarMisReservas();
    if (document.getElementById("tablaReservas")) renderReservasAdmin();

  } catch (error) {
    console.error("Error cancelando reserva:", error);
  }
}



/* ============================================================
   🆕 REGISTRO DE NUEVO USUARIO
============================================================ */

function registerUser() {
  console.log("➡ Ejecutando registerUser()...");

  const nombre = document.getElementById("reg-nombre").value.trim();
  const telefono = document.getElementById("reg-telefono").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const pass = document.getElementById("reg-pass").value.trim();
  const msg = document.getElementById("mensaje-registro");

  // Validaciones
  if (!nombre || !telefono || !email || !pass) {
    msg.textContent = "⚠️ Completá todos los campos.";
    msg.style.color = "red";
    return;
  }

  // Ver si el correo YA existe
  const usuariosGuardados = JSON.parse(localStorage.getItem("usuariosExtra")) || [];
  const existe = usuariosGuardados.find(u => u.email === email);

  if (existe) {
    msg.textContent = "❌ Este correo ya está registrado.";
    msg.style.color = "red";
    return;
  }

  // Crear usuario nuevo
  const nuevoUsuario = {
    id: Date.now(),
    nombre,
    telefono,
    email,
    password: pass,
    role: "usuario"
  };

  // Guardarlo en localStorage
  usuariosGuardados.push(nuevoUsuario);
  localStorage.setItem("usuariosExtra", JSON.stringify(usuariosGuardados));

  msg.textContent = "✅ Usuario registrado correctamente. Redirigiendo...";
  msg.style.color = "green";

  setTimeout(() => {
    window.location.href = "index.html";
  }, 1500);
}
