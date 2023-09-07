const productos = [
    { id: 1, nombre: "Producto 1", precio: "$50" },
    { id: 2, nombre: "Producto 2", precio: "$60" },
    { id: 3, nombre: "Producto 3", precio: "$70" },
    { id: 4, nombre: "Producto 4", precio: "$80" },
    { id: 5, nombre: "Producto 5", precio: "$100" },
    { id: 6, nombre: "Producto 6", precio: "$120" },
];

let carrito = [];

const carritoGuardado = localStorage.getItem('carrito');
if (carritoGuardado) {
    carrito = JSON.parse(carritoGuardado);

    if (!Array.isArray(carrito)) {
        carrito = [];
    }
}

actualizarCarrito();

const cards = document.querySelectorAll('.card');

cards.forEach((card, index) => {
    const producto = productos[index];
    const precio = producto.precio;
    const precioElement = card.querySelector('.card-header');
    precioElement.textContent = `Precio: ${precio}`;
});

function agregarAlCarrito(index) {
    const producto = productos[index];
    const productoEnCarrito = carrito.find(item => item.id === producto.id);

    if (productoEnCarrito) {
        productoEnCarrito.cantidad++;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }

    actualizarCarrito();
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarCarrito();
}

function calcularTotal() {
    let total = 0;
    if (carrito.length <= 0) {
        return total;
    } else {
        carrito.forEach((productoEnCarrito) => {
            const precioNumerico = parseFloat(productoEnCarrito.precio.replace("$", "").trim());
            total += precioNumerico * productoEnCarrito.cantidad;
        });
        return total;
    }
}

function guardarCarritoEnLocalStorage() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

function actualizarCarrito() {
    const carritoBadge = document.getElementById("carritoBadge");
    const carritoMenu = document.getElementById("carrito");
    const mensajeCarritoVacio = document.getElementById("mensajeCarritoVacio");

    carritoBadge.textContent = carrito.length;
    carritoMenu.innerHTML = "";

    if (carrito.length === 0) {
        carritoBadge.textContent = "0";
        mensajeCarritoVacio.textContent = "El carrito está vacío.";
        const totalCarritoElement = document.getElementById("totalCarrito");
        const total = calcularTotal();
        totalCarritoElement.textContent = `Total: $${total.toFixed(2)}`;
        document.getElementById('carritoDropdown').classList.add('desactivado');
    } else {
        document.getElementById('carritoDropdown').classList.remove('desactivado');
        mensajeCarritoVacio.textContent = "";
        const cantidadTotal = carrito.reduce((total, producto) => total + producto.cantidad, 0);
        carritoBadge.textContent = cantidadTotal.toString();
        carrito.forEach((productoEnCarrito, index) => {
            const li = document.createElement("li");
            li.textContent = `${productoEnCarrito.nombre} - Precio: ${productoEnCarrito.precio} - Cantidad: ${productoEnCarrito.cantidad}`;
            const botonEliminar = document.createElement("button");
            botonEliminar.classList.add("btn", "btn-danger", "btn-sm");
            const iconoEliminar = document.createElement("i");
            iconoEliminar.classList.add("fas", "fa-times");
            botonEliminar.appendChild(iconoEliminar);
            botonEliminar.addEventListener('click', () => {
                event.stopPropagation();
                eliminarDelCarrito(index);
            });
            li.appendChild(botonEliminar);
            carritoMenu.appendChild(li);
            const totalCarritoElement = document.getElementById("totalCarrito");
            const total = calcularTotal();
            totalCarritoElement.textContent = `Total: $${total.toFixed(2)}`;
            guardarCarritoEnLocalStorage();
        });
    }
}

const botonesAgregarCarrito = document.querySelectorAll('[data-producto]');
botonesAgregarCarrito.forEach((boton, index) => {
    boton.addEventListener('click', () => {
        event.preventDefault()
        agregarAlCarrito(index);
    });
});