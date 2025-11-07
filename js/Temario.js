/**
 * Función para cargar el temario desde el archivo JSON
 */
function cargarTemario() {
    $.ajax({
        type: "GET",
        url: "files/temario.json",
        dataType: "json",
        success: function(data) {
            renderizarTabla(data);
        },
        error: function(xhr, status, error) {
            console.error("Error al cargar el temario:", error);
            document.getElementById("temario-tbody").innerHTML = 
                "<tr><td colspan='4' class='text-center text-danger'>Error al cargar el temario. Por favor, recarga la página.</td></tr>";
        }
    });
}

/**
 * Función para renderizar la tabla del temario
 * @param {Object} datos - Objeto con la estructura del temario
 */
function renderizarTabla(datos) {
    var tbody = document.getElementById("temario-tbody");
    var contenido = "";
    
    datos.etapas.forEach(function(etapa) {
        var cantidadTemas = etapa.temas.length;
        
        etapa.temas.forEach(function(tema, index) {
            contenido += "<tr>";
            
            // Columna de Etapa (solo en la primera fila de cada etapa)
            if (index === 0) {
                contenido += "<td rowspan=\"" + cantidadTemas + "\">" + etapa.nombre + "</td>";
            }
            
            // Columna de Tema
            contenido += "<td>";
            contenido += tema.nombre;
            
            // Si hay subtemas, agregarlos como lista
            if (tema.subtemas && tema.subtemas.length > 0) {
                contenido += "<ul>";
                tema.subtemas.forEach(function(subtema) {
                    contenido += "<li>" + subtema + "</li>";
                });
                contenido += "</ul>";
            }
            contenido += "</td>";
            
            // Columna de Material
            contenido += "<td>";
            if (tema.material && tema.material.length > 0) {
                contenido += "<ul>";
                tema.material.forEach(function(mat) {
                    contenido += "<li>";
                    contenido += "<a href=\"" + mat.url + "\" download=\"" + (mat.download || "") + "\" target=\"_blank\">";
                    contenido += mat.nombre;
                    contenido += "</a>";
                    contenido += "</li>";
                });
                contenido += "</ul>";
            }
            contenido += "</td>";
            
            // Columna de Problemas de práctica
            contenido += "<td>";
            if (tema.problemas && tema.problemas.length > 0) {
                contenido += "<ul>";
                tema.problemas.forEach(function(problema) {
                    contenido += "<li>";
                    contenido += "<a href=\"" + problema.url + "\" target=\"_blank\">" + problema.nombre + "</a>";
                    
                    // Agregar enlace de video si existe
                    if (problema.video) {
                        if (problema.video.url && problema.video.visible) {
                            // Video visible con URL
                            contenido += "&nbsp;<a data-toggle=\"tooltip\" data-placement=\"top\" title=\"Video Solución\" href=\"" + problema.video.url + "\" target=\"_blank\"><i class=\"fab fa-youtube\"></i></a>";
                        } else if (problema.video.url) {
                            // Video con URL pero no visible (hidden)
                            contenido += "&nbsp;<a data-toggle=\"tooltip\" data-placement=\"top\" title=\"Video Solución\" href=\"" + problema.video.url + "\" hidden target=\"_blank\"><i class=\"fab fa-youtube\"></i></a>";
                        } else {
                            // Video placeholder sin URL (hidden)
                            contenido += "&nbsp;<a data-toggle=\"tooltip\" data-placement=\"top\" title=\"Video Solución\" href=\"\" hidden target=\"_blank\"><i class=\"fab fa-youtube\"></i></a>";
                        }
                    }
                    
                    contenido += "</li>";
                });
                contenido += "</ul>";
            }
            contenido += "</td>";
            
            contenido += "</tr>";
        });
    });
    
    tbody.innerHTML = contenido;
    
    // Inicializar tooltips de Bootstrap si están disponibles
    if (typeof $ !== 'undefined' && $.fn.tooltip) {
        $('[data-toggle="tooltip"]').tooltip();
    }
}

