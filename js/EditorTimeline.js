// Editor de Timeline - OSI
let eventos = [];
let currentEventoIndex = -1;
let currentParticipantes = [];
let currentParticipanteIndex = -1;

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
    $('#btnAgregarEvento').on('click', () => abrirModalEvento());
    $('#btnGuardarEvento').on('click', guardarEvento);
    $('#btnAgregarParticipante').on('click', () => abrirModalParticipante());
    $('#btnGuardarParticipante').on('click', guardarParticipante);
}

function cargarDatos() {
    fetch('files/timeline.json')
        .then(response => response.json())
        .then(data => {
            eventos = data;
            renderizarEventos();
            mostrarAlerta('Datos cargados correctamente', 'success');
        })
        .catch(error => {
            console.error('Error al cargar datos:', error);
            mostrarAlerta('Error al cargar los datos. Se iniciará con datos vacíos.', 'warning');
            eventos = [];
        });
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                eventos = JSON.parse(e.target.result);
                renderizarEventos();
                mostrarAlerta('Archivo cargado correctamente', 'success');
            } catch (error) {
                mostrarAlerta('Error al parsear el archivo JSON: ' + error.message, 'danger');
            }
        };
        reader.readAsText(file);
    }
}

function renderizarEventos() {
    const container = $('#eventosContainer');
    container.empty();

    if (eventos.length === 0) {
        container.html('<div class="alert alert-info">No hay eventos. Haz clic en "Agregar Evento" para crear uno.</div>');
        return;
    }

    eventos.forEach((evento, index) => {
        const card = crearCardEvento(evento, index);
        container.append(card);
    });
}

