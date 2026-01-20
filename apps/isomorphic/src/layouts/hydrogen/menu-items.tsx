import { DUMMY_ID } from '@/config/constants';
import { routes } from '@/config/routes';
import {
  PiChartPieSliceDuotone,
  PiMapPinLineDuotone,
  PiPackageDuotone,
  PiPushPinDuotone,
  PiSquaresFourDuotone,
  PiUserDuotone,
  PiAndroidLogoDuotone,
  PiDoorOpenDuotone,
} from 'react-icons/pi';

// Note: do not add href in the label object, it is rendering as label
export const menuItems = [
  // label start
  {
    name: 'Overview',
  },
  // label end
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: <PiChartPieSliceDuotone />,
  },
  {
    name: 'Master',
  },
  {
    name: 'Material',
    href: routes.dashboard.material,
    icon: <PiPackageDuotone />,
  },
  {
    name: 'Produk',
    href: '#',
    icon: <PiSquaresFourDuotone />,
    dropdownItems: [
      {
        name: 'Daftar Produk',
        href: routes.dashboard.products,
      },
      {
        name: 'Name Recommendation',
        href: routes.dashboard.nameRecommendation,
      },
      {
        name: 'Image Generation',
        href: routes.dashboard.imageGeneration,
      },
      {
        name: 'Post Instagram',
        href: routes.dashboard.postInstagram,
      },
    ],
  },
  // {
  //   name: 'Toko',
  //   href: routes.dashboard.store,
  //   icon: <PiMapPinLineDuotone />,
  // },

  {
    name: 'Data Umum',
    href: '#',
    icon: <PiPushPinDuotone />,
    dropdownItems: [
      {
        name: 'Satuan',
        href: routes.dashboard.uoms,
        badge: '',
      },
      {
        name: 'Kategori Produk',
        href: routes.dashboard.categories,
      },
    ],
  },

  // label start
  {
    name: 'Administrator',
  },

  {
    name: 'Users',
    href: routes.dashboard.users,
    icon: <PiUserDuotone />,
  },
];

export const bottomMenuItems = [
  {
    name: 'Kunjungi Menu Utama',
    href: 'https://demo.kedaimaster.com/demo/menu', // You might want to change this to an actual link for the cafe
    icon: <PiDoorOpenDuotone />,
  },
  {
    name: 'Download Aplikasi',
    href: 'https://download.demo.kedaimaster.apps.kediritechnopark.com/', // You might want to change this to an actual download link
    icon: <PiAndroidLogoDuotone />,
  },
];
