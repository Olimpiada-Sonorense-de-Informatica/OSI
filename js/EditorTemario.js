// Datos del temario
let temarioData = {
    etapas: []
};

// Variables para edición
let editingEtapaIndex = -1;
let editingTemaIndex = -1;
let editingMaterialIndex = -1;
let editingProblemaIndex = -1;
let currentEtapaIndex = -1;
let currentTemaIndex = -1;

// Inicialización
$(document).ready(function() {
    // Event listeners
    $('#btnCargar').on('click', function() {
        $('#fileInput').click();
    });

    $('#fileInput').on('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    temarioData = JSON.parse(e.target.result);
                    renderizarEtapas();
                    mostrarAlerta('JSON cargado exitosamente', 'success');
                } catch (error) {
                    mostrarAlerta('Error al cargar el JSON: ' + error.message, 'danger');
                }
            };
            reader.readAsText(file);
        }
    });

    $('#btnGuardar').on('click', function() {
        descargarJSON();
    });

    $('#btnVistaPrevia').on('click', function() {
        mostrarVistaPrevia();
    });

    $('#btnValidar').on('click', function() {
        validarJSON();
    });

    $('#btnAgregarEtapa').on('click', function() {
        abrirModalEtapa();
    });

    $('#btnGuardarEtapa').on('click', function() {
        guardarEtapa();
    });

    $('#btnGuardarTema').on('click', function() {
        guardarTema();
    });

    $('#btnGuardarMaterial').on('click', function() {
        guardarMaterial();
    });

    $('#btnGuardarProblema').on('click', function() {
        guardarProblema();
    });

    // Cargar JSON inicial
    cargarJSONInicial();
});

// Cargar JSON inicial desde el archivo
function cargarJSONInicial() {
    $.ajax({
        type: "GET",
        url: "files/temario.json",
        dataType: "json",
        success: function(data) {
            temarioData = data;
            renderizarEtapas();
            mostrarAlerta('Temario cargado exitosamente', 'success');
        },
        error: function(xhr, status, error) {
            mostrarAlerta('No se pudo cargar el temario inicial. Usa "Cargar JSON" para cargar un archivo.', 'warning');
        }
    });
}

// Renderizar todas las etapas
function renderizarEtapas() {
    const container = $('#etapasContainer');
    container.empty();

    if (!temarioData.etapas || temarioData.etapas.length === 0) {
        container.html('<div class="alert alert-info">No hay etapas. Agrega una etapa para comenzar.</div>');
        return;
    }

    temarioData.etapas.forEach(function(etapa, etapaIndex) {
        const etapaCard = crearEtapaCard(etapa, etapaIndex);
        container.append(etapaCard);
    });
}

// Crear tarjeta de etapa
function crearEtapaCard(etapa, etapaIndex) {
    const card = $(`
        <div class="card stage-card">
            <div class="card-header collapsible" data-toggle="collapse" data-target="#etapa${etapaIndex}">
                <div class="d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">
                        <i class="fas fa-chevron-down mr-2"></i>
                        ${etapa.nombre} (${etapa.temas ? etapa.temas.length : 0} temas)
                    </h5>
                    <div>
                        <button class="btn btn-sm btn-outline-primary" onclick="abrirModalEtapa(${etapaIndex})">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn-sm btn-outline-success" onclick="abrirModalTema(${etapaIndex})">
                            <i class="fas fa-plus"></i> Agregar Tema
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="eliminarEtapa(${etapaIndex})">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            </div>
            <div class="collapse show" id="etapa${etapaIndex}">
                <div class="card-body" id="temasContainer${etapaIndex}">
                </div>
            </div>
        </div>
    `);

    // Renderizar temas
    if (etapa.temas && etapa.temas.length > 0) {
        const temasContainer = card.find(`#temasContainer${etapaIndex}`);
        etapa.temas.forEach(function(tema, temaIndex) {
            const temaCard = crearTemaCard(tema, etapaIndex, temaIndex);
            temasContainer.append(temaCard);
        });
    }

    return card;
}

