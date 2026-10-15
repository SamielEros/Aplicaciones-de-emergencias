/**
 * Optimizador de Entrada y Escritura Táctica SCI
 * 
 * Garantiza escritura ultra-fluida, sin retardos, sin pérdida de letras y sin saltos del cursor:
 * - Deshabilita la predicción y el autocorrector que modifican abreviaturas del SCI
 * - No interfiere con el cursor ni con el buffer de entrada del navegador
 * - Mantiene el español latinoamericano (es-419) y bloquea traductores intrusivos
 */

export const tacticalInputProps = {
  autoComplete: 'off',
  autoCorrect: 'off',
  autoCapitalize: 'off',
  spellCheck: false,
  translate: 'no' as const,
  'data-gramm': 'false',
  'data-enable-grammarly': 'false'
};

export const tacticalTextareaProps = {
  autoComplete: 'off',
  autoCorrect: 'off',
  autoCapitalize: 'sentences',
  spellCheck: false,
  translate: 'no' as const,
  'data-gramm': 'false',
  'data-enable-grammarly': 'false'
};

/**
 * Inicializa de forma no intrusiva los metadatos globales del documento.
 * No utiliza MutationObservers agresivos que reseteen la posición del cursor o borren caracteres.
 */
export function initInputOptimizer(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // 1. Configurar atributos de idioma y traducción a nivel de documento una sola vez
  try {
    document.documentElement.lang = 'es-419';
    document.documentElement.setAttribute('translate', 'no');
    document.documentElement.classList.add('notranslate');
    if (document.body) {
      document.body.classList.add('notranslate');
      document.body.setAttribute('translate', 'no');
    }
  } catch (e) {
    // ignore
  }

  // 2. Interceptar al enfocar un campo únicamente si no tiene ya autocomplete/spellcheck
  // Nunca mutar atributos durante el tecleo (input/beforeinput) para proteger el cursor
  document.addEventListener(
    'focusin',
    (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
        if (!target.hasAttribute('autocomplete')) target.setAttribute('autocomplete', 'off');
        if (!target.hasAttribute('autocorrect')) target.setAttribute('autocorrect', 'off');
        if (target.spellcheck) target.spellcheck = false;
        if (!target.hasAttribute('translate')) target.setAttribute('translate', 'no');
      }
    },
    { capture: true, passive: true }
  );
}
