'use client';

import dynamic from 'next/dynamic';

// Dynamically import the Editor component with client-side rendering only
const Editor = dynamic(() => import('../../app/components/pagesComponent/Editor'), {
    ssr: false, // Disable server-side rendering
});

export default function Index() {
    return <Editor />;
}
