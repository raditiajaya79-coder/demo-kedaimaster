'use client';

import WidgetCard from '@core/components/cards/widget-card';
import { CustomTooltip } from '@core/components/charts/custom-tooltip';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import DropdownAction from '@core/components/charts/dropdown-action';
import TrendingUpIcon from '@core/components/icons/trending-up';
import cn from '@core/utils/class-names';
import { formatNumber } from '@core/utils/format-number';
import { useTheme } from '@core/utils/next-themes';
import { Title } from 'rizzui';

interface IncomeData {
  date: string;
  income: number;
}

interface TotalAppointmentProps {
  className?: string;
  currentWeekIncome: IncomeData[];
  previousWeekIncome: IncomeData[];
}

// 📅 Helper: generate 7 hari (Senin–Minggu) dari tanggal yang diberikan
const getWeekDates = (baseDate: Date): string[] => {
  const currentDay = baseDate.getDay(); // Minggu = 0, Senin = 1
  const weekStart = new Date(baseDate);
  weekStart.setDate(baseDate.getDate() - ((currentDay + 6) % 7)); // Set ke Senin

  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    weekDates.push(date.toISOString().split('T')[0]);
  }
  return weekDates;
};

// 🧩 Isi array sampai 7 hari
const fillToSevenDays = (arr: number[], defaultValue: number = 0): number[] => {
  const filled: number[] = [];
  for (let i = 0; i < 7; i++) {
    filled.push(arr[i] ?? defaultValue);
  }
  return filled;
};

const appointmentLegend = [{ name: 'Minggu Lalu' }, { name: 'Minggu Ini' }];

interface ColorMap {
  dark: string;
  light: string;
  [key: string]: string;
}

const COLORS: ColorMap[] = [
  { dark: '#2B7F75', light: '#2B7F75' },
  { dark: '#FFD66B', light: '#FFD66B' },
];

