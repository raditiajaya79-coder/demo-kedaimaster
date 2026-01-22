"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "rizzui";
import { PiCalendarBlank, PiCaretDownBold } from "react-icons/pi";
import cn from "../utils/class-names";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// --- Types ---
export type RangeCalculator = () => { start: Date; end: Date };

export interface DateOption {
  label: string;
  value: string;
  compareLabel: string;
  getRange?: RangeCalculator; // jika undefined → dianggap "Kustom"
}

interface SmartDateSelectorProps {
  options: DateOption[];
  onChange: (range: { start: Date | null; end: Date | null; type: string }) => void;
  customPlaceholder?: string;
  className?: string;
  defaultValue?: string; // default selected type
}

// --- Styling constants ---
const calendarContainerClasses = {
  base: "[&.react-datepicker]:shadow-lg [&.react-datepicker]:border-gray-100 [&.react-datepicker]:rounded-md",
  monthContainer: { padding: "[&.react-datepicker>div]:pt-5 [&.react-datepicker>div]:pb-3" },
};

const prevNextButtonClasses = {
  base: "[&.react-datepicker>button]:items-baseline [&.react-datepicker>button]:top-7",
  border: "[&.react-datepicker>button]:border [&.react-datepicker>button]:border-solid [&.react-datepicker>button]:border-gray-300 [&.react-datepicker>button]:rounded-md",
  size: "[&.react-datepicker>button]:h-[22px] [&.react-datepicker>button]:w-[22px]",
  children: {
    position: "[&.react-datepicker>button>span]:top-0",
    border: "[&.react-datepicker>button>span]:before:border-t-[1.5px] [&.react-datepicker>button>span]:before:border-r-[1.5px] [&.react-datepicker>button>span]:before:border-gray-400",
    size: "[&.react-datepicker>button>span]:before:h-[7px] [&.react-datepicker>button>span]:before:w-[7px]",
  },
};

const popperClasses = {
  base: "[&>svg]:!fill-white dark:[&>svg]:!fill-gray-100 [&>svg]:!stroke-gray-300 dark:[&>svg]:!stroke-muted dark:[&>svg]:!text-muted",
};

// --- Component ---
export default function SmartDateSelector({
  options: initialOptions,
  onChange,
  customPlaceholder = "Pilih rentang tanggal",
  className,
  defaultValue = "",
}: SmartDateSelectorProps) {
  const [options, setOptions] = useState<DateOption[]>(initialOptions);
  const [selectedType, setSelectedType] = useState<string>(defaultValue);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(true);

  const [startDate, endDate] = dateRange;

  const prevRange = useRef<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const prevSelected = useRef<string>(defaultValue); // simpan pilihan terakhir valid

  // Trigger otomatis untuk opsi yang punya getRange
  useEffect(() => {
    if (!selectedType) return;
    const selected = options.find((opt) => opt.value === selectedType);
    if (!selected?.getRange) return;

    const { start, end } = selected.getRange();
    setDateRange([start, end]);

    const isSame =
      prevRange.current.start?.getTime() === start.getTime() &&
      prevRange.current.end?.getTime() === end.getTime();

    if (!isSame) {
      onChange({ start, end, type: selected.compareLabel });
      prevRange.current = { start, end };
      prevSelected.current = selected.value; // update prevSelected
    }
  }, [selectedType, options]);

  // Trigger manual untuk mode Kustom
  useEffect(() => {
    console.log(selectedType)
    if (!selectedType) return;
    const selected = options.find((opt) => opt.value === selectedType);
    if (selected?.getRange) return;

    if (selected?.getRange) return;

    if (startDate && endDate) {
      const isSame =
        prevRange.current.start?.getTime() === startDate.getTime() &&
        prevRange.current.end?.getTime() === endDate.getTime();
      if (!isSame) {
        const newLabel = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
        const newValue = `custom-${startDate.getTime()}-${endDate.getTime()}`;

        setOptions((prev) => {
          const hasCustom = prev.some((opt) => opt.value.startsWith("custom-"));
          if (hasCustom) {
            // update opsi custom lama
            return prev.map((opt) =>
              opt.value.startsWith("custom-") ? { ...opt, label: newLabel, value: newValue, compareLabel: "Dibanding sebelumnya" } : opt
            );
          } else {
            // belum ada opsi custom → buat baru
            return [...prev, { label: newLabel, value: newValue, compareLabel: "Dibanding sebelumnya" }];
          }
        });

        setSelectedType(newValue);
        onChange({ start: startDate, end: endDate, type: newValue });

        prevRange.current = { start: startDate, end: endDate };
        prevSelected.current = newValue;
        setIsCalendarOpen(false);
      }

    }
  }, [startDate, endDate, selectedType, options]);

  // Handler klik di luar kalender → reset ke prevSelected
  const handleCalendarClickOutside = () => {
    const prevOption = options.find((opt) => opt.value === prevSelected.current);
    if (!prevOption?.getRange) return; // jika prevSelected kustom, biarkan
    const { start, end } = prevOption.getRange();
    setDateRange([start, end]);
    setSelectedType(prevOption.value);
    onChange({ start, end, type: prevOption.value });
  };

  return (
    <div className={cn("flex items-center gap-3 relative", className)}>
      {/* Dropdown Pilihan */}
      <select
        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none relative z-10 min-w-[188px]"
        value={selectedType}
        onChange={(e) => {
          const val = e.target.value;
          setSelectedType(val);
          const selected = options.find((opt) => opt.value === val);
          if (selected) {
            if (selected.getRange) {
              const { start, end } = selected.getRange();
              onChange({ start, end, type: selected.value });
              setDateRange([start, end]);
              prevRange.current = { start, end };
              prevSelected.current = selected.value;
            } else {
              // kalau Kustom → buka kalender
              setIsCalendarOpen(true);
            }
          }
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>


      {/* Jika kustom → tampilkan date range picker */}
      {(() => {
        const selected = options.find((opt) => opt.value === selectedType);
        if (!selected || selected.getRange) return null;

        return (
          <div className="flex [&_.react-datepicker-wrapper]:flex [&_.react-datepicker-wrapper]:w-full min-w-[144px] min-h-[40px] absolute left-0">
            <ReactDatePicker
              open={isCalendarOpen}
              className="hidden"
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => setDateRange(update as [Date | null, Date | null])}
              onCalendarOpen={() => setIsCalendarOpen(true)}
              onCalendarClose={() => setIsCalendarOpen(false)}
              onClickOutside={handleCalendarClickOutside} // <-- added here
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              monthsShown={1}
              customInput={
                <Input
                  prefix={<PiCalendarBlank className="w-5 h-5 text-gray-500" />}
                  suffix={
                    <PiCaretDownBold
                      className={cn(
                        "h-4 w-4 text-gray-500 transition",
                        isCalendarOpen && "rotate-180"
                      )}
                    />
                  }
                  value={
                    startDate && endDate
                      ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
                      : ""
                  }
                  placeholder={customPlaceholder}
                  readOnly
                />
              }
              calendarClassName={cn(
                calendarContainerClasses.base,
                calendarContainerClasses.monthContainer.padding,
                prevNextButtonClasses.base,
                prevNextButtonClasses.border,
                prevNextButtonClasses.size,
                prevNextButtonClasses.children.position,
                prevNextButtonClasses.children.border,
                prevNextButtonClasses.children.size
              )}
              popperClassName={cn(popperClasses.base, "z-0")}
              showPopperArrow={false}
            />
          </div>
        );
      })()}
    </div>
  );
}
