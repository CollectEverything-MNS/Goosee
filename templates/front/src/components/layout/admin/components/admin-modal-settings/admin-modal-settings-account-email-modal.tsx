'use client';

import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type EmailFormValues = {
  email: string;
  otp: string[];
  newEmail: string;
};

export function AdminModalSettingsAccountChangeEmailModal({ open, onOpenChange }: Props) {
  const t = useTranslations('admin.settings.account');
  const [step, setStep] = useState<'currentEmail' | 'otp' | 'newEmail' | 'success'>('currentEmail');
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<EmailFormValues>({
    defaultValues: { otp: ['', '', '', '', '', ''] }
  });

  const otp = watch('otp');
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const handleCurrentEmailSubmit = (data: EmailFormValues) => {
    console.log('Email actuel saisi:', data.email);
    setStep('otp');
  };

  const handleOtpSubmit = (data: EmailFormValues) => {
    console.log('OTP saisi:', data.otp.join(''));
    setStep('newEmail');
  };

  const handleNewEmailSubmit = (data: EmailFormValues) => {
    console.log('Nouvel email saisi:', data.newEmail);
    setStep('success');
  };

  const onClose = () => {
    setStep('currentEmail');
    onOpenChange(false);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {step === 'currentEmail' && t('enterCurrentEmail')}
            {step === 'otp' && t('verifyOtp')}
            {step === 'newEmail' && t('enterNewEmail')}
            {step === 'success' && t('emailUpdateSuccess')}
          </DialogTitle>
          <DialogDescription>
            {step === 'currentEmail' && t('currentEmailInstructions')}
            {step === 'otp' && t('otpInstructions')}
            {step === 'newEmail' && t('newEmailInstructions')}
          </DialogDescription>
        </DialogHeader>

        {step === 'currentEmail' && (
          <form onSubmit={handleSubmit(handleCurrentEmailSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="account-current-email">{t('currentEmail')}</Label>
              <Input
                id="account-current-email"
                type="email"
                {...register('email', { required: t('required') })}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <DialogFooter>
              <Button type="submit">{t('next')}</Button>
            </DialogFooter>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleSubmit(handleOtpSubmit)} className="space-y-4">
            <Label>{t('otp')}</Label>
            <div className="flex gap-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <Controller
                  key={index}
                  name={`otp.${index}` as const}
                  control={control}
                  rules={{ required: true, pattern: /^[0-9]$/ }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      aria-label={`${t('otp')} ${index + 1}/6`}
                      maxLength={1}
                      className="w-10 text-center border-primary"
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        handleOtpChange(index, e.target.value);
                      }}
                    />
                  )}
                />
              ))}
            </div>
            {errors.otp && <p className="text-xs text-red-500">{t('required')}</p>}
            <DialogFooter>
              <Button type="submit">{t('verify')}</Button>
            </DialogFooter>
          </form>
        )}

        {step === 'newEmail' && (
          <form onSubmit={handleSubmit(handleNewEmailSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="account-new-email">{t('newEmail')}</Label>
              <Input
                id="account-new-email"
                type="email"
                {...register('newEmail', { required: t('required') })}
              />
              {errors.newEmail && <p className="text-xs text-red-500">{errors.newEmail.message}</p>}
            </div>
            <DialogFooter>
              <Button type="submit">{t('save')}</Button>
            </DialogFooter>
          </form>
        )}

        {step === 'success' && (
          <div className="space-y-4">
            <DialogFooter>
              <Button onClick={onClose}>{t('close')}</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
