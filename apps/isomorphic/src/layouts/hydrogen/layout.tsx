import Header from '@/layouts/hydrogen/header';
import Sidebar from '@/layouts/hydrogen/sidebar';
import GlobalDrawer from '@/app/shared/drawer-views/container'; // ✅ import di sini
import { Outlet } from 'react-router-dom';

export default function HydrogenLayout({
  setDate,
}: {
  setDate: (start: Date | null, end: Date | null, type: string, compareLabel: string) => void;
}) {
  return (
    <main className="flex min-h-screen flex-grow">
      <Sidebar className="fixed hidden dark:bg-gray-50 xl:block" />
      <div className="flex w-full flex-col xl:ms-[270px] xl:w-[calc(100%-270px)] 2xl:ms-72 2xl:w-[calc(100%-288px)]">
        <Header setDate={setDate} />
        <div className="flex flex-grow flex-col px-4 pb-6 pt-2 md:px-5 lg:px-6 lg:pb-8 3xl:px-8 3xl:pt-4 4xl:px-10 4xl:pb-9">
          <Outlet /> {/* semua halaman dashboard akan ditampilkan di sini */}
        </div>
        <GlobalDrawer /> {/* ✅ selalu muncul di semua halaman dalam layout */}
      </div>
    </main>
  );
}
