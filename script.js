document.addEventListener('DOMContentLoaded', () => {

    // --------------------------------------------------------------------------
    // 1. OBTENCIÓN DEL CANVAS Y CONTEXTO 2D (PRÁCTICAS 1 A 6)
    // --------------------------------------------------------------------------
    const canvas = document.getElementById('lienzoPrincipal');
    const ctx = canvas.getContext('2d');

    // Canvas auxiliar para previsualizar líneas y figuras antes de soltar el clic
    const canvasPreview = document.getElementById('lienzoPreview');
    const previewCtx = canvasPreview.getContext('2d');

    // Elementos informativos en pantalla (Práctica 10 y 11)
    const coordenadas = document.getElementById('coordenadas');
    const dimensionesLienzo = document.getElementById('dimensionesLienzo');
    const infoHerramienta = document.getElementById('infoHerramienta');

    // Botones de la barra principal
    const btnNuevo = document.getElementById('btnNuevo');
    const btnAbrir = document.getElementById('btnAbrir');
    const inputArchivo = document.getElementById('inputArchivo');
    const btnGuardarModal = document.getElementById('btnGuardarModal');
    const btnLimpiar = document.getElementById('btnLimpiar');

    // Controles de color y grosor (Práctica 5 y 6)
    const colorActualIndicador = document.getElementById('colorActualIndicador');
    const inputColorPersonalizado = document.getElementById('inputColorPersonalizado');
    const paletaColores = document.getElementById('paletaColores');
    const inputGrosor = document.getElementById('inputGrosor');
    const grosorValor = document.getElementById('grosorValor');
    const checkRellenoFigura = document.getElementById('checkRellenoFigura');

    // Botones de herramientas
    const toolButtons = document.querySelectorAll('.tool-btn[data-tool]');

    // Modales de pantalla principal
    const modalNuevo = document.getElementById('modalNuevo');
    const modalGuardar = document.getElementById('modalGuardar');

    // --------------------------------------------------------------------------
    // 2. VARIABLES DE ESTADO (COMO EN LAS PRÁCTICAS 10 Y 11)
    // --------------------------------------------------------------------------
    let herramienta = 'lapiz';
    let color = '#000000';
    let colorFondo = '#ffffff';
    let grosor = 3;
    let relleno = false;

    // Control del trazo con el ratón
    let dibujando = false;
    let xInicio = 0;
    let yInicio = 0;
    let xUltimo = 0;
    let yUltimo = 0;

    // --------------------------------------------------------------------------
    // 3. INICIALIZACIÓN DEL LIENZO
    // --------------------------------------------------------------------------
    function configurarLienzo(ancho, alto, fondo) {
        canvas.width = ancho;
        canvas.height = alto;
        canvasPreview.width = ancho;
        canvasPreview.height = alto;

        colorFondo = fondo;

        // Pintar fondo inicial
        ctx.fillStyle = colorFondo;
        ctx.fillRect(0, 0, ancho, alto);

        dimensionesLienzo.innerHTML = ancho + ' × ' + alto + ' px';
    }

    // Inicializamos directamente el lienzo listo para usar (sin pantallas emergentes)
    configurarLienzo(900, 550, '#ffffff');

    // --------------------------------------------------------------------------
    // 4. CAPTURA DE EVENTOS Y COORDENADAS (PRÁCTICAS 10 Y 11: offsetX y offsetY)
    // --------------------------------------------------------------------------
    canvas.addEventListener('mousemove', (evento) => {
        // En las prácticas 10 y 11 la maestra usó directamente evento.offsetX y offsetY:
        let x = evento.offsetX;
        let y = evento.offsetY;

        // Mostrar coordenadas en tiempo real (Práctica 10 y 11)
        coordenadas.innerHTML = 'x : ' + x + ' | y : ' + y;

        if (dibujando) {
            if (herramienta === 'lapiz') {
                // Trazado continuo del lápiz con líneas conectadas (Práctica 3 y 11)
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
                // Vista previa de figuras y líneas en el lienzo temporal
                previewCtx.clearRect(0, 0, canvasPreview.width, canvasPreview.height);
                dibujarFigura(previewCtx, herramienta, xInicio, yInicio, x, y);
            }
        }
    });

    canvas.addEventListener('mousedown', (evento) => {
        if (evento.button !== 0) return;

        let x = evento.offsetX;
        let y = evento.offsetY;

        xInicio = x;
        yInicio = y;
        xUltimo = x;
        yUltimo = y;

        dibujando = true;

        // Punto inicial del lápiz
        if (herramienta === 'lapiz') {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y);
            ctx.strokeStyle = color;
            ctx.lineWidth = grosor;
            ctx.lineCap = 'round';
            ctx.stroke();
        }
    });

    window.addEventListener('mouseup', (evento) => {
        if (!dibujando) return;

        let x = evento.offsetX;
        let y = evento.offsetY;

        dibujando = false;

        // Si estábamos trazando una forma o línea recta/curva, la plasmamos en el lienzo final
        if (herramienta !== 'lapiz') {
            previewCtx.clearRect(0, 0, canvasPreview.width, canvasPreview.height);
            dibujarFigura(ctx, herramienta, xInicio, yInicio, x, y);
        }
    });

    canvas.addEventListener('mouseleave', () => {
        dibujando = false;
        coordenadas.innerHTML = 'x : 0 | y : 0';
    });

    // --------------------------------------------------------------------------
    // 4.1 SOPORTE TÁCTIL PARA DISPOSITIVOS MÓVILES (TOUCH EVENTS)
    // --------------------------------------------------------------------------
    function obtenerCoordenadasTouch(e) {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0] || e.changedTouches[0];
        const escalaX = canvas.width / rect.width;
        const escalaY = canvas.height / rect.height;

        const x = Math.round((touch.clientX - rect.left) * escalaX);
        const y = Math.round((touch.clientY - rect.top) * escalaY);
        return { x, y };
    }

    canvas.addEventListener('touchstart', (evento) => {
        evento.preventDefault();
        const { x, y } = obtenerCoordenadasTouch(evento);
        xInicio = x;
        yInicio = y;
        xUltimo = x;
        yUltimo = y;
        dibujando = true;

        coordenadas.innerHTML = 'x : ' + x + ' | y : ' + y;

        if (herramienta === 'lapiz') {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y);
            ctx.strokeStyle = color;
            ctx.lineWidth = grosor;
            ctx.lineCap = 'round';
            ctx.stroke();
        }
    }, { passive: false });

    canvas.addEventListener('touchmove', (evento) => {
        evento.preventDefault();
        const { x, y } = obtenerCoordenadasTouch(evento);
        coordenadas.innerHTML = 'x : ' + x + ' | y : ' + y;

        if (dibujando) {
            if (herramienta === 'lapiz') {
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
                previewCtx.clearRect(0, 0, canvasPreview.width, canvasPreview.height);
                dibujarFigura(previewCtx, herramienta, xInicio, yInicio, x, y);
            }
        }
    }, { passive: false });

    window.addEventListener('touchend', (evento) => {
        if (!dibujando) return;
        const { x, y } = obtenerCoordenadasTouch(evento);
        dibujando = false;

        if (herramienta !== 'lapiz') {
            previewCtx.clearRect(0, 0, canvasPreview.width, canvasPreview.height);
            dibujarFigura(ctx, herramienta, xInicio, yInicio, x, y);
        }
    });

    // --------------------------------------------------------------------------
    // 4.2 CONTROL DEL PANEL DE HERRAMIENTAS EN MÓVILES (DRAWER)
    // --------------------------------------------------------------------------
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

    // --------------------------------------------------------------------------
    // 5. TRAZADO DE LÍNEAS, CURVAS Y FORMAS (PRÁCTICAS 3, 5, 6, 7)
    // --------------------------------------------------------------------------
    function dibujarFigura(contexto, tipo, x0, y0, x1, y1) {
        contexto.save();
        contexto.strokeStyle = color;
        contexto.fillStyle = color;
        contexto.lineWidth = grosor;
        contexto.lineCap = 'round';
        contexto.beginPath();

        switch (tipo) {
            case 'linea':
                // Línea recta entre 2 puntos (Práctica 3 y 4)
                contexto.moveTo(x0, y0);
                contexto.lineTo(x1, y1);
                contexto.stroke();
                break;

            case 'curva':
                // Línea curva con quadraticCurveTo (Prácticas 5, 6 y 11)
                let cpx = (x0 + x1) / 2;
                let cpy = Math.min(y0, y1) - Math.abs(x1 - x0) / 4;
                contexto.moveTo(x0, y0);
                contexto.quadraticCurveTo(cpx, cpy, x1, y1);
                contexto.stroke();
                break;

            case 'cuadrado':
                // Rectángulo / Cuadrado (Práctica 6 y 7)
                let ancho = x1 - x0;
                let alto = y1 - y0;
                if (relleno) {
                    contexto.fillRect(x0, y0, ancho, alto);
                } else {
                    contexto.strokeRect(x0, y0, ancho, alto);
                }
                break;

            case 'circulo':
                // Círculo con arc (Práctica 7)
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
                // Triángulo conectando 3 vértices (Práctica 7 y 8)
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

    // --------------------------------------------------------------------------
    // 6. GESTIÓN DE COLORES Y GROSOR (PRÁCTICAS 5 Y 6)
    // --------------------------------------------------------------------------
    function cambiarColor(nuevoColor) {
        color = nuevoColor;
        colorActualIndicador.style.backgroundColor = nuevoColor;
        inputColorPersonalizado.value = nuevoColor;

        // Resaltar en la paleta preestablecida sólo si coincide
        document.querySelectorAll('.color-swatch').forEach(sw => {
            if (sw.dataset.color && sw.dataset.color.toLowerCase() === nuevoColor.toLowerCase()) {
                sw.classList.add('active');
            } else {
                sw.classList.remove('active');
            }
        });
    }

    // Los 20 colores fijos preestablecidos se mantienen intactos
    paletaColores.addEventListener('click', (evento) => {
        let swatch = evento.target.closest('.color-swatch');
        if (swatch) {
            cambiarColor(swatch.dataset.color);
        }
    });

    // --------------------------------------------------------------------------
    // 6.1 GESTIÓN DE COLORES PERSONALIZADOS GUARDADOS (ESTILO MS PAINT)
    // --------------------------------------------------------------------------
    const ranurasCustom = document.getElementById('ranurasCustom');
    let ranuraObjetivo = null; // Ranura específica seleccionada por el usuario

    function guardarEnRanuraPersonalizada(colorHex, ranuraEspecifica = null) {
        if (!ranurasCustom) return;
        const slots = ranurasCustom.querySelectorAll('.custom-slot');
        let destino = ranuraEspecifica;
        if (!destino) {
            // Busca la primera ranura vacía o sobrescribe la primera
            destino = Array.from(slots).find(s => s.classList.contains('empty')) || slots[0];
        }

        destino.classList.remove('empty');
        destino.style.backgroundColor = colorHex;
        destino.dataset.color = colorHex;
        destino.title = 'Color guardado: ' + colorHex;

        // Marcar la ranura como activa
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        destino.classList.add('active');
    }

    // Mientras el usuario arrastra en el selector nativo superior derecho
    inputColorPersonalizado.addEventListener('input', (evento) => {
        cambiarColor(evento.target.value);
    });

    // Cuando el usuario confirma el color en el selector nativo
    inputColorPersonalizado.addEventListener('change', (evento) => {
        const colorElegido = evento.target.value;
        cambiarColor(colorElegido);
        guardarEnRanuraPersonalizada(colorElegido, ranuraObjetivo);
        ranuraObjetivo = null; // Reiniciar ranura temporal
    });

    // Interacción con la fila de ranuras personalizadas
    if (ranurasCustom) {
        ranurasCustom.addEventListener('click', (evento) => {
            const slot = evento.target.closest('.custom-slot');
            if (!slot) return;

            if (slot.classList.contains('empty')) {
                // Si la ranura está vacía, abre el selector nativo para llenarla
                ranuraObjetivo = slot;
                inputColorPersonalizado.click();
            } else {
                // Si ya contiene un color guardado, lo activa como color de trazo
                cambiarColor(slot.dataset.color);
            }
        });
    }

    inputGrosor.addEventListener('input', (evento) => {
        grosor = parseInt(evento.target.value, 10);
        grosorValor.innerHTML = grosor + ' px';
    });

    checkRellenoFigura.addEventListener('change', (evento) => {
        relleno = evento.target.checked;
    });

    // --------------------------------------------------------------------------
    // 6.1 ALTERNAR MODO OSCURO / MODO CLARO
    // --------------------------------------------------------------------------
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

    // --------------------------------------------------------------------------
    // 7. SELECCIÓN DE HERRAMIENTA ACTIVA (SÓLO BOTONES HABILITADOS)
    // --------------------------------------------------------------------------
    toolButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Si el botón está deshabilitado, simplemente no hace nada
            if (btn.disabled) return;

            toolButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            herramienta = btn.dataset.tool;

            let textoSpan = btn.querySelector('span');
            infoHerramienta.innerHTML = 'Herramienta: ' + (textoSpan ? textoSpan.innerHTML : herramienta);

            // En dispositivos móviles, cerramos el panel automáticamente al seleccionar
            if (window.innerWidth <= 768) {
                cerrarToolbarMobile();
            }
        });
    });

    // Limpiar Lienzo
    btnLimpiar.addEventListener('click', () => {
        ctx.fillStyle = colorFondo;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    // --------------------------------------------------------------------------
    // 8. PANTALLA PRINCIPAL: NUEVO, ABRIR, GUARDAR COMO (3 FORMATOS)
    // --------------------------------------------------------------------------

    // MODAL NUEVO (SÓLO SE ABRE CUANDO EL USUARIO HACE CLIC EN EL BOTÓN)
    btnNuevo.addEventListener('click', () => abrirModal(modalNuevo));

    // Tamaños preestablecidos del modal
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

    // ABRIR IMAGEN
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

    // GUARDAR COMO (3 FORMATOS: PNG, JPEG, WEBP)
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

    // --------------------------------------------------------------------------
    // 9. FUNCIONES AUXILIARES PARA LOS MODALES DE ARCHIVO (NUEVO Y GUARDAR)
    // --------------------------------------------------------------------------
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