// Crear tarjeta de tema
function crearTemaCard(tema, etapaIndex, temaIndex) {
    const subtemasHtml = tema.subtemas && tema.subtemas.length > 0 
        ? `<ul class="subtemas-list">${tema.subtemas.map(s => `<li>${s}</li>`).join('')}</ul>` 
        : '';

    const card = $(`
        <div class="card theme-card">
            <div class="card-header">
                <div class="d-flex justify-content-between align-items-center">
                    <h6 class="mb-0">
                        <strong>${tema.nombre}</strong>
                        ${subtemasHtml}
                    </h6>
                    <div>
                        <button class="btn btn-sm btn-outline-primary" onclick="abrirModalTema(${etapaIndex}, ${temaIndex})">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="eliminarTema(${etapaIndex}, ${temaIndex})">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <h6>Material (${tema.material ? tema.material.length : 0})</h6>
                        <div id="materialContainer${etapaIndex}_${temaIndex}"></div>
                        <button class="btn btn-sm btn-success" onclick="abrirModalMaterial(${etapaIndex}, ${temaIndex})">
                            <i class="fas fa-plus"></i> Agregar Material
                        </button>
                    </div>
                    <div class="col-md-6">
                        <h6>Problemas (${tema.problemas ? tema.problemas.length : 0})</h6>
                        <div id="problemasContainer${etapaIndex}_${temaIndex}"></div>
                        <button class="btn btn-sm btn-success" onclick="abrirModalProblema(${etapaIndex}, ${temaIndex})">
                            <i class="fas fa-plus"></i> Agregar Problema
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `);

    // Renderizar material
    if (tema.material && tema.material.length > 0) {
        const materialContainer = card.find(`#materialContainer${etapaIndex}_${temaIndex}`);
        tema.material.forEach(function(mat, matIndex) {
            const materialItem = crearMaterialItem(mat, etapaIndex, temaIndex, matIndex);
            materialContainer.append(materialItem);
        });
    }

    // Renderizar problemas
    if (tema.problemas && tema.problemas.length > 0) {
        const problemasContainer = card.find(`#problemasContainer${etapaIndex}_${temaIndex}`);
        tema.problemas.forEach(function(prob, probIndex) {
            const problemaItem = crearProblemaItem(prob, etapaIndex, temaIndex, probIndex);
            problemasContainer.append(problemaItem);
        });
    }

    return card;
}

// Crear item de material
function crearMaterialItem(material, etapaIndex, temaIndex, matIndex) {
    return $(`
        <div class="material-item">
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <strong>${material.nombre}</strong><br>
                    <small class="text-muted">${material.url}</small><br>
                    ${material.download ? `<small class="text-info">Descarga: ${material.download}</small>` : ''}
                </div>
                <div>
                    <button class="btn btn-sm btn-outline-primary" onclick="abrirModalMaterial(${etapaIndex}, ${temaIndex}, ${matIndex})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarMaterial(${etapaIndex}, ${temaIndex}, ${matIndex})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `);
}

// Crear item de problema
function crearProblemaItem(problema, etapaIndex, temaIndex, probIndex) {
    const videoInfo = problema.video 
        ? `<small class="text-muted">
            Video: ${problema.video.url || 'Sin URL'} 
            (${problema.video.visible ? 'Visible' : 'Oculto'})
           </small>`
        : '';

    return $(`
        <div class="problem-item">
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <strong>${problema.nombre}</strong><br>
                    <small class="text-muted">${problema.url}</small><br>
                    ${videoInfo}
                </div>
                <div>
                    <button class="btn btn-sm btn-outline-primary" onclick="abrirModalProblema(${etapaIndex}, ${temaIndex}, ${probIndex})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarProblema(${etapaIndex}, ${temaIndex}, ${probIndex})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `);
}

// Abrir modal de etapa
function abrirModalEtapa(etapaIndex = -1) {
    editingEtapaIndex = etapaIndex;
    $('#modalEtapaTitle').text(etapaIndex === -1 ? 'Agregar Etapa' : 'Editar Etapa');
    
    if (etapaIndex === -1) {
        $('#formEtapa')[0].reset();
        $('#etapaNumero').val(temarioData.etapas.length + 1);
    } else {
        const etapa = temarioData.etapas[etapaIndex];
        $('#etapaNumero').val(etapa.numero);
        $('#etapaNombre').val(etapa.nombre);
    }
    
    $('#modalEtapa').modal('show');
}

// Guardar etapa
function guardarEtapa() {
    const numero = parseInt($('#etapaNumero').val());
    const nombre = $('#etapaNombre').val();

    if (!nombre) {
        mostrarAlerta('El nombre de la etapa es requerido', 'danger');
        return;
    }

    if (editingEtapaIndex === -1) {
        // Nueva etapa
        temarioData.etapas.push({
            numero: numero,
            nombre: nombre,
            temas: []
        });
    } else {
        // Editar etapa existente
        temarioData.etapas[editingEtapaIndex].numero = numero;
        temarioData.etapas[editingEtapaIndex].nombre = nombre;
    }

    // Ordenar etapas por número
    temarioData.etapas.sort((a, b) => a.numero - b.numero);

    $('#modalEtapa').modal('hide');
    renderizarEtapas();
    mostrarAlerta('Etapa guardada exitosamente', 'success');
}

