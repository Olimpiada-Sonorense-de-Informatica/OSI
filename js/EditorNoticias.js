// Editor de Noticias - OSI
let noticias = [];
let currentNoticiaIndex = -1;
let currentDescripciones = [];

// Inicialización
$(document).ready(function() {
    cargarDatos();
    inicializarEventos();
});

function inicializarEventos() {
    $('#btnCargar').on('click', () => $('#fileInput').click());
    $('#fileInput').on('change', handleFileSelect);
    $('#btnGuardar').on('click', guardarJSON);
    $('#btnVistaPrevia').on('click', mostrarVistaPrevia);
    $('#btnValidar').on('click', validarDatos);
    $('#btnAgregarNoticia').on('click', () => abrirModalNoticia());
    $('#btnGuardarNoticia').on('click', guardarNoticia);
    $('#btnAgregarDescripcion').on('click', agregarLineaDescripcion);
    $('#noticiaIcono').on('input', actualizarVistaPreviewIcono);
}

function cargarDatos() {
    fetch('files/noticias.json')
        .then(response => response.json())
        .then(data => {
            noticias = data;
            renderizarNoticias();
            mostrarAlerta('Datos cargados correctamente', 'success');
        })
        .catch(error => {
            console.error('Error al cargar datos:', error);
            mostrarAlerta('Error al cargar los datos. Se iniciará con datos vacíos.', 'warning');
            noticias = [];
        });
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                noticias = JSON.parse(e.target.result);
                renderizarNoticias();
                mostrarAlerta('Archivo cargado correctamente', 'success');
            } catch (error) {
                mostrarAlerta('Error al parsear el archivo JSON: ' + error.message, 'danger');
            }
        };
        reader.readAsText(file);
    }
}

function renderizarNoticias() {
    const container = $('#noticiasContainer');
    container.empty();

    if (noticias.length === 0) {
        container.html('<div class="alert alert-info">No hay noticias. Haz clic en "Agregar Noticia" para crear una.</div>');
        return;
    }

    noticias.forEach((noticia, index) => {
        const card = crearCardNoticia(noticia, index);
        container.append(card);
    });
}

function crearCardNoticia(noticia, index) {
    const iconoClase = (noticia.icono || 'bullhorn').replace(/^fa-/, '');
    const descripcionHTML = (noticia.descripcion || []).map(desc => 
        `<li>${desc}</li>`
    ).join('');
    
    const ctaHTML = noticia.cta ? `
        <p class="mb-1"><strong>CTA:</strong> ${noticia.cta.texto}</p>
        <p class="mb-1"><small class="text-muted">${noticia.cta.url}</small></p>
        <p class="mb-0"><small>${noticia.cta.externo ? '🔗 Externo' : '📄 Interno'}</small></p>
    ` : '<p class="text-muted">Sin call to action</p>';

    return $(`
        <div class="card noticia-card">
            <div class="card-body">
                <div class="row">
                    <div class="col-md-8">
                        <h4>
                            <i class="fas fa-${iconoClase} text-primary"></i>
                            ${noticia.titulo || 'Sin título'}
                        </h4>
                        <h6 class="text-muted">Descripción:</h6>
                        <ul class="mb-3">${descripcionHTML || '<li class="text-muted">Sin descripción</li>'}</ul>
                        <h6 class="text-muted">Call to Action:</h6>
                        ${ctaHTML}
                    </div>
                    <div class="col-md-4 text-right">
                        <button class="btn btn-sm btn-primary mb-2" onclick="abrirModalNoticia(${index})">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn-sm btn-danger mb-2" onclick="eliminarNoticia(${index})">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                        ${index > 0 ? `
                        <button class="btn btn-sm btn-secondary mb-2" onclick="moverNoticia(${index}, -1)">
                            <i class="fas fa-arrow-up"></i>
                        </button>` : ''}
                        ${index < noticias.length - 1 ? `
                        <button class="btn btn-sm btn-secondary mb-2" onclick="moverNoticia(${index}, 1)">
                            <i class="fas fa-arrow-down"></i>
                        </button>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `);
}

function abrirModalNoticia(index = -1) {
    currentNoticiaIndex = index;
    currentDescripciones = [];
    
    if (index >= 0) {
        const noticia = noticias[index];
        $('#modalNoticiaTitle').text('Editar Noticia');
        $('#noticiaTitulo').val(noticia.titulo || '');
        $('#noticiaIcono').val((noticia.icono || '').replace(/^fa-/, ''));
        
        currentDescripciones = [...(noticia.descripcion || [])];
        
        if (noticia.cta) {
            $('#ctaTexto').val(noticia.cta.texto || '');
            $('#ctaUrl').val(noticia.cta.url || '');
            $('#ctaExterno').prop('checked', noticia.cta.externo !== false);
        } else {
            $('#ctaTexto').val('');
            $('#ctaUrl').val('');
            $('#ctaExterno').prop('checked', true);
        }
    } else {
        $('#modalNoticiaTitle').text('Agregar Noticia');
        $('#formNoticia')[0].reset();
        currentDescripciones = [];
    }
    
    renderizarDescripciones();
    actualizarVistaPreviewIcono();
    $('#modalNoticia').modal('show');
}

function renderizarDescripciones() {
    const container = $('#descripcionContainer');
    container.empty();
    
    currentDescripciones.forEach((desc, index) => {
        const item = $(`
            <div class="descripcion-item">
                <span>${desc}</span>
                <div>
                    <button type="button" class="btn btn-sm btn-outline-primary" onclick="editarDescripcion(${index})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-danger" onclick="eliminarDescripcion(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `);
        container.append(item);
    });
}

