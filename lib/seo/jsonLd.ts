/**
 * Serializes a JSON-LD object for injection into an inline `<script>` element.
 *
 * `JSON.stringify` escapes quotes and backslashes but never `<`, `>` or `&`, and
 * React emits `dangerouslySetInnerHTML` content unescaped. A DB-sourced string
 * containing `</script>` therefore closes the JSON-LD element, and everything
 * after it is parsed as HTML — stored XSS on every page that renders the row.
 *
 * Escaping those three characters to their `\u00xx` form leaves the JSON
 * semantically identical (parsers decode the escapes) while making the breakout
 * impossible.
 */
export function serializeJsonLd(schema: unknown): string {
  return JSON.stringify(schema)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}
