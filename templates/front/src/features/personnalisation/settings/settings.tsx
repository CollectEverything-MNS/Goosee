'use client';

import { SettingsForm } from './components/settings-form';
import { VersionFooter } from '@/features/version/version-footer';

export function Settings() {
  return (
    <>
      <SettingsForm />
      <VersionFooter />
    </>
  );
}