// Eliminar etapa
function eliminarEtapa(etapaIndex) {
    if (confirm('¿Estás seguro de eliminar esta etapa? Se eliminarán todos sus temas.')) {
        temarioData.etapas.splice(etapaIndex, 1);
        renderizarEtapas();
        mostrarAlerta('Etapa eliminada', 'info');
    }
}

// Abrir modal de tema
function abrirModalTema(etapaIndex, temaIndex = -1) {
    currentEtapaIndex = etapaIndex;
    editingTemaIndex = temaIndex;
    $('#modalTemaTitle').text(temaIndex === -1 ? 'Agregar Tema' : 'Editar Tema');
    
    if (temaIndex === -1) {
        $('#formTema')[0].reset();
    } else {
        const tema = temarioData.etapas[etapaIndex].temas[temaIndex];
        $('#temaNombre').val(tema.nombre);
        $('#temaSubtemas').val(tema.subtemas ? tema.subtemas.join('\n') : '');
    }
    
    $('#modalTema').modal('show');
}

// Guardar tema
function guardarTema() {
    const nombre = $('#temaNombre').val();
    const subtemasText = $('#temaSubtemas').val();
    const subtemas = subtemasText ? subtemasText.split('\n').filter(s => s.trim() !== '') : [];

    if (!nombre) {
        mostrarAlerta('El nombre del tema es requerido', 'danger');
        return;
    }

    const temaData = {
        nombre: nombre,
        material: [],
        problemas: []
    };

    if (subtemas.length > 0) {
        temaData.subtemas = subtemas;
    }

    if (editingTemaIndex === -1) {
        // Nuevo tema
        if (!temarioData.etapas[currentEtapaIndex].temas) {
            temarioData.etapas[currentEtapaIndex].temas = [];
        }
        temarioData.etapas[currentEtapaIndex].temas.push(temaData);
    } else {
        // Editar tema existente
        const temaExistente = temarioData.etapas[currentEtapaIndex].temas[editingTemaIndex];
        temaData.material = temaExistente.material || [];
        temaData.problemas = temaExistente.problemas || [];
        if (subtemas.length > 0) {
            temaData.subtemas = subtemas;
        } else {
            delete temaData.subtemas;
        }
        temarioData.etapas[currentEtapaIndex].temas[editingTemaIndex] = temaData;
    }

    $('#modalTema').modal('hide');
    renderizarEtapas();
    mostrarAlerta('Tema guardado exitosamente', 'success');
}

// Eliminar tema
function eliminarTema(etapaIndex, temaIndex) {
    if (confirm('¿Estás seguro de eliminar este tema?')) {
        temarioData.etapas[etapaIndex].temas.splice(temaIndex, 1);
        renderizarEtapas();
        mostrarAlerta('Tema eliminado', 'info');
    }
}

// Abrir modal de material
function abrirModalMaterial(etapaIndex, temaIndex, matIndex = -1) {
    currentEtapaIndex = etapaIndex;
    currentTemaIndex = temaIndex;
    editingMaterialIndex = matIndex;
    $('#modalMaterialTitle').text(matIndex === -1 ? 'Agregar Material' : 'Editar Material');
    
    if (matIndex === -1) {
        $('#formMaterial')[0].reset();
    } else {
        const material = temarioData.etapas[etapaIndex].temas[temaIndex].material[matIndex];
        $('#materialNombre').val(material.nombre);
        $('#materialUrl').val(material.url);
        $('#materialDownload').val(material.download || '');
    }
    
    $('#modalMaterial').modal('show');
}

// Guardar material
function guardarMaterial() {
    const nombre = $('#materialNombre').val();
    const url = $('#materialUrl').val();
    const download = $('#materialDownload').val();

    if (!nombre || !url) {
        mostrarAlerta('El nombre y la URL son requeridos', 'danger');
        return;
    }

    const materialData = {
        nombre: nombre,
        url: url
    };

    if (download) {
        materialData.download = download;
    }

    if (!temarioData.etapas[currentEtapaIndex].temas[currentTemaIndex].material) {
        temarioData.etapas[currentEtapaIndex].temas[currentTemaIndex].material = [];
    }

    if (editingMaterialIndex === -1) {
        temarioData.etapas[currentEtapaIndex].temas[currentTemaIndex].material.push(materialData);
    } else {
        temarioData.etapas[currentEtapaIndex].temas[currentTemaIndex].material[editingMaterialIndex] = materialData;
    }

    $('#modalMaterial').modal('hide');
    renderizarEtapas();
    mostrarAlerta('Material guardado exitosamente', 'success');
}

