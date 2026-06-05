import React, { FC } from 'react';

interface HeaderProps {
  title: string;
  currentPage: number;
  totalPages: number;
}

export const Header: FC<HeaderProps> = (props) => {
  const { title } = props;

  return (
    <div className="shrink-0 mb-4">
      <h2 className="pb-3 text-xl text-(--color-gray-700) font-bold border-b-2 border-(--divider)">{title}</h2>
    </div>
  );
};
