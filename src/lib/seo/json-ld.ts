/**
 * JSON-LD payload을 <script type="application/ld+json">에 삽입할 때
 * `</script>` 등 닫는 태그가 본문에 들어가는 것을 막기 위해 `<` 를 escape.
 * dangerouslySetInnerHTML로 주입할 때 항상 이 함수를 거친다.
 */
export function serializeJsonLd(jsonLd: unknown): string {
  return JSON.stringify(jsonLd).replace(/</g, '\\u003c')
}
