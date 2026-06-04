/**
 * 페이지 분할 함수
 * @param container - 페이지 분할을 할 컨테이너 DOM
 * @param pageHeight - 페이지 높이
 * @description
 * 컨테이너 DOM을 스캔하여 페이지 분할 Y-offset 배열을 반환한다.
 * `break-inside: avoid` CSS 속성을 가진 요소가 페이지 경계에 걸리면
 * 해당 요소를 다음 페이지로 밀어내 문서 간 경계선에서 분할이 되는 것을 방지한다.
 *
 * @returns 각 페이지의 시작 Y-offset 배열. 예: [0, 980, 1960]
 *
 * @see {@link https://github.com/eKoopmans/html2pdf.js} html2pdf.js의 page-break 처리 방식을 참고함
 */
export function computePageBreaks(container: HTMLElement, pageHeight: number): number[] {
  const totalHeight = container.scrollHeight;
  if (totalHeight <= pageHeight) return [0];

  const containerRect = container.getBoundingClientRect();

  const avoidElements: { top: number; bottom: number }[] = [];
  container.querySelectorAll('*').forEach((el) => {
    const style = window.getComputedStyle(el);
    if (style.breakInside === 'avoid') {
      const rect = el.getBoundingClientRect();
      avoidElements.push({
        top: rect.top - containerRect.top,
        bottom: rect.bottom - containerRect.top,
      });
    }
  });
  avoidElements.sort((a, b) => a.top - b.top);

  const offsets: number[] = [0];
  let idealBoundary = pageHeight;

  while (idealBoundary < totalHeight) {
    let boundary = idealBoundary;

    // 경계에 걸리는 avoid 요소를 반복 탐색하여 경계를 앞당김
    // 예: A 요소를 밀었더니 B 요소도 경계에 걸리는 경우를 처리
    let adjusted = true;
    while (adjusted) {
      adjusted = false;
      for (const el of avoidElements) {
        if (el.top < boundary && el.bottom > boundary) {
          if (el.bottom - el.top <= pageHeight) {
            boundary = el.top;
            adjusted = true;
          }
          break;
        }
      }
    }

    // 무한루프 방지: 경계가 이전 페이지 시작 이하로 내려가면 원래 경계 사용
    if (boundary <= offsets[offsets.length - 1]) {
      boundary = idealBoundary;
    }

    offsets.push(boundary);
    idealBoundary = boundary + pageHeight;
  }

  return offsets;
}
