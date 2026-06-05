'use client';

import React, { FC, useCallback, useContext, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { CONTENT_HEIGHT, CONTENT_WIDTH } from '../utils/documentSize';
import { Page } from './Page';
import { DocumentGroupContext } from './DocumentGroup';
import { computePageBreaks } from '../utils/pageBreak';

const HIDDEN_STYLE: React.CSSProperties = {
  position: 'fixed',
  top: '-9999px',
  left: '-9999px',
  visibility: 'hidden',
  pointerEvents: 'none',
  width: `${CONTENT_WIDTH}px`,
};

interface DocumentProps {
  children: React.ReactNode;
  /**
   * 모든 페이지 콘텐츠 상단에 반복 표시할 요소.
   * 높이가 자동 측정되어 페이지당 가용 콘텐츠 높이에서 차감됨.
   * 예) 테이블 컬럼 헤더
   */
  pageTopItems?: React.ReactNode;
  renderHeader?: (currentPage: number, totalPages: number) => React.ReactNode;
  renderFooter?: (currentPage: number, totalPages: number) => React.ReactNode;
}

/**
 * 페이지 분할 및 개별 header/footer 렌더링을 담당하는 컴포넌트
 * @param children - 자식 컴포넌트
 * @param renderHeader - 해당 Document에 일괄 적용될 header 렌더링 함수
 * @param renderFooter - 해당 Document에 일괄 적용될 footer 렌더링 함수
 * @description
 * - children을 숨김 컨테이너에서 DOM 측정한 뒤, break-inside: avoid 요소를
 * - 존중하며 자동 페이지 분할하여 렌더링한다. (html2pdf.js page_break 방식)
 *
 * - Document에서 renderHeader/renderFooter를 지정하면 DocumentGroup에서 사용하는 renderHeader/renderFooter보다 우선적으로 렌더링 됨.
 * - 참고로, DocumentGroup의 renderHeader/renderFooter를 상속하고, 페이지 번호가 전체 문서에 걸쳐 연속으로 매겨짐
 */
export const Document: FC<DocumentProps> = ({ children, pageTopItems, renderHeader, renderFooter }) => {
  const id = useId();
  const groupCtx = useContext(DocumentGroupContext);
  const groupCtxRef = useRef(groupCtx);
  groupCtxRef.current = groupCtx;

  const contentRef = useRef<HTMLDivElement>(null);
  const pageTopRef = useRef<HTMLDivElement>(null);
  const [pageState, setPageState] = useState<{ offsets: number[]; availableHeight: number }>({
    offsets: [],
    availableHeight: CONTENT_HEIGHT,
  });

  const recalculate = useCallback(() => {
    const pageTopH = pageTopRef.current?.getBoundingClientRect().height ?? 0;
    const available = CONTENT_HEIGHT - pageTopH;

    const container = contentRef.current;
    let newOffsets: number[] = [];

    if (container && container.scrollHeight > 0) {
      newOffsets = computePageBreaks(container, available);
    }

    setPageState((prev) => {
      if (
        prev.availableHeight === available &&
        prev.offsets.length === newOffsets.length &&
        prev.offsets.every((v, i) => v === newOffsets[i])
      ) {
        return prev;
      }
      return { offsets: newOffsets, availableHeight: available };
    });

    groupCtxRef.current?.register(id, newOffsets.length);
  }, [id]);

  // children이 변경되면 re-render → effect 재실행
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    recalculate();
  });

  // 자식 컴포넌트의 비동기 데이터 로딩 등으로 hidden container의 크기가
  // 변경되었을 때(Document 자체는 re-render되지 않는 경우)에도
  // 페이지 분할을 재계산한다.
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      recalculate();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [recalculate]);

  // 언마운트 시에만 그룹에서 등록 해제 (ref로 최신 ctx 참조하여 deps 순환 방지)
  useEffect(() => {
    return () => groupCtxRef.current?.unregister(id);
  }, [id]);

  const { offsets, availableHeight } = pageState;
  const localPageCount = offsets.length;

  // 그룹 내부면 글로벌 번호, 단독이면 로컬 번호
  const pageOffset = groupCtx ? groupCtx.getPageOffset(id) : 0;
  const totalPages = groupCtx ? groupCtx.totalPages : localPageCount;

  // 그룹의 renderHeader/renderFooter를 상속하되, 자체 props가 있으면 우선
  const effectiveRenderHeader = renderHeader ?? groupCtx?.renderHeader;
  const effectiveRenderFooter = renderFooter ?? groupCtx?.renderFooter;

  const shouldRenderPages = totalPages > 0 && localPageCount > 0;

  return (
    <>
      {pageTopItems && (
        <div ref={pageTopRef} aria-hidden="true" style={HIDDEN_STYLE}>
          {pageTopItems}
        </div>
      )}

      <div ref={contentRef} aria-hidden="true" style={HIDDEN_STYLE}>
        {children}
      </div>

      {shouldRenderPages &&
        offsets.map((offset, index) => {
          const currentPage = pageOffset + index + 1;
          const nextOffset = offsets[index + 1];
          // 다음 페이지 시작점까지만 클리핑하여 중복 방지. 마지막 페이지는 가용 높이 전체 사용.
          const sliceHeight = nextOffset !== undefined ? nextOffset - offset : availableHeight;
          return (
            <Page
              key={index}
              header={effectiveRenderHeader?.(currentPage, totalPages)}
              footer={effectiveRenderFooter?.(currentPage, totalPages)}
            >
              {pageTopItems}
              <div style={{ overflow: 'hidden', height: `${sliceHeight}px` }}>
                <div style={{ marginTop: `${-offset}px` }}>{children}</div>
              </div>
            </Page>
          );
        })}
    </>
  );
};