export default function TotalAppointment({
  className,
  currentWeekIncome: initialCurrentWeekIncome,
  previousWeekIncome: initialPreviousWeekIncome,
}: TotalAppointmentProps) {
  const { theme } = useTheme();

  console.log(initialCurrentWeekIncome)
  console.log(initialPreviousWeekIncome)

  // Ambil minggu berjalan (7 hari, dari Senin ke Minggu)
  const currentWeekDates = getWeekDates(new Date());

  // Ambil minggu lalu
  const previousWeekDate = new Date();
  previousWeekDate.setDate(previousWeekDate.getDate() - 7);
  const previousWeekDates = getWeekDates(previousWeekDate);

  // Map income ke tanggal (biar cocok urutan harinya)
  const mapIncomeToWeek = (data: IncomeData[], dates: string[]): number[] => {
    const dateMap: Record<string, number> = {};
    data.forEach((item) => {
      const key = item.date.split('T')[0];
      dateMap[key] = item.income;
    });

    return dates.map((d) => dateMap[d] ?? 0);
  };

  const currentWeekIncome = fillToSevenDays(mapIncomeToWeek(initialCurrentWeekIncome, currentWeekDates));
  const previousWeekIncome = fillToSevenDays(mapIncomeToWeek(initialPreviousWeekIncome, previousWeekDates));

  // Gabungkan data untuk chart
  const processedData = currentWeekIncome.map((current, index) => {
    const previous = previousWeekIncome[index];
    const dayName = new Date(currentWeekDates[index]).toLocaleDateString('id-ID', {
      weekday: 'long',
    });
    const minHeight = 0; // biar kelihatan kalau 0
    return {
      label: dayName,
      MingguLalu: previous || minHeight,
      MingguIni: current || minHeight,
    };
  });

  const totalCurrentWeekIncome = currentWeekIncome.reduce((sum, item) => sum + item, 0);
  const totalPreviousWeekIncome = previousWeekIncome.reduce((sum, item) => sum + item, 0);

  const incomeGrowth =
    totalPreviousWeekIncome === 0
      ? totalCurrentWeekIncome > 0
        ? 100
        : 0
      : ((totalCurrentWeekIncome - totalPreviousWeekIncome) / totalPreviousWeekIncome) * 100;

  return (
    <WidgetCard
      title="Income"
      titleClassName="text-gray-700 font-normal sm:text-sm font-inter"
      headerClassName="items-center"
      action={
        <div className="flex items-center gap-5">
          <CustomLegend className="hidden @[28rem]:mt-0 @[28rem]:inline-flex" />
        </div>
      }
      className={cn('min-h-[20rem] @container', className)}
    >
      <div className="mb-4 mt-1 flex items-center gap-2">
        <Title as="h2" className="font-inter font-bold">
          {formatNumber(totalCurrentWeekIncome)}
        </Title>
        <span
          className={`flex items-center gap-1 ${incomeGrowth >= 0 ? 'text-green-dark' : 'text-red-dark'
            }`}
        >
          {incomeGrowth >= 0 ? (
            <TrendingUpIcon className="h-auto w-5" />
          ) : (
            <TrendingUpIcon className="h-auto w-5 rotate-180" />
          )}
          <span className="font-semibold leading-none"> {incomeGrowth.toFixed(2)}%</span>
        </span>
      </div>

      <CustomLegend className="mb-4 mt-0 inline-flex @[28rem]:hidden" />

      <div className="custom-scrollbar -mb-3 overflow-x-auto pb-3">
        <div className="h-[18rem] w-full pt-1">
          <ResponsiveContainer width="100%" height="100%" minWidth={800}>
            <ComposedChart
              barGap={8}
              data={processedData}
              margin={{ left: -15, top: 20 }}
              className="[&_.recharts-tooltip-cursor]:fill-opacity-20 dark:[&_.recharts-tooltip-cursor]:fill-opacity-10 [&_.recharts-cartesian-axis-tick-value]:fill-gray-500 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12 [&_.recharts-xAxis.xAxis]:translate-y-2.5 [&_path.recharts-rectangle]:!stroke-none"
            >
              <CartesianGrid vertical={false} strokeOpacity={0.435} strokeDasharray="8 10" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(label) => formatNumber(label)}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />

              <Bar
                dataKey="MingguLalu"
                {...(theme && {
                  fill: COLORS[0][theme],
                  stroke: COLORS[0][theme],
                })}
                barSize={40}
                radius={10}
                minPointSize={30}
              >
                <LabelList dataKey="MingguLalu" content={<CustomizedLabel />} />
              </Bar>

              <Bar
                dataKey="MingguIni"
                {...(theme && {
                  fill: COLORS[1][theme],
                  stroke: COLORS[1][theme],
                })}
                barSize={40}
                radius={10}
                minPointSize={30}
              >
                <LabelList dataKey="MingguIni" content={<CustomizedLabel />} />
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </WidgetCard>
  );
}

function CustomLegend({ className }: { className?: string }) {
  const { theme } = useTheme();
  return (
    <div className={cn('mt-2 flex flex-wrap items-start gap-3 lg:gap-5', className)}>
      {appointmentLegend.map((item, index) => (
        <div key={item.name} className="flex items-center gap-1.5">
          <span
            className="-mt-0.5 h-3 w-3 rounded-full"
            {...(theme && {
              style: {
                backgroundColor: COLORS[index][theme],
              },
            })}
          />
          <span>{item.name}</span>
        </div>
      ))}
    </div>
  );
}

function CustomizedLabel(props: any) {
  const { x, y, width, value } = props;
  const radius = 8;

  return (
    <g>
      <rect
        x={x + 3}
        y={y + 3}
        width={width - 6}
        height={20}
        rx={radius}
        fill="#ffffff"
      />
      <text
        x={x + width / 2}
        y={y + 14}
        fill="currentColor"
        className="text-xs font-medium text-gray-800 dark:text-gray-200"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {formatNumber(value)}
      </text>
    </g>
  );
}
