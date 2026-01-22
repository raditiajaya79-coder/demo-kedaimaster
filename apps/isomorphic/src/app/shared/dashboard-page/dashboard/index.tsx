import { useEffect, useState } from 'react';
import {
  handleDashboardData,
  handleDashboardAggregate,
  getTransactionGraph,
  getDateRanges,
} from '@/kedaimaster-api-handlers/dashboardApiHandlers';
import transactionsApiHandlers from '@/kedaimaster-api-handlers/transactionsApiHandlers';
import { fetchMaterialMutationHistory } from '@/kedaimaster-api-handlers/materialApiHandlers';
import AppointmentStats from '@/app/shared/dashboard-page/dashboard/appointment-stats';
import AppointmentDiseases from '@/app/shared/dashboard-page/dashboard/appointment-diseases';
import Department from '@/app/shared/dashboard-page/dashboard/department';
import TotalAppointment from '@/app/shared/dashboard-page/dashboard/total-appointment';
import Patients from '@/app/shared/dashboard-page/dashboard/patients';
import PatientAppointment from '@/app/shared/dashboard-page/dashboard/patient-appointment';
import AppointmentTodo from '@/app/shared/dashboard-page/dashboard/appointment-todo';
import TransactionsHistory from '@/app/shared/dashboard-page/dashboard/transactions-history';

// =======================
// 🧩 Type Definitions
// =======================

interface DateRange {
  start: Date | null;
  end: Date | null;
  type: string;
  compareLabel: string;
}

interface DashboardData {
  [key: string]: any;
}

interface DashboardAggregate {
  [key: string]: any;
}

interface TransactionsData {
  [key: string]: any;
}
// =======================
// 🧠 Component
// =======================

export default function AppointmentDashboard({ dateRange }: { dateRange: DateRange }) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [transactionsData, setTransactionsData] = useState<TransactionsData | null>(null);
  const [dashboardAggregate, setDashboardAggregate] = useState<DashboardAggregate[]>([]);
  const [transactionGraph, setTransactionGraph] = useState<any>(null);
  const [materialMutations, setMaterialMutations] = useState<any[]>([]);
  // Fetch dashboard data
  const fetchDashboardData = async (start: Date, end: Date, type: string) => {
    const startStr = `${start.getFullYear()}-${(start.getMonth() + 1).toString().padStart(2, '0')}-${start.getDate().toString().padStart(2, '0')}`;
    const endStr = `${end.getFullYear()}-${(end.getMonth() + 1).toString().padStart(2, '0')}-${end.getDate().toString().padStart(2, '0')}`;

    console.log(startStr, endStr)
    const data = await handleDashboardData(startStr, endStr, type);
    if (data) setDashboardData(data); // langsung set semua data


    const dataa = await transactionsApiHandlers.getByDateRange(startStr, endStr);
    if (dataa) setTransactionsData(dataa);

  };


  // Fetch transaction graph
  const fetchTransactionGraph = async (start: Date, end: Date, type?: string) => {
    const startStr = start.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);
    const data = await getTransactionGraph(startStr, endStr, type as any);
    setTransactionGraph(data);
  };



  const fetchMaterialMutations = async () => {
    const data = await fetchMaterialMutationHistory();
    setMaterialMutations(data);
  };

  // Fetch all data when dateRange changes
  useEffect(() => {
    if (dateRange.start && dateRange.end) {
      fetchDashboardData(dateRange.start, dateRange.end, dateRange.type);
      fetchTransactionGraph(dateRange.start, dateRange.end, dateRange.type);
      fetchMaterialMutations();
    }
  }, [dateRange.start, dateRange.end, dateRange.type]);

  return (
    <div className="grid grid-cols-12 gap-6 @container @[59rem]:gap-7 3xl:gap-8">{/* Statistik utama */}
      <AppointmentStats
        className="col-span-full order-1 @[59rem]:order-1 @[90rem]:order-1"
        dashboardData={dashboardData}
        compareType={dateRange.compareLabel}
      />

      {/* Total Appointment */}
      <TotalAppointment
        className="col-span-full order-2 @[59rem]:col-span-12 @[59rem]:order-2 @[90rem]:col-span-8 @[90rem]:order-2"
        currentWeekIncome={dashboardData?.currentWeekIncome ?? []}
        previousWeekIncome={dashboardData?.previousWeekIncome ?? []}
      />

      {/* Patients — DIPINDAHKAN ke sini */}
      <Patients
        className="col-span-full order-3 @[59rem]:col-span-6 @[59rem]:order-3 @[90rem]:col-span-4 @[90rem]:order-3"
        dashboardData={dashboardData}
      />

      {/* Daftar todo dan transaksi */}
      <TransactionsHistory
        className="col-span-full order-4 @[59rem]:col-span-6 @[59rem]:order-4 @[90rem]:col-span-4 @[90rem]:order-4"
        stockInList={transactionsData ?? []}
      />

      <AppointmentTodo
        className="col-span-full order-5 @[59rem]:col-span-6 @[59rem]:order-5 @[90rem]:col-span-4 @[90rem]:order-5"
        stockInList={dashboardData?.stockInList ?? []}
      />

      {/* Appointment Diseases */}
      <AppointmentDiseases
        className="col-span-full order-6 @[59rem]:col-span-6 @[59rem]:order-3 @[90rem]:col-span-4 @[90rem]:order-3"
        cashierInitiatedTransaction={dashboardData?.cashierInitiatedTransaction}
        customerInitiatedTransaction={dashboardData?.customerInitiatedTransaction}
      />

    </div>
  );
}
