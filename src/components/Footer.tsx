import React, { FC } from 'react';

interface FooterProps {
  currentPage: number;
  totalPages: number;
}

export const Footer: FC<FooterProps> = ({ currentPage, totalPages }) => (
  <div className="shrink-0 mt-4">
    <p className="text-sm text-(--color-gray-500) text-center">
      {currentPage} / {totalPages}
    </p>
  </div>
);