function crearCardEvento(evento, index) {
    const participantesHTML = (evento.participantes || []).map(p => {
        let medallaHTML = '';
        if (p.medalla) {
            medallaHTML = `<span class="medal-badge medal-${p.medalla}">${p.medalla.toUpperCase()}</span>`;
        }
        return `<li>${p.nombre}${medallaHTML}</li>`;
    }).join('');

    const tipoIcono = evento.tipo === 'en-linea' ? 'laptop' : 'map-marker-alt';
    const tipoTexto = evento.tipo === 'en-linea' ? 'En línea' : 'Presencial';

    return $(`
        <div class="card evento-card">
            <div class="card-body">
                <div class="row">
                    <div class="col-md-8">
                        <h3>
                            <i class="fas fa-calendar-alt text-warning"></i>
                            ${evento.anio} - ${evento.sede}
                        </h3>
                        <p class="mb-2">
                            <i class="fas fa-${tipoIcono} text-muted"></i>
                            <strong>Tipo:</strong> ${tipoTexto}
                        </p>
                        <p class="mb-2">
                            <i class="fas fa-image text-muted"></i>
                            <strong>Imagen:</strong> <code>${evento.imagen}</code>
                        </p>
                        ${evento.resultadoUrl ? `
                        <p class="mb-2">
                            <i class="fas fa-link text-muted"></i>
                            <strong>Resultados:</strong> <a href="${evento.resultadoUrl}" target="_blank" rel="noopener">Ver</a>
                        </p>` : ''}
                        <h6 class="mt-3"><i class="fas fa-users"></i> Participantes (${evento.participantes?.length || 0}):</h6>
                        <ul>${participantesHTML || '<li class="text-muted">Sin participantes</li>'}</ul>
                    </div>
                    <div class="col-md-4 text-right">
                        <button class="btn btn-sm btn-primary mb-2" onclick="abrirModalEvento(${index})">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn-sm btn-danger mb-2" onclick="eliminarEvento(${index})">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                        ${index > 0 ? `
                        <button class="btn btn-sm btn-secondary mb-2" onclick="moverEvento(${index}, -1)">
                            <i class="fas fa-arrow-up"></i>
                        </button>` : ''}
                        ${index < eventos.length - 1 ? `
                        <button class="btn btn-sm btn-secondary mb-2" onclick="moverEvento(${index}, 1)">
                            <i class="fas fa-arrow-down"></i>
                        </button>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `);
}

function abrirModalEvento(index = -1) {
    currentEventoIndex = index;
    currentParticipantes = [];
    
    if (index >= 0) {
        const evento = eventos[index];
        $('#modalEventoTitle').text('Editar Evento');
        $('#eventoAnio').val(evento.anio);
        $('#eventoSede').val(evento.sede);
        $('#eventoImagen').val(evento.imagen);
        $('#eventoResultadoUrl').val(evento.resultadoUrl || '');
        $('#eventoTipo').val(evento.tipo || 'presencial');
        
        currentParticipantes = JSON.parse(JSON.stringify(evento.participantes || []));
    } else {
        $('#modalEventoTitle').text('Agregar Evento');
        $('#formEvento')[0].reset();
        $('#eventoAnio').val(new Date().getFullYear());
        $('#eventoTipo').val('presencial');
        currentParticipantes = [];
    }
    
    renderizarParticipantesEnModal();
    $('#modalEvento').modal('show');
}

function renderizarParticipantesEnModal() {
    const container = $('#participantesContainer');
    container.empty();
    
    if (currentParticipantes.length === 0) {
        container.html('<p class="text-muted">No hay participantes. Haz clic en "Agregar Participante".</p>');
        return;
    }
    
    currentParticipantes.forEach((participante, index) => {
        let medallaHTML = '';
        if (participante.medalla) {
            medallaHTML = `<span class="medal-badge medal-${participante.medalla}">${participante.medalla.toUpperCase()}</span>`;
        }
        
        const item = $(`
            <div class="participante-item">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${participante.nombre}</strong>
                        ${medallaHTML}
                        ${participante.perfil ? '<br><small class="text-muted">Con perfil</small>' : ''}
                    </div>
                    <div>
                        <button type="button" class="btn btn-sm btn-outline-primary" onclick="editarParticipante(${index})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-danger" onclick="eliminarParticipante(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                        ${index > 0 ? `
                        <button type="button" class="btn btn-sm btn-outline-secondary" onclick="moverParticipante(${index}, -1)">
                            <i class="fas fa-arrow-up"></i>
                        </button>` : ''}
                        ${index < currentParticipantes.length - 1 ? `
                        <button type="button" class="btn btn-sm btn-outline-secondary" onclick="moverParticipante(${index}, 1)">
                            <i class="fas fa-arrow-down"></i>
                        </button>` : ''}
                    </div>
                </div>
            </div>
        `);
        container.append(item);
    });
}

function abrirModalParticipante(index = -1) {
    currentParticipanteIndex = index;
    
    if (index >= 0) {
        const participante = currentParticipantes[index];
        $('#modalParticipanteTitle').text('Editar Participante');
        $('#participanteNombre').val(participante.nombre);
        $('#participanteMedalla').val(participante.medalla || '');
        $('#participantePerfil').val(participante.perfil || '');
    } else {
        $('#modalParticipanteTitle').text('Agregar Participante');
        $('#formParticipante')[0].reset();
    }
    
    $('#modalParticipante').modal('show');
}

function guardarParticipante() {
    const nombre = $('#participanteNombre').val().trim();
    if (!nombre) {
        mostrarAlerta('El nombre del participante es obligatorio', 'warning');
        return;
    }

    const participante = {
        nombre: nombre
    };

    const medalla = $('#participanteMedalla').val();
    if (medalla) {
        participante.medalla = medalla;
    }

    const perfil = $('#participantePerfil').val().trim();
    if (perfil) {
        participante.perfil = perfil;
    }

    if (currentParticipanteIndex >= 0) {
        currentParticipantes[currentParticipanteIndex] = participante;
    } else {
        currentParticipantes.push(participante);
    }

    $('#modalParticipante').modal('hide');
    renderizarParticipantesEnModal();
}

