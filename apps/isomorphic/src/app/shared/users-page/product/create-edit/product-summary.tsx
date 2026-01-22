'use client';

import { Controller, useFormContext } from 'react-hook-form';
import { Input } from 'rizzui';
import cn from '@core/utils/class-names';
import FormGroup from '@/app/shared/form-group';

interface UserSummaryProps {
  className?: string;
}

export default function UserSummary({ className }: UserSummaryProps) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();

  const roleOptions = [
    { value: 'Sistem Administrator', label: 'Sistem Administrator' },
    { value: 'CASHIER', label: 'Cashier' },
    { value: 'BUSINESS_OWNER', label: 'Business Owner' },
    { value: 'SUPERVISOR', label: 'Supervisor' },
  ];

  return (
    <FormGroup
      title="User Information"
      description=""
      className={cn(className)}
    >
      {/* Email */}
      <Input
        label="Email"
        type="email"
        placeholder="example@mail.com"
        {...register('email')}
        error={errors.email?.message as string}
      />

      {/* Password */}
      <Input
        label="Password"
        placeholder="Enter password"
        {...register('password')}
        error={errors.password?.message as string}
      />

      {/* Role (Custom Select) */}
      <Controller
        name="role"
        control={control}
        render={({ field: { onChange, value } }) => (
          <div className="flex flex-col">
            <label className="font-medium text-gray-700 dark:text-gray-300 mb-1">
              Role
            </label>
            <select
              className={cn(
                'border rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800',
                'focus:outline-none focus:ring-2 focus:ring-primary',
                errors.role ? 'border-red-500' : 'border-gray-300'
              )}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
            >
              <option value="">Select role...</option>
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.role && (
              <p className="text-red-500 text-xs mt-1">
                {errors.role.message as string}
              </p>
            )}
          </div>
        )}
      />
    </FormGroup>
  );
}