// Eliminar material
function eliminarMaterial(etapaIndex, temaIndex, matIndex) {
    if (confirm('¿Estás seguro de eliminar este material?')) {
        temarioData.etapas[etapaIndex].temas[temaIndex].material.splice(matIndex, 1);
        renderizarEtapas();
        mostrarAlerta('Material eliminado', 'info');
    }
}

// Abrir modal de problema
function abrirModalProblema(etapaIndex, temaIndex, probIndex = -1) {
    currentEtapaIndex = etapaIndex;
    currentTemaIndex = temaIndex;
    editingProblemaIndex = probIndex;
    $('#modalProblemaTitle').text(probIndex === -1 ? 'Agregar Problema' : 'Editar Problema');
    
    if (probIndex === -1) {
        $('#formProblema')[0].reset();
        $('#problemaVideoVisible').prop('checked', false);
    } else {
        const problema = temarioData.etapas[etapaIndex].temas[temaIndex].problemas[probIndex];
        $('#problemaNombre').val(problema.nombre);
        $('#problemaUrl').val(problema.url);
        if (problema.video) {
            $('#problemaVideoUrl').val(problema.video.url || '');
            $('#problemaVideoVisible').prop('checked', problema.video.visible || false);
        } else {
            $('#problemaVideoUrl').val('');
            $('#problemaVideoVisible').prop('checked', false);
        }
    }
    
    $('#modalProblema').modal('show');
}

// Guardar problema
function guardarProblema() {
    const nombre = $('#problemaNombre').val();
    const url = $('#problemaUrl').val();
    const videoUrl = $('#problemaVideoUrl').val();
    const videoVisible = $('#problemaVideoVisible').is(':checked');

    if (!nombre || !url) {
        mostrarAlerta('El nombre y la URL son requeridos', 'danger');
        return;
    }

    const problemaData = {
        nombre: nombre,
        url: url
    };

    if (videoUrl || videoVisible) {
        problemaData.video = {
            url: videoUrl || '',
            visible: videoVisible
        };
    }

    if (!temarioData.etapas[currentEtapaIndex].temas[currentTemaIndex].problemas) {
        temarioData.etapas[currentEtapaIndex].temas[currentTemaIndex].problemas = [];
    }

    if (editingProblemaIndex === -1) {
        temarioData.etapas[currentEtapaIndex].temas[currentTemaIndex].problemas.push(problemaData);
    } else {
        temarioData.etapas[currentEtapaIndex].temas[currentTemaIndex].problemas[editingProblemaIndex] = problemaData;
    }

    $('#modalProblema').modal('hide');
    renderizarEtapas();
    mostrarAlerta('Problema guardado exitosamente', 'success');
}

// Eliminar problema
function eliminarProblema(etapaIndex, temaIndex, probIndex) {
    if (confirm('¿Estás seguro de eliminar este problema?')) {
        temarioData.etapas[etapaIndex].temas[temaIndex].problemas.splice(probIndex, 1);
        renderizarEtapas();
        mostrarAlerta('Problema eliminado', 'info');
    }
}

// Mostrar vista previa del JSON
function mostrarVistaPrevia() {
    const jsonString = JSON.stringify(temarioData, null, 2);
    $('#jsonPreview').text(jsonString);
    $('#jsonPreviewSection').show();
    $('html, body').animate({
        scrollTop: $('#jsonPreviewSection').offset().top
    }, 500);
}

// Validar JSON
function validarJSON() {
    try {
        const jsonString = JSON.stringify(temarioData);
        JSON.parse(jsonString);
        
        // Validaciones adicionales
        let errores = [];
        
        if (!temarioData.etapas || temarioData.etapas.length === 0) {
            errores.push('No hay etapas definidas');
        }
        
        temarioData.etapas.forEach((etapa, i) => {
            if (!etapa.nombre) {
                errores.push(`Etapa ${i + 1}: Falta el nombre`);
            }
            if (!etapa.temas || etapa.temas.length === 0) {
                errores.push(`Etapa ${etapa.nombre}: No tiene temas`);
            }
        });
        
        if (errores.length > 0) {
            mostrarAlerta('Validación completada con advertencias:\n' + errores.join('\n'), 'warning');
        } else {
            mostrarAlerta('JSON válido. Todo está correcto.', 'success');
        }
    } catch (error) {
        mostrarAlerta('Error en el JSON: ' + error.message, 'danger');
    }
}

// Descargar JSON
function descargarJSON() {
    const jsonString = JSON.stringify(temarioData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'temario.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    mostrarAlerta('JSON descargado exitosamente', 'success');
}

// Mostrar alerta
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
    
    setTimeout(function() {
        alert.fadeOut(function() {
            alert.remove();
        });
    }, 5000);
}

