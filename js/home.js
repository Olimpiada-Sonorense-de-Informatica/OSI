/* global fetch, IntersectionObserver */
(function () {
    'use strict';

    const NEWS_URL = 'files/noticias.json';
    const TIMELINE_URL = 'files/timeline.json';
    const ICON_MAP = {
        oro: 'assets/img/iconos/oro.png',
        plata: 'assets/img/iconos/plata.png',
        bronce: 'assets/img/iconos/bronce.png'
    };

    let animationObserver = null;
    const soportaObserver = 'IntersectionObserver' in window;

    document.addEventListener('DOMContentLoaded', function () {
        cargarNoticias();
        cargarTimeline();
        inicializarAnimaciones();
    });

    function cargarNoticias() {
        const container = document.getElementById('noticias-container');
        const emptyState = document.getElementById('noticias-empty');
        if (!container) {
            return;
        }

        fetch(NEWS_URL)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Error al obtener noticias');
                }
                return response.json();
            })
            .then((noticias) => {
                if (!Array.isArray(noticias) || noticias.length === 0) {
                    emptyState && (emptyState.hidden = false);
                    return;
                }

                noticias.forEach((noticia) => {
                    emptyState && (emptyState.hidden = true);
                    const col = document.createElement('div');
                    col.className = 'col-md-6 col-lg-4 mb-4';
                    col.setAttribute('data-animate', 'fade-up');

                    const icon = noticia.icono === 'calendar' ? 'fa-calendar' : noticia.icono || 'fa-bullhorn';
                    const iconSlug = (noticia.icono || 'bullhorn').replace(/^fa-/, '');

                    col.innerHTML = [
                        '<span class="fa-stack fa-4x">',
                        '  <i class="fas fa-circle fa-stack-2x text-primary"></i>',
                        `  <i class="fas fa-${iconSlug} fa-stack-1x fa-inverse"></i>`,
                        '</span>',
                        `<h4 class="my-3">${noticia.titulo || ''}</h4>`,
                        '<p class="text-muted">',
                        ...(Array.isArray(noticia.descripcion)
                            ? noticia.descripcion.map((linea) => `${linea}<br>`)
                            : [noticia.descripcion || '']),
                        noticia.cta && noticia.cta.url
                            ? [
                                  '<br>',
                                  `<a href="${noticia.cta.url}" class="btn btn-info mt-2"${noticia.cta.externo ? ' target="_blank" rel="noopener noreferrer"' : ''}>${noticia.cta.texto || 'Ver más'}</a>`
                              ].join('')
                            : '',
                        '</p>'
                    ].join('\n');

                    container.appendChild(col);
                    registrarAnimacion(col);
                });
            })
            .catch(() => {
                emptyState && (emptyState.hidden = false);
            });
    }

    function cargarTimeline() {
        const timeline = document.getElementById('timeline');
        if (!timeline) {
            return;
        }

        fetch(TIMELINE_URL)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Error al obtener timeline');
                }
                return response.json();
            })
            .then((items) => {
                if (!Array.isArray(items)) {
                    return;
                }

                items.forEach((evento, index) => {
                    const li = document.createElement('li');
                    const isInverted = index % 2 === 0;
                    li.className = isInverted ? 'timeline-inverted' : '';
                    li.setAttribute('data-animate', 'fade-up');

                    const imagenAlt = `Delegación OSI ${evento.sede} ${evento.anio}`;

                    const participantesHtml = (evento.participantes || [])
                        .map((participante) => construirParticipanteHtml(participante))
                        .join('');

                    li.innerHTML = [
                        `<div class="timeline-image"><img class="rounded-circle img-fluid" src="${evento.imagen}" alt="${imagenAlt}" loading="lazy" decoding="async"></div>`,
                        '<div class="timeline-panel">',
                        '  <div class="timeline-heading">',
                        evento.resultadoUrl
                            ? `    <h4><a href="${evento.resultadoUrl}" target="_blank" rel="noopener noreferrer">${evento.sede} - ${evento.anio}</a></h4>`
                            : `    <h4>${evento.sede} - ${evento.anio}</h4>`,
                        '  </div>',
                        `  <div class="timeline-body"><p class="text-muted">${participantesHtml}</p></div>`,
                        '</div>'
                    ].join('\n');

                    timeline.appendChild(li);
                    registrarAnimacion(li);
                });
            })
            .catch((error) => {
                console.error('Error al cargar el timeline:', error);
            });
    }

    function construirParticipanteHtml(participante) {
        if (!participante || !participante.nombre) {
            return '';
        }

        const nombreSeguro = participante.nombre;
        const enlace = participante.perfil
            ? `<a href="${participante.perfil}" target="_blank" rel="noopener noreferrer">${nombreSeguro}</a>`
            : nombreSeguro;

        const medallaIcon = participante.medalla && ICON_MAP[participante.medalla.toLowerCase()]
            ? ` - <img src="${ICON_MAP[participante.medalla.toLowerCase()]}" width="23" alt="${capitalizar(participante.medalla)}">`
            : '';

        return `<span class="timeline-participante">${enlace}${medallaIcon}</span>`;
    }

    function capitalizar(texto) {
        if (!texto) return '';
        return texto.charAt(0).toUpperCase() + texto.slice(1);
    }

    function inicializarAnimaciones() {
        const elementos = document.querySelectorAll('[data-animate]');
        if (!soportaObserver || elementos.length === 0) {
            elementos.forEach((el) => el.classList.add('is-visible'));
            return;
        }

        animationObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        animationObserver.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.15
            }
        );

        elementos.forEach((el) => registrarAnimacion(el));
    }

    function registrarAnimacion(elemento) {
        if (!elemento) {
            return;
        }

        if (!soportaObserver) {
            elemento.classList.add('is-visible');
            return;
        }

        if (!animationObserver) {
            // Si aún no se inicializa (por ejemplo, elementos agregados antes de inicializar), se intentará más tarde.
            return;
        }

        animationObserver.observe(elemento);
    }
})();

