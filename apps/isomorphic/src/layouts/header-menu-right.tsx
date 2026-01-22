'use client';

import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Badge, ActionIcon } from 'rizzui';
import SmartDateSelector, { DateOption } from '@core/ui/SmartDateSelector';
import NotificationDropdown from './notification-dropdown';
import ProfileMenu from '@/layouts/profile-menu';
import RingBellSolidIcon from '@core/components/icons/ring-bell-solid';

type HeaderMenuRightProps = {
  setDate: (start: Date | null, end: Date | null, type: string, compareLabel: string) => void;
};

const rangeOptions: DateOption[] = [
  {
    label: "Hari ini",
    value: "harian",
    compareLabel: "Dibanding kemarin",
    getRange: () => {
      const now = new Date();
      const start = new Date(now.setHours(0, 0, 0, 0)); // Set start to midnight
      const end = new Date(now); // Keep end as current date (no specific time needed)
      return { start, end };
    },
  },
  {
    label: "Kemarin",
    value: "kemarin",
    compareLabel: "Dibanding kemarin lusa",

    getRange: () => {
      const now = new Date();
      const yesterday = new Date(now.setDate(now.getDate() - 1));
      const start = new Date(yesterday.setHours(0, 0, 0, 0)); // Start at midnight
      const end = new Date(yesterday); // Keep end as current date (no time needed)
      return { start, end };
    },
  },
  {
    label: "Mingguan",
    value: "mingguan", compareLabel: "Dibanding minggu lalu",

    getRange: () => {
      const now = new Date();
      const day = now.getDay();
      const start = new Date(now.setDate(now.getDate() - day)); // Start at the beginning of the week
      start.setHours(0, 0, 0, 0); // Start at midnight
      const end = new Date(start);
      end.setDate(start.getDate() + 6); // Set end to 6 days later
      end.setHours(23, 59, 59, 999); // End at the last millisecond of the day
      return { start, end };
    },
  },
  {
    label: "Bulanan",
    value: "bulanan", compareLabel: "Dibanding bulan lalu",

    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1); // First day of the month
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of the month
      end.setHours(23, 59, 59, 999); // End at the last millisecond of the day
      return { start, end };
    },
  },
  {
    label: "Tahunan",
    value: "tahunan",
    compareLabel: "Dibanding tahun lalu",

    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1); // First day of the year
      const end = new Date(now.getFullYear(), 11, 31); // Last day of the year
      end.setHours(23, 59, 59, 999); // End at the last millisecond of the day
      return { start, end };
    },
  },
  {
    label: "Pilih Rentang Waktu",
    value: "kustom", // For custom date picker
    compareLabel: "Dibanding sebelumnya",
  },
];

export default function HeaderMenuRight({ setDate }: HeaderMenuRightProps) {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  // 🧠 Track the previous range to avoid unnecessary re-renders
  const prevRange = useRef<{ start: Date | null; end: Date | null }>(null);

  const [viewType, setViewType] = useState<string>('harian');

  useEffect(() => {
    const range = rangeOptions.find(option => option.value === viewType);
    if (range && range.getRange) { // Ensure getRange exists
      const { start, end } = range.getRange();
      // Check if the range is different from the previous one
      const isSame =
        prevRange.current?.start?.getTime() === start.getTime() &&
        prevRange.current?.end?.getTime() === end.getTime();

      if (!isSame) {
        setDate(start, end, range.value, range.compareLabel);
        (prevRange.current as { start: Date | null; end: Date | null }) = { start, end }; // Type assertion for mutability
      }
    } else if (viewType === 'kustom') {
      // For 'kustom' type, the date is set via onChange of SmartDateSelector,
      // so no action needed here.
    }
  }, [viewType, setDate]);

  return (
    <div className="ms-auto flex items-center gap-2 text-gray-700 xs:gap-3 xl:gap-4">
      {isDashboard && (
        <SmartDateSelector
          options={rangeOptions}
          defaultValue={viewType}
          onChange={({ start, end, type }) => {
            const selectedOption = rangeOptions.find(option => option.value === type);
            setDate(start, end, type, selectedOption?.compareLabel || type); // Use compareLabel from option or fallback to type
            setViewType(type); // Set viewType on manual date range selection
          }}
        />
      )}

      {/* Notification */}
      <NotificationDropdown>
        <ActionIcon
          aria-label="Notification"
          variant="text"
          className="relative h-[34px] w-[34px] shadow backdrop-blur-md dark:bg-gray-100 md:h-9 md:w-9"
        >
          <RingBellSolidIcon className="h-[18px] w-auto" />
          <Badge
            renderAsDot
            color="warning"
            enableOutlineRing
            className="absolute right-2.5 top-2.5 -translate-y-1/3 translate-x-1/2"
          />
        </ActionIcon>
      </NotificationDropdown>

      <ProfileMenu />
    </div>
  );
}
