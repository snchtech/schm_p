import Link from 'next/link';
import { useEffect, useState } from 'react';
import TopNavBar from '../../app/components/interface/headerLine/TopHeaderLine';

const SchemesList = () => {
    const [schemes, setSchemes] = useState([]);

    // Fetch the schemes list from the API
    useEffect(() => {
        const fetchSchemes = async () => {
            try {
                const response = await fetch('/api/schemeslist');
                if (!response.ok) {
                    throw new Error('Failed to fetch schemes');
                }
                const data = await response.json();
                setSchemes(data.data || []);
            } catch (error) {
                console.error('Error loading schemes:', error);
            }
        };

        fetchSchemes();
    }, []);

    return (
        <div>
            <TopNavBar />
            <h1>Scheme List</h1>
            {schemes.length > 0 ? (
                <ul>
                    {schemes.map((scheme) => (
                        <li key={scheme.scheme_id}>
                            <Link href={`/schemes/${scheme.scheme_id}`}>
                                {scheme.scheme_name}
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No schemes available.</p>
            )}
        </div>
    );
};

export default SchemesList;