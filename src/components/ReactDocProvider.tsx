'use client';

import React, { createContext, useState, useRef, FC } from 'react';
import { createPortal } from 'react-dom';
import { html2canvas } from 'html2canvas-pro';
import jsPDF from 'jspdf';
import { A4_WIDTH_PX } from '../utils/documentSize';

interface ReactDocProviderProps {
  children: React.ReactNode;
}

export interface ReactDocContextValue {
  exportPDF: (component: React.ReactNode, options: { filename: string }) => Promise<void>;
}

export const ReactDocContext = createContext<ReactDocContextValue | null>(null);

export const ReactDocProvider: FC<ReactDocProviderProps> = ({ children }) => {
  const [portalContent, setPortalContent] = useState<React.ReactNode | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const exportPDF: ReactDocContextValue['exportPDF'] = async (component, options) => {
    setPortalContent(component);

    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!containerRef.current) return;

    const canvas = await html2canvas(containerRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width; // 비율 유지
    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // 내용이 한 페이지를 넘으면 추가 페이지 생성
    while (heightLeft > 0) {
      position -= pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(options.filename || 'document.pdf');

    setPortalContent(null);
  };

  return (
    <ReactDocContext.Provider value={{ exportPDF }}>
      {children}

      {portalContent &&
        createPortal(
          <div
            ref={containerRef}
            style={{ position: 'absolute', top: 0, left: '-9999px', zIndex: -1, width: A4_WIDTH_PX }}
          >
            {portalContent}
          </div>,
          document.body
        )}
    </ReactDocContext.Provider>
  );
};
