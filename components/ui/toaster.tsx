'use client';

import { Toaster as ChakraToaster, createToaster } from '@chakra-ui/react';

export const toaster = createToaster({
    placement: 'bottom',
    pauseOnPageIdle: true,
});

const TYPE_COLORS: Record<string, string> = {
    success: '#22c55e',
    error:   '#ef4444',
    warning: '#f59e0b',
    info:    '#5672ea',
};

export function Toaster() {
    return (
        <ChakraToaster toaster={toaster}>
            {(toast) => {
                const color = TYPE_COLORS[toast.type ?? 'info'] ?? '#5672ea';
                return (
                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        minWidth: '260px',
                        maxWidth: '360px',
                        background: 'rgba(14,14,22,0.92)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        backdropFilter: 'blur(16px)',
                        borderLeft: `3px solid ${color}`,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    }}>
                        <div style={{
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            background: color,
                            flexShrink: 0,
                            marginTop: 5,
                            boxShadow: `0 0 8px ${color}60`,
                        }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#f1f1f5', lineHeight: 1.4 }}>
                                {toast.title as string}
                            </span>
                            {toast.description && (
                                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
                                    {toast.description as string}
                                </span>
                            )}
                        </div>
                    </div>
                );
            }}
        </ChakraToaster>
    );
}