function agregarLineaDescripcion() {
    const texto = prompt('Ingresa el texto de la línea de descripción:');
    if (texto && texto.trim()) {
        currentDescripciones.push(texto.trim());
        renderizarDescripciones();
    }
}

function editarDescripcion(index) {
    const texto = prompt('Edita el texto de la línea:', currentDescripciones[index]);
    if (texto && texto.trim()) {
        currentDescripciones[index] = texto.trim();
        renderizarDescripciones();
    }
}

function eliminarDescripcion(index) {
    if (confirm('¿Eliminar esta línea de descripción?')) {
        currentDescripciones.splice(index, 1);
        renderizarDescripciones();
    }
}

function actualizarVistaPreviewIcono() {
    const iconSlug = $('#noticiaIcono').val().replace(/^fa-/, '') || 'question-circle';
    $('#iconPreview').html(`<i class="fas fa-${iconSlug} text-primary"></i>`);
}

function guardarNoticia() {
    const titulo = $('#noticiaTitulo').val().trim();
    if (!titulo) {
        mostrarAlerta('El título es obligatorio', 'warning');
        return;
    }

    if (currentDescripciones.length === 0) {
        mostrarAlerta('Debe agregar al menos una línea de descripción', 'warning');
        return;
    }

    const noticia = {
        titulo: titulo,
        descripcion: currentDescripciones,
        icono: $('#noticiaIcono').val().trim().replace(/^fa-/, '') || 'bullhorn'
    };

    const ctaTexto = $('#ctaTexto').val().trim();
    const ctaUrl = $('#ctaUrl').val().trim();
    
    if (ctaTexto && ctaUrl) {
        noticia.cta = {
            texto: ctaTexto,
            url: ctaUrl,
            externo: $('#ctaExterno').is(':checked')
        };
    }

    if (currentNoticiaIndex >= 0) {
        noticias[currentNoticiaIndex] = noticia;
        mostrarAlerta('Noticia actualizada', 'success');
    } else {
        noticias.push(noticia);
        mostrarAlerta('Noticia agregada', 'success');
    }

    $('#modalNoticia').modal('hide');
    renderizarNoticias();
}

function eliminarNoticia(index) {
    if (confirm('¿Estás seguro de eliminar esta noticia?')) {
        noticias.splice(index, 1);
        renderizarNoticias();
        mostrarAlerta('Noticia eliminada', 'info');
    }
}

function moverNoticia(index, direction) {
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < noticias.length) {
        [noticias[index], noticias[newIndex]] = [noticias[newIndex], noticias[index]];
        renderizarNoticias();
    }
}

function guardarJSON() {
    if (!validarDatos(false)) {
        if (!confirm('Hay errores de validación. ¿Deseas guardar de todos modos?')) {
            return;
        }
    }

    const dataStr = JSON.stringify(noticias, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'noticias.json';
    link.click();
    URL.revokeObjectURL(url);
    
    mostrarAlerta('JSON descargado correctamente. Reemplaza el archivo en files/noticias.json', 'success');
}

function mostrarVistaPrevia() {
    const preview = JSON.stringify(noticias, null, 2);
    $('#jsonPreview').text(preview);
    $('#jsonPreviewSection').show();
}

function validarDatos(mostrarAlertaExito = true) {
    const errores = [];
    
    if (noticias.length === 0) {
        errores.push('No hay noticias definidas');
    }
    
    noticias.forEach((noticia, index) => {
        if (!noticia.titulo || !noticia.titulo.trim()) {
            errores.push(`Noticia ${index + 1}: falta el título`);
        }
        if (!noticia.descripcion || noticia.descripcion.length === 0) {
            errores.push(`Noticia ${index + 1}: falta la descripción`);
        }
        if (noticia.cta) {
            if (!noticia.cta.texto || !noticia.cta.url) {
                errores.push(`Noticia ${index + 1}: el CTA está incompleto`);
            }
        }
    });
    
    if (errores.length > 0) {
        mostrarAlerta('Errores de validación:\n' + errores.join('\n'), 'danger');
        return false;
    }
    
    if (mostrarAlertaExito) {
        mostrarAlerta('Validación exitosa. Los datos están correctos.', 'success');
    }
    return true;
}

function mostrarAlerta(mensaje, tipo) {
    const alert = $(`
        <div class="alert alert-${tipo} alert-dismissible fade show alert-fixed" role="alert">
            ${mensaje}
            <button type="button" class="close" data-dismiss="alert">
                <span>&times;</span>
            </button>
        </div>
    `);
    
    $('#alertContainer').append(alert);
    
    setTimeout(() => {
        alert.alert('close');
    }, 5000);
}