function editarParticipante(index) {
    abrirModalParticipante(index);
}

function eliminarParticipante(index) {
    if (confirm('¿Eliminar este participante?')) {
        currentParticipantes.splice(index, 1);
        renderizarParticipantesEnModal();
    }
}

function moverParticipante(index, direction) {
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < currentParticipantes.length) {
        [currentParticipantes[index], currentParticipantes[newIndex]] = [currentParticipantes[newIndex], currentParticipantes[index]];
        renderizarParticipantesEnModal();
    }
}

function guardarEvento() {
    const anio = parseInt($('#eventoAnio').val());
    const sede = $('#eventoSede').val().trim();
    const imagen = $('#eventoImagen').val().trim();
    
    if (!anio || !sede || !imagen) {
        mostrarAlerta('Año, sede e imagen son obligatorios', 'warning');
        return;
    }

    if (currentParticipantes.length === 0) {
        if (!confirm('No hay participantes agregados. ¿Deseas continuar?')) {
            return;
        }
    }

    const evento = {
        anio: anio,
        sede: sede,
        imagen: imagen,
        participantes: currentParticipantes,
        tipo: $('#eventoTipo').val()
    };

    const resultadoUrl = $('#eventoResultadoUrl').val().trim();
    if (resultadoUrl) {
        evento.resultadoUrl = resultadoUrl;
    }

    if (currentEventoIndex >= 0) {
        eventos[currentEventoIndex] = evento;
        mostrarAlerta('Evento actualizado', 'success');
    } else {
        eventos.push(evento);
        mostrarAlerta('Evento agregado', 'success');
    }

    $('#modalEvento').modal('hide');
    renderizarEventos();
}

function eliminarEvento(index) {
    if (confirm('¿Estás seguro de eliminar este evento?')) {
        eventos.splice(index, 1);
        renderizarEventos();
        mostrarAlerta('Evento eliminado', 'info');
    }
}

function moverEvento(index, direction) {
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < eventos.length) {
        [eventos[index], eventos[newIndex]] = [eventos[newIndex], eventos[index]];
        renderizarEventos();
    }
}

function guardarJSON() {
    if (!validarDatos(false)) {
        if (!confirm('Hay errores de validación. ¿Deseas guardar de todos modos?')) {
            return;
        }
    }

    const dataStr = JSON.stringify(eventos, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'timeline.json';
    link.click();
    URL.revokeObjectURL(url);
    
    mostrarAlerta('JSON descargado correctamente. Reemplaza el archivo en files/timeline.json', 'success');
}

function mostrarVistaPrevia() {
    const preview = JSON.stringify(eventos, null, 2);
    $('#jsonPreview').text(preview);
    $('#jsonPreviewSection').show();
}

function validarDatos(mostrarAlertaExito = true) {
    const errores = [];
    
    if (eventos.length === 0) {
        errores.push('No hay eventos definidos');
    }
    
    eventos.forEach((evento, index) => {
        if (!evento.anio) {
            errores.push(`Evento ${index + 1}: falta el año`);
        }
        if (!evento.sede || !evento.sede.trim()) {
            errores.push(`Evento ${index + 1}: falta la sede`);
        }
        if (!evento.imagen || !evento.imagen.trim()) {
            errores.push(`Evento ${index + 1}: falta la imagen`);
        }
        if (!evento.tipo) {
            errores.push(`Evento ${index + 1}: falta el tipo`);
        }
        if (!evento.participantes || evento.participantes.length === 0) {
            errores.push(`Evento ${index + 1}: no tiene participantes`);
        } else {
            evento.participantes.forEach((p, pIndex) => {
                if (!p.nombre || !p.nombre.trim()) {
                    errores.push(`Evento ${index + 1}, Participante ${pIndex + 1}: falta el nombre`);
                }
            });
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
            ${mensaje.replace(/\n/g, '<br>')}
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

