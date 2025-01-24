import { Navbar, NavbarContent } from '@nextui-org/react';
import React from 'react';

import { BurguerButton } from './burguer-button';
import { UserDropdown } from './user-dropdown';

interface Props {
  children: React.ReactNode;
  t: (key: string) => string;
}
export const NavbarWrapper = ({ children, t }: Props) => {
  return (
    <div className="w-[100%] flex  flex-col flex-1 overflow-y-auto overflow-x-hidden">
      {/* Закрепленная панель */}
      <Navbar
        isBordered
        className="fixed top-0 left-0 w-full z-[19]  dark:bg-[#222222]" // Добавили фиксацию
        classNames={{
          wrapper: 'w-full max-w-full',
        }}
      >
        <NavbarContent className="md:hidden">
          <BurguerButton />
        </NavbarContent>

        <NavbarContent justify="end" className="w-fit data-[justify=end]:flex-grow-6">
          <NavbarContent justify="end">
            {/* @ts-ignore */}
            <UserDropdown t={t} />
          </NavbarContent>
        </NavbarContent>
      </Navbar>

      {/* Контент */}
      <div className="mt-[64px]">
        {' '}
        {/* Увеличиваем отступ, чтобы контент не перекрывался панелью */}
        {children}
      </div>
    </div>
  );
};
