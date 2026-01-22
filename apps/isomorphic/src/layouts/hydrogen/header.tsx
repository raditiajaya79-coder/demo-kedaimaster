'use client';

import { useState } from 'react';
import { Link } from 'react-router-dom';
import HamburgerButton from '@/layouts/hamburger-button';
import Sidebar from '@/layouts/hydrogen/sidebar';
import Logo from '@core/components/logo';
import HeaderMenuRight from '@/layouts/header-menu-right';
import StickyHeader from '@/layouts/sticky-header';
import SearchWidget from '@/app/shared/search/search';

export default function Header({
  setDate,
}: {
  setDate: (start: Date | null, end: Date | null, type: string, compareLabel: string) => void;
}) {
  // ✅ Fungsi handler dengan tipe parameter yang jelas
  const handleSetDate = (start: Date | null, end: Date | null, type: string, compareLabel: string) => {
    setDate(start, end, type, compareLabel);
    console.log('Tanggal dipilih:', { start, end, type, compareLabel });
  };

  return (
    <StickyHeader className="z-[990] 2xl:py-5 3xl:px-8 4xl:px-10">
      <div className="flex w-full max-w-2xl items-center">
        <HamburgerButton view={<Sidebar className="static w-full 2xl:w-full" />} />
        <div
          aria-label="Site Logo"
          className="me-4 w-9 shrink-0 text-gray-800 hover:text-gray-900 lg:me-5 xl:hidden"
        >
          <Logo iconOnly />
        </div>
        {/* <SearchWidget /> */}
      </div>

      {/* ⬇️ Kirim callback ke HeaderMenuRight */}
      <HeaderMenuRight setDate={handleSetDate} />
    </StickyHeader>
  );
}
