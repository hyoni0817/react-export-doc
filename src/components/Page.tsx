import React, { FC } from 'react';
import { A4_HEIGHT_PX, A4_WIDTH_PX, CONTENT_HEIGHT, PAGE_PADDING } from '../utils/documentSize';

interface PageProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Page: FC<PageProps> = ({ children, header, footer }) => (
  <div
    style={{
      width: A4_WIDTH_PX,
      height: A4_HEIGHT_PX,
      padding: PAGE_PADDING,
    }}
    className="print:[page-break-after:always] print:last:[page-break-after:auto]"
  >
    {header}
    <div style={{ height: CONTENT_HEIGHT, overflow: 'hidden', flexShrink: 0 }}>{children}</div>
    {footer}
  </div>
);
