'use client';

import dynamic from 'next/dynamic';

// Dynamically import the Creator component with client-side rendering only
const Creator = dynamic(() => import('../../app/components/pagesComponent/Creator'), {
    ssr: false, // Disble server-side rendering
});

export default function Index() {
    return <Creator />;
}
