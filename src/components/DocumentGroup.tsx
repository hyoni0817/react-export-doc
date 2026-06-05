'use client';

import React, { createContext, FC, useCallback, useMemo, useState } from 'react';

export interface DocumentGroupContextValue {
  register: (id: string, pageCount: number) => void;
  unregister: (id: string) => void;
  getPageOffset: (id: string) => number;
  totalPages: number;
  renderHeader?: (currentPage: number, totalPages: number) => React.ReactNode;
  renderFooter?: (currentPage: number, totalPages: number) => React.ReactNode;
}

export const DocumentGroupContext = createContext<DocumentGroupContextValue | null>(null);

interface DocumentGroupProps {
  children: React.ReactNode;
  renderHeader?: (currentPage: number, totalPages: number) => React.ReactNode;
  renderFooter?: (currentPage: number, totalPages: number) => React.ReactNode;
}

/**
 * 여러 Document의 페이지 번호를 연속으로 이어주고, 공통 header/footer를 일괄 적용하는 wrapper 컴포넌트
 * @param children - 자식 컴포넌트
 * @param renderHeader - 모든 하위 Document에 일괄 적용될 header 렌더링 함수
 * @param renderFooter - 모든 하위 Document에 일괄 적용될 footer 렌더링 함수
 * @description
 * - 여러 Document를 감싸서 페이지 번호를 연속으로 매긴다.
 * - 각 Document가 자신의 페이지 수를 register하면, DocumentGroup이
 * - 전체 합산 totalPages와 각 Document의 시작 offset을 계산하여 제공한다.
 *
 * - renderHeader/renderFooter를 여기서 지정하면 모든 하위 Document에 일괄 적용된다.
 * (Document 자체에도 지정하면 Document의 것이 우선)
 */
export const DocumentGroup: FC<DocumentGroupProps> = ({ children, renderHeader, renderFooter }) => {
  const [pageCounts, setPageCounts] = useState<Map<string, number>>(new Map());

  const register = useCallback((id: string, pageCount: number) => {
    setPageCounts((prev) => {
      if (prev.get(id) === pageCount) return prev;
      const next = new Map(prev);
      next.set(id, pageCount);
      return next;
    });
  }, []);

  const unregister = useCallback((id: string) => {
    setPageCounts((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const totalPages = useMemo(() => {
    let total = 0;
    for (const count of pageCounts.values()) total += count;
    return total;
  }, [pageCounts]);

  const getPageOffset = useCallback(
    (id: string) => {
      let offset = 0;
      for (const [key, count] of pageCounts) {
        if (key === id) break;
        offset += count;
      }
      return offset;
    },
    [pageCounts]
  );

  const contextValue = useMemo<DocumentGroupContextValue>(
    () => ({ register, unregister, getPageOffset, totalPages, renderHeader, renderFooter }),
    [register, unregister, getPageOffset, totalPages, renderHeader, renderFooter]
  );

  return (
    <div className="react-doc-group">
      <DocumentGroupContext.Provider value={contextValue}>{children}</DocumentGroupContext.Provider>
    </div>
  );
};

// ReactDoc.export(<Component />, { type: 'pdf', filename: '' });
