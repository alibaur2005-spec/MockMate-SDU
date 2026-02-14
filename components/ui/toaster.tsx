'use client';

import { Toaster as ChakraToaster, createToaster } from '@chakra-ui/react';

export const toaster = createToaster({
    placement: 'top',
    pauseOnPageIdle: true,
});

export function Toaster() {
    return <ChakraToaster toaster={toaster}>{(toast) => <>{toast.title}</>}</ChakraToaster>;
}
