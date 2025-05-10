// ==UserScript==
// @name         Google - Auto Click "Ver Original (inglés/English)"
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Busca y hace clic automáticamente en el enlace/botón "Ver original (inglés/English)" en los resultados de búsqueda de Google.
// @author       TuNombreAquí (o Gemini)
// @match        *://*.google.com/search*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // Textos que buscará en los elementos.
    const targetElementTexts = [
        "Ver original (inglés)",   // Variante con tilde
        "Ver original (English)",  // Variante encontrada en tu HTML
        "View original (English)"  // Variante en inglés (UI de Google en inglés)
    ];

    function findAndClickElement() {
        // console.log("Tampermonkey: Buscando elemento 'Ver original'...");
        let clickedThisRound = false;

        // Buscar tanto enlaces <a> como <span> con role="button"
        document.querySelectorAll('a, span[role="button"]').forEach(element => {
            if (clickedThisRound) return; // Si ya se hizo clic en esta ronda de búsqueda, no continuar

            const elementText = element.textContent.trim();

            targetElementTexts.forEach(targetText => {
                if (elementText.includes(targetText)) {
                    // Asegurarse de que el elemento es visible y no ha sido clickeado por este script
                    if (element.offsetParent !== null && !element.dataset.clickedByScript) {
                        console.log(`Tampermonkey: Encontrado y haciendo clic en: "${elementText}"`, element);
                        element.dataset.clickedByScript = 'true'; // Marcar para evitar bucles
                        element.click();
                        clickedThisRound = true; // Marcar que se hizo un clic
                        // Opcional: si solo quieres que haga clic en el primer elemento encontrado y pare:
                        // observer.disconnect(); // Descomentar si solo quieres un clic por carga de página/mutación
                        return; // Salir del bucle forEach de targetElementTexts
                    }
                }
            });
        });
    }

    // Ejecutar al cargar la página
    findAndClickElement();

    // Observador para cambios en el DOM (nuevos resultados cargados dinámicamente)
    const observer = new MutationObserver((mutationsList, observerInstance) => {
        let relevantChangeDetected = false;
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                relevantChangeDetected = true;
                break;
            }
            // También podríamos observar 'attributes' si el texto cambia en un elemento existente,
            // pero 'childList' suele ser suficiente para nuevos resultados.
        }

        if (relevantChangeDetected) {
            // console.log("Tampermonkey: DOM modificado, re-buscando elemento...");
            findAndClickElement();
        }
    });

    // Elemento a observar (el cuerpo del documento es una opción general)
    const targetNode = document.body;
    const config = { childList: true, subtree: true };

    // Empezar a observar
    observer.observe(targetNode, config);

    // Opcional: Limpiar el observador cuando la página se descarga (buena práctica)
    window.addEventListener('unload', () => {
        if (observer) {
            observer.disconnect();
            // console.log("Tampermonkey: Observador desconectado.");
        }
    });

})();