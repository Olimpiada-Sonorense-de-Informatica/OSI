/**
 * Modal functionality for index.html
 */
(function($) {
    'use strict';
    
    $(document).ready(function() {
        // Handle convocatoria modal
        $(document).on("click", "#btnConvocatoria", function() {
            $("#modalConvocatoria").modal("show");
        });
    });
})(jQuery);

