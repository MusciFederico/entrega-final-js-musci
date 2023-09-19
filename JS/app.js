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
carrito = carritoGuardado ? (Array.isArray(JSON.parse(carritoGuardado)) ? JSON.parse(carritoGuardado) : []) : [];

actualizarCarrito();

const cards = document.querySelectorAll('.card');

cards.forEach((card, index) => {
    const { precio } = productos[index];
    card.querySelector('.card-header').textContent = `Precio: ${precio}`;
});

function agregarAlCarrito(index) {
    const producto = productos[index];
    const productoEnCarrito = carrito.find(item => item.id === producto.id);

    (productoEnCarrito ? productoEnCarrito : carrito.push({ ...producto, cantidad: 1 })).cantidad++;

    actualizarCarrito();

    Toastify({
        text: "Producto agregado al carrito",
        duration: 3000,
        close: true,
        gravity: "bottom",
        position: "right",
        stopOnFocus: true,
        style: {
            background: "linear-gradient(to right, #0f2027, #203a43, #2c5364)",
        },
    }).showToast();
}


function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarCarrito();
}

const finalizarCompra = () => {
    Swal.fire({
        title: 'Compra realizada!',
        text: 'Nos pondremos en contacto con usted para arreglar el envío y método de pago',
        icon: 'success',
        confirmButtonText: '<i class="fa fa-thumbs-up"></i> Great!'
    });

    carrito = [];
    localStorage.removeItem('carrito');
    actualizarCarrito();
}

function calcularTotal() {
    return carrito.reduce((total, productoEnCarrito) => {
        const precioNumerico = parseFloat(productoEnCarrito.precio.replace("$", "").trim());
        return total + (precioNumerico * productoEnCarrito.cantidad);
    }, 0);
}

function guardarCarritoEnLocalStorage() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

function actualizarCarrito() {
    const carritoBadge = document.getElementById("carritoBadge");
    const carritoMenu = document.getElementById("carrito");
    const mensajeCarritoVacio = document.getElementById("mensajeCarritoVacio");
    const totalCarritoElement = document.getElementById("totalCarrito");

    carritoBadge.textContent = carrito.length;
    carritoMenu.innerHTML = "";

    if (carrito.length === 0) {
        carritoBadge.textContent = "0";
        mensajeCarritoVacio.textContent = "El carrito está vacío.";
        totalCarritoElement.textContent = `Total: $0.00`;
        document.getElementById('carritoDropdown').classList.add('desactivado');
        document.getElementById('finalizarCompra').classList.add('desactivado');
    } else {
        document.getElementById('carritoDropdown').classList.remove('desactivado');
        document.getElementById('finalizarCompra').classList.remove('desactivado');
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
        });

        const total = calcularTotal();
        totalCarritoElement.textContent = `Total: $${total.toFixed(2)}`;
        guardarCarritoEnLocalStorage();
    }
}

document.getElementById('finalizarCompra').addEventListener('click', () => {
    finalizarCompra();
});

document.querySelectorAll('[data-producto]').forEach((boton, index) => {
    boton.addEventListener('click', (event) => {
        event.preventDefault();
        agregarAlCarrito(index);
    });
});