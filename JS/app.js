let carrito = [];
let productos = [];

const obtenerProductos = async () => {
    try {
        const response = await fetch('http://127.0.0.1:5500/json/productos.json');
        if (!response.ok) {
            throw new Error('No se pudo cargar la lista de productos.');
        }
        productos = await response.json();
        cargarProductos();
    } catch (error) {
        console.error(error);
    }
};

obtenerProductos();

const cargarProductos = () => {
    const cardContainer = document.getElementById('card-container');

    productos.forEach((producto, index) => {
        const card = document.createElement('div');
        card.classList.add('col-md-4', 'mb-4');

        card.innerHTML = `
            <div class="card">
                <img src="${producto.imagen}" class="card-img-top" alt="...">
                <div class="card-body">
                    <h5 class="card-title">${producto.nombre}</h5>
                    <p class="card-text">${producto.descripcion}</p>
                    <div class="card-header">Precio: ${producto.precio}</div>
                    <a href="#" class="btn btn-primary" data-producto="${index}">Añadir al carrito</a>
                </div>
            </div>
        `;

        cardContainer.appendChild(card);

        const botonAgregar = card.querySelector('[data-producto]');
        botonAgregar.addEventListener('click', (event) => {
            event.preventDefault();
            agregarAlCarrito(index);
        });
    });
};

const carritoGuardado = localStorage.getItem('carrito');
carrito = carritoGuardado ? (Array.isArray(JSON.parse(carritoGuardado)) ? JSON.parse(carritoGuardado) : []) : [];

const calcularTotal = () => carrito.reduce((total, { precio, cantidad }) => total + parseFloat(precio.replace("$", "").trim()) * cantidad, 0);

const guardarCarritoEnLocalStorage = () => localStorage.setItem('carrito', JSON.stringify(carrito));

actualizarCarrito();

function agregarAlCarrito(index) {
    const producto = productos[index];

    if (producto.stock <= 0) {
        Toastify({
            text: "Producto agotado",
            duration: 3000,
            close: true,
            gravity: "bottom",
            position: "right",
            stopOnFocus: true,
            style: {
                background: "linear-gradient(to right, #ff4b2b, #ff416c)",
            },
        }).showToast();
        return;
    }

    const productoEnCarrito = carrito.find(item => item.id === producto.id);

    if (productoEnCarrito) {
        productoEnCarrito.cantidad++;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }

    producto.stock--;
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
    const productoEnCarrito = carrito[index];

    const productoCorrespondiente = productos.find(item => item.id === productoEnCarrito.id);

    if (productoCorrespondiente) {
        productoCorrespondiente.stock += productoEnCarrito.cantidad;
    }

    carrito.splice(index, 1);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarCarrito();
}

const finalizarCompra = () => {
    const total = calcularTotal();
    Swal.fire({
        title: 'Compra realizada!',
        text: `El precio total de su compra es: $${total.toFixed(2)}. Nos pondremos en contacto con usted para arreglar el envío y método de pago.`,
        icon: 'success',
        confirmButtonText: '<i class="fa fa-thumbs-up"></i> Great!'
    });

    carrito = [];
    localStorage.removeItem('carrito');
    actualizarCarrito();
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
        ['carritoDropdown', 'finalizarCompra'].forEach(id => document.getElementById(id).classList.add('desactivado'));
    } else {
        ['carritoDropdown', 'finalizarCompra'].forEach(id => document.getElementById(id).classList.remove('desactivado'));
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
            botonEliminar.addEventListener('click', (event) => {
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