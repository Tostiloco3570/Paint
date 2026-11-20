document.addEventListener('DOMContentLoaded', () => {

    // Referencias a los lienzos y sus contextos 2D
    const canvas = document.getElementById('lienzoPrincipal');
    const ctx = canvas.getContext('2d');

    // Canvas secundario para ver la previsualización de lo que vamos dibujando
    const canvasPreview = document.getElementById('lienzoPreview');
    const previewCtx = canvasPreview.getContext('2d');

    // Elementos de la barra de información
    const coordenadas = document.getElementById('coordenadas');
    const dimensionesLienzo = document.getElementById('dimensionesLienzo');
    const infoHerramienta = document.getElementById('infoHerramienta');

    // Botones del menú principal
    const btnNuevo = document.getElementById('btnNuevo');
    const btnAbrir = document.getElementById('btnAbrir');
    const inputArchivo = document.getElementById('inputArchivo');
    const btnGuardarModal = document.getElementById('btnGuardarModal');
    const btnLimpiar = document.getElementById('btnLimpiar');

    // Controles para el color y el grosor del pincel
    const colorActualIndicador = document.getElementById('colorActualIndicador');
    const inputColorPersonalizado = document.getElementById('inputColorPersonalizado');
    const paletaColores = document.getElementById('paletaColores');
    const inputGrosor = document.getElementById('inputGrosor');
    const grosorValor = document.getElementById('grosorValor');
    const checkRellenoFigura = document.getElementById('checkRellenoFigura');

    // Botones de las herramientas
    const toolButtons = document.querySelectorAll('.tool-btn[data-tool]');

    // Modales para crear nuevo lienzo o guardar
    const modalNuevo = document.getElementById('modalNuevo');
    const modalGuardar = document.getElementById('modalGuardar');

    // Variables para controlar el estado del dibujo
    let herramienta = 'lapiz';
    let color = '#000000';
    let colorFondo = '#ffffff';
    let grosor = 3;
    let relleno = false;

    // Coordenadas y banderas para el mouse
    let dibujando = false;
    let xInicio = 0;
    let yInicio = 0;
    let xUltimo = 0;
    let yUltimo = 0;

    // Variables para la curva (paso 1: trazar la recta, paso 2: arquearla)
    let curvaPaso = 0;
    let curvaX0 = 0;
    let curvaY0 = 0;
    let curvaX1 = 0;
    let curvaY1 = 0;
    let curvaDibujandoLinea = false;
    let curvaAjustando = false;

    // Función para definir el tamaño y color de fondo del lienzo
    function configurarLienzo(ancho, alto, fondo) {
        canvas.width = ancho;
        canvas.height = alto;
        canvasPreview.width = ancho;
        canvasPreview.height = alto;

        colorFondo = fondo;

        // Pintamos el fondo inicial
        ctx.fillStyle = colorFondo;
        ctx.fillRect(0, 0, ancho, alto);

        dimensionesLienzo.innerHTML = ancho + ' × ' + alto + ' px';
    }

    // Tamaño por defecto al abrir la página
    configurarLienzo(900, 550, '#ffffff');

    // Dibuja un punto azul guía con contorno blanco
    function dibujarPuntoGuia(contexto, x, y) {
        contexto.save();
        contexto.beginPath();
        contexto.arc(x, y, Math.max(5, Number(grosor) + 2), 0, Math.PI * 2);
        contexto.fillStyle = '#0078d7';
        contexto.fill();
        contexto.lineWidth = 2;
        contexto.strokeStyle = '#ffffff';
        contexto.stroke();
        contexto.restore();
    }

    // Muestra cómo va quedando la curva mientras movemos el ratón
    function previsualizarCurva(mx, my) {
        let midX = (curvaX0 + curvaX1) / 2;
        let midY = (curvaY0 + curvaY1) / 2;
        // Calculamos el punto de control para que la curva pase justo por el cursor
        let cpx = 2 * mx - midX;
        let cpy = 2 * my - midY;

        previewCtx.clearRect(0, 0, canvasPreview.width, canvasPreview.height);
        previewCtx.save();
        previewCtx.strokeStyle = color;
        previewCtx.lineWidth = grosor;
        previewCtx.lineCap = 'round';
        previewCtx.beginPath();
        previewCtx.moveTo(curvaX0, curvaY0);
        previewCtx.quadraticCurveTo(cpx, cpy, curvaX1, curvaY1);
        previewCtx.stroke();
        previewCtx.restore();

        // El punto azul sigue la línea de la curva
        dibujarPuntoGuia(previewCtx, mx, my);
    }

    // Al presionar el ratón o tocar la pantalla
    function iniciarAccion(x, y) {
        xInicio = x;
        yInicio = y;
        xUltimo = x;
        yUltimo = y;

        if (herramienta === 'curva') {
            if (curvaPaso === 0) {
                // Paso 1: definimos los extremos de la línea recta
                curvaX0 = x;
                curvaY0 = y;
                curvaDibujandoLinea = true;
                dibujando = true;
            } else if (curvaPaso === 1) {
                // Paso 2: empezamos a arquear la curvatura
                curvaAjustando = true;
                dibujando = true;
                previsualizarCurva(x, y);
            }
            return;
        }

        dibujando = true;

        if (herramienta === 'lapiz') {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y);
            ctx.strokeStyle = color;
            ctx.lineWidth = grosor;
            ctx.lineCap = 'round';
            ctx.stroke();
        }
    }

    // Al mover el ratón o arrastrar el dedo
    function moverAccion(x, y) {
        coordenadas.innerHTML = 'x : ' + x + ' | y : ' + y;

        if (herramienta === 'curva') {
            if (curvaDibujandoLinea) {
                // Vista previa de la recta inicial
                previewCtx.clearRect(0, 0, canvasPreview.width, canvasPreview.height);
                previewCtx.save();
                previewCtx.strokeStyle = color;
                previewCtx.lineWidth = grosor;
                previewCtx.lineCap = 'round';
                previewCtx.beginPath();
                previewCtx.moveTo(curvaX0, curvaY0);
                previewCtx.lineTo(x, y);
                previewCtx.stroke();
                previewCtx.restore();
            } else if (curvaAjustando) {
                // Vista previa de la curva doblándose
                previsualizarCurva(x, y);
            }
            return;
        }

        if (dibujando) {
            if (herramienta === 'lapiz') {
                // Trazado libre uniendo puntos continuos
                ctx.beginPath();
                ctx.moveTo(xUltimo, yUltimo);
                ctx.lineTo(x, y);
                ctx.strokeStyle = color;
                ctx.lineWidth = grosor;
                ctx.lineCap = 'round';
                ctx.stroke();

                xUltimo = x;
                yUltimo = y;
            } else {
                // Vista previa de las demás figuras
                previewCtx.clearRect(0, 0, canvasPreview.width, canvasPreview.height);
                dibujarFigura(previewCtx, herramienta, xInicio, yInicio, x, y);
            }
        }
    }

    // Al soltar el clic o levantar el dedo
    function finalizarAccion(x, y) {
        if (herramienta === 'curva') {
            if (curvaDibujandoLinea) {
                curvaDibujandoLinea = false;
                dibujando = false;
                curvaX1 = x;
                curvaY1 = y;
                curvaPaso = 1; // Pasamos al paso 2

                // Mostramos la línea con el punto azul en el centro
                previewCtx.clearRect(0, 0, canvasPreview.width, canvasPreview.height);
                previewCtx.save();
                previewCtx.strokeStyle = color;
                previewCtx.lineWidth = grosor;
                previewCtx.lineCap = 'round';
                previewCtx.beginPath();
                previewCtx.moveTo(curvaX0, curvaY0);
                previewCtx.lineTo(curvaX1, curvaY1);
                previewCtx.stroke();
                previewCtx.restore();

                let midX = (curvaX0 + curvaX1) / 2;
                let midY = (curvaY0 + curvaY1) / 2;
                dibujarPuntoGuia(previewCtx, midX, midY);

                infoHerramienta.innerHTML = 'Herramienta: Curva (Paso 2: Arrastra el punto azul central para arquear la curvatura)';
            } else if (curvaAjustando) {
                curvaAjustando = false;
                dibujando = false;
                curvaPaso = 0; // Reiniciamos para la siguiente curva

                previewCtx.clearRect(0, 0, canvasPreview.width, canvasPreview.height);

                let midX = (curvaX0 + curvaX1) / 2;
                let midY = (curvaY0 + curvaY1) / 2;
                let cpx = 2 * x - midX;
                let cpy = 2 * y - midY;

                // Pasamos la curva definitiva al lienzo principal
                ctx.save();
                ctx.strokeStyle = color;
                ctx.lineWidth = grosor;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(curvaX0, curvaY0);
                ctx.quadraticCurveTo(cpx, cpy, curvaX1, curvaY1);
                ctx.stroke();
                ctx.restore();

                infoHerramienta.innerHTML = 'Herramienta: Curva';
            }
            return;
        }

        if (!dibujando) return;
        dibujando = false;

        if (herramienta !== 'lapiz') {
            previewCtx.clearRect(0, 0, canvasPreview.width, canvasPreview.height);
            dibujarFigura(ctx, herramienta, xInicio, yInicio, x, y);
        }
    }

    // Eventos para el ratón
    canvas.addEventListener('mousedown', (evento) => {
        if (evento.button !== 0) return;
        iniciarAccion(evento.offsetX, evento.offsetY);
    });

    canvas.addEventListener('mousemove', (evento) => {
        if (!dibujando) {
            moverAccion(evento.offsetX, evento.offsetY);
        }
    });

    // Permite seguir dibujando o arqueando aunque el ratón llegue al borde del lienzo
    window.addEventListener('mousemove', (evento) => {
        if (dibujando) {
            const rect = canvas.getBoundingClientRect();
            const escalaX = canvas.width / rect.width;
            const escalaY = canvas.height / rect.height;
            let x = Math.round((evento.clientX - rect.left) * escalaX);
            let y = Math.round((evento.clientY - rect.top) * escalaY);
            x = Math.max(0, Math.min(canvas.width, x));
            y = Math.max(0, Math.min(canvas.height, y));
            moverAccion(x, y);
        }
    });

    window.addEventListener('mouseup', (evento) => {
        if (!dibujando && curvaPaso === 0) return;
        const rect = canvas.getBoundingClientRect();
        const escalaX = canvas.width / rect.width;
        const escalaY = canvas.height / rect.height;
        let x = Math.round((evento.clientX - rect.left) * escalaX);
        let y = Math.round((evento.clientY - rect.top) * escalaY);
        x = Math.max(0, Math.min(canvas.width, x));
        y = Math.max(0, Math.min(canvas.height, y));
        finalizarAccion(x, y);
    });

    canvas.addEventListener('mouseleave', () => {
        if (!dibujando) {
            coordenadas.innerHTML = 'x : 0 | y : 0';
        }
    });

    // Funciones y eventos para soporte en celular o tablet
    function obtenerCoordenadasTouch(e) {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0] || e.changedTouches[0];
        const escalaX = canvas.width / rect.width;
        const escalaY = canvas.height / rect.height;

        let x = Math.round((touch.clientX - rect.left) * escalaX);
        let y = Math.round((touch.clientY - rect.top) * escalaY);
        if (dibujando) {
            x = Math.max(0, Math.min(canvas.width, x));
            y = Math.max(0, Math.min(canvas.height, y));
        }
        return { x, y };
    }

    canvas.addEventListener('touchstart', (evento) => {
        evento.preventDefault();
        const { x, y } = obtenerCoordenadasTouch(evento);
        iniciarAccion(x, y);
    }, { passive: false });

    canvas.addEventListener('touchmove', (evento) => {
        evento.preventDefault();
        const { x, y } = obtenerCoordenadasTouch(evento);
        moverAccion(x, y);
    }, { passive: false });

    window.addEventListener('touchend', (evento) => {
        const { x, y } = obtenerCoordenadasTouch(evento);
        finalizarAccion(x, y);
    });

    // Menú desplegable para móviles
    const btnToggleToolbar = document.getElementById('btnToggleToolbar');
    const btnCloseToolbar = document.getElementById('btnCloseToolbar');
    const toolbarPanel = document.getElementById('toolbarPanel');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    function abrirToolbarMobile() {
        if (toolbarPanel) toolbarPanel.classList.add('open');
        if (sidebarOverlay) sidebarOverlay.classList.add('active');
    }

    function cerrarToolbarMobile() {
        if (toolbarPanel) toolbarPanel.classList.remove('open');
        if (sidebarOverlay) sidebarOverlay.classList.remove('active');
    }

    if (btnToggleToolbar) btnToggleToolbar.addEventListener('click', abrirToolbarMobile);
    if (btnCloseToolbar) btnCloseToolbar.addEventListener('click', cerrarToolbarMobile);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', cerrarToolbarMobile);

    // Dibuja las figuras geométricas
    function dibujarFigura(contexto, tipo, x0, y0, x1, y1) {
        contexto.save();
        contexto.strokeStyle = color;
        contexto.fillStyle = color;
        contexto.lineWidth = grosor;
        contexto.lineCap = 'round';
        contexto.beginPath();

        switch (tipo) {
            case 'linea':
                contexto.moveTo(x0, y0);
                contexto.lineTo(x1, y1);
                contexto.stroke();
                break;

            case 'cuadrado':
                let ancho = x1 - x0;
                let alto = y1 - y0;
                if (relleno) {
                    contexto.fillRect(x0, y0, ancho, alto);
                } else {
                    contexto.strokeRect(x0, y0, ancho, alto);
                }
                break;

            case 'circulo':
                let radio = Math.hypot(x1 - x0, y1 - y0) / 2;
                let centroX = (x0 + x1) / 2;
                let centroY = (y0 + y1) / 2;
                contexto.arc(centroX, centroY, Math.max(1, radio), 0, 2 * Math.PI);
                if (relleno) {
                    contexto.fill();
                } else {
                    contexto.stroke();
                }
                break;

            case 'triangulo':
                contexto.moveTo(x0 + (x1 - x0) / 2, y0);
                contexto.lineTo(x0, y1);
                contexto.lineTo(x1, y1);
                contexto.closePath();
                if (relleno) {
                    contexto.fill();
                } else {
                    contexto.stroke();
                }
                break;
        }

        contexto.restore();
    }

    // Actualiza el color activo en la interfaz
    function cambiarColor(nuevoColor) {
        color = nuevoColor;
        colorActualIndicador.style.backgroundColor = nuevoColor;
        inputColorPersonalizado.value = nuevoColor;

        document.querySelectorAll('.color-swatch').forEach(sw => {
            if (sw.dataset.color && sw.dataset.color.toLowerCase() === nuevoColor.toLowerCase()) {
                sw.classList.add('active');
            } else {
                sw.classList.remove('active');
            }
        });
    }

    // Selección en la paleta de colores preestablecidos
    paletaColores.addEventListener('click', (evento) => {
        let swatch = evento.target.closest('.color-swatch');
        if (swatch) {
            cambiarColor(swatch.dataset.color);
        }
    });

    // Guardar colores personalizados en las ranuras
    const ranurasCustom = document.getElementById('ranurasCustom');
    let ranuraObjetivo = null;

    function guardarEnRanuraPersonalizada(colorHex, ranuraEspecifica = null) {
        if (!ranurasCustom) return;
        const slots = ranurasCustom.querySelectorAll('.custom-slot');
        let destino = ranuraEspecifica;
        if (!destino) {
            destino = Array.from(slots).find(s => s.classList.contains('empty')) || slots[0];
        }

        destino.classList.remove('empty');
        destino.style.backgroundColor = colorHex;
        destino.dataset.color = colorHex;
        destino.title = 'Color guardado: ' + colorHex;

        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        destino.classList.add('active');
    }

    inputColorPersonalizado.addEventListener('input', (evento) => {
        cambiarColor(evento.target.value);
    });

    inputColorPersonalizado.addEventListener('change', (evento) => {
        const colorElegido = evento.target.value;
        cambiarColor(colorElegido);
        guardarEnRanuraPersonalizada(colorElegido, ranuraObjetivo);
        ranuraObjetivo = null;
    });

    if (ranurasCustom) {
        ranurasCustom.addEventListener('click', (evento) => {
            const slot = evento.target.closest('.custom-slot');
            if (!slot) return;

            if (slot.classList.contains('empty')) {
                ranuraObjetivo = slot;
                inputColorPersonalizado.click();
            } else {
                cambiarColor(slot.dataset.color);
            }
        });
    }

    // Slider de grosor
    inputGrosor.addEventListener('input', (evento) => {
        grosor = parseInt(evento.target.value, 10);
        grosorValor.innerHTML = grosor + ' px';
    });

    // Checkbox para rellenar figuras
    checkRellenoFigura.addEventListener('change', (evento) => {
        relleno = evento.target.checked;
    });

    // Modo oscuro y claro
    const btnModoOscuro = document.getElementById('btnModoOscuro');
    const iconoModoOscuro = document.getElementById('iconoModoOscuro');
    const textoModoOscuro = document.getElementById('textoModoOscuro');

    if (btnModoOscuro) {
        btnModoOscuro.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const esOscuro = document.body.classList.contains('dark-mode');
            if (esOscuro) {
                iconoModoOscuro.className = 'fa-solid fa-sun';
                textoModoOscuro.innerHTML = 'Claro';
            } else {
                iconoModoOscuro.className = 'fa-solid fa-moon';
                textoModoOscuro.innerHTML = 'Oscuro';
            }
        });
    }

    // Selección de herramientas
    toolButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.disabled) return;

            // Reiniciamos la curva por si estaba a medias
            curvaPaso = 0;
            curvaDibujandoLinea = false;
            curvaAjustando = false;
            previewCtx.clearRect(0, 0, canvasPreview.width, canvasPreview.height);

            toolButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            herramienta = btn.dataset.tool;

            let textoSpan = btn.querySelector('span');
            infoHerramienta.innerHTML = 'Herramienta: ' + (textoSpan ? textoSpan.innerHTML : herramienta);

            // Cerramos el menú en celular al seleccionar herramienta
            if (window.innerWidth <= 768) {
                cerrarToolbarMobile();
            }
        });
    });

    // Cancelar la curva con Escape
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && herramienta === 'curva') {
            curvaPaso = 0;
            curvaDibujandoLinea = false;
            curvaAjustando = false;
            previewCtx.clearRect(0, 0, canvasPreview.width, canvasPreview.height);
            infoHerramienta.innerHTML = 'Herramienta: Curva';
        }
    });

    // Limpiar lienzo
    btnLimpiar.addEventListener('click', () => {
        curvaPaso = 0;
        curvaDibujandoLinea = false;
        curvaAjustando = false;
        previewCtx.clearRect(0, 0, canvasPreview.width, canvasPreview.height);
        ctx.fillStyle = colorFondo;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    // Crear nuevo lienzo
    btnNuevo.addEventListener('click', () => abrirModal(modalNuevo));

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('nuevoAncho').value = btn.dataset.w;
            document.getElementById('nuevoAlto').value = btn.dataset.h;
        });
    });

    const nuevoColorInput = document.getElementById('nuevoColor');
    const nuevoColorHex = document.getElementById('nuevoColorHex');
    nuevoColorInput.addEventListener('input', (e) => {
        nuevoColorHex.innerHTML = e.target.value;
    });

    document.getElementById('btnConfirmarNuevo').addEventListener('click', () => {
        let w = parseInt(document.getElementById('nuevoAncho').value, 10) || 900;
        let h = parseInt(document.getElementById('nuevoAlto').value, 10) || 550;
        let fondo = nuevoColorInput.value || '#ffffff';

        configurarLienzo(w, h, fondo);
        cerrarModal(modalNuevo);
    });

    // Abrir imagen local
    btnAbrir.addEventListener('click', () => {
        inputArchivo.click();
    });

    inputArchivo.addEventListener('change', (e) => {
        let archivo = e.target.files[0];
        if (!archivo) return;

        let lector = new FileReader();
        lector.onload = function(evento) {
            let img = new Image();
            img.onload = function() {
                configurarLienzo(img.width, img.height, '#ffffff');
                ctx.drawImage(img, 0, 0);
            };
            img.src = evento.target.result;
        };
        lector.readAsDataURL(archivo);
        inputArchivo.value = '';
    });

    // Guardar imagen en PNG, JPEG o WEBP
    btnGuardarModal.addEventListener('click', () => abrirModal(modalGuardar));

    document.querySelectorAll('.format-card input').forEach(radio => {
        radio.addEventListener('change', () => {
            document.querySelectorAll('.format-card').forEach(c => c.classList.remove('selected'));
            radio.closest('.format-card').classList.add('selected');
        });
    });

    document.getElementById('btnConfirmarGuardar').addEventListener('click', () => {
        let nombre = (document.getElementById('nombreArchivo').value.trim() || 'Dibujo');
        let formato = document.querySelector('input[name="formatoImagen"]:checked').value;

        let tipoMime = 'image/png';
        let extension = '.png';

        if (formato === 'jpeg') {
            tipoMime = 'image/jpeg';
            extension = '.jpg';
        } else if (formato === 'webp') {
            tipoMime = 'image/webp';
            extension = '.webp';
        }

        let enlace = document.createElement('a');
        enlace.download = nombre + extension;
        enlace.href = canvas.toDataURL(tipoMime, 0.95);
        document.body.appendChild(enlace);
        enlace.click();
        document.body.removeChild(enlace);

        cerrarModal(modalGuardar);
    });

    // Funciones para abrir y cerrar modales
    function abrirModal(modal) {
        if (modal) modal.classList.add('active');
    }

    function cerrarModal(modal) {
        if (modal) modal.classList.remove('active');
    }

    document.querySelectorAll('.close-modal-btn, .btn-secondary').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.dataset.close || btn.closest('.modal-overlay').id;
            const modal = document.getElementById(modalId);
            cerrarModal(modal);
        });
    });

    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) cerrarModal(modal);
        });
    });
});
