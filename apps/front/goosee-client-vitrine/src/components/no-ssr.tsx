'use client';
import { ReactNode } from 'react';
import dynamic from 'next/dynamic';

const NoSsr = ({ children }: { children: ReactNode }) => <>{children}</>;

export default dynamic(() => Promise.resolve(NoSsr), {
    ssr: false
});