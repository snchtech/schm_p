import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Stage, Layer } from 'react-konva';
import GraphLibrary from '../../app/components/graph';
import TopNavBar from '../../app/components/interface/headerLine/TopHeaderLine';

const SchemePage = () => {
    const router = useRouter();
    const { id: currentSchemeId } = router.query; // Get the scheme ID from the route
    const [scheme, setScheme] = useState(null);
    const [elements, setElements] = useState([]);

    // Fetch the scheme data from the API
    useEffect(() => {
        if (!currentSchemeId) return; // Wait for the ID to be available 

        const fetchScheme = async () => {
            try {
                const response = await fetch(`/api/schemes/${currentSchemeId}`);
                const data = await response.json();
                setScheme(data);
                setElements(data.scheme_data || []); // Load the Konva elements
            } catch (error) {
                console.error('Error loading scheme:', error);
            }
        };

        fetchScheme();
    }, [currentSchemeId]);

    const pageContainerStyle = {
        paddingTop: '60px',
    };

    if (!scheme) return <p>Loading...</p>; // Show a loading state while fetching

    return (
        <div style={pageContainerStyle}>
            <TopNavBar />
            <h3>{scheme.scheme_name}</h3>
            <p>Department: {scheme.department}</p>
            <Stage
                width={window.innerWidth - 200}
                height={window.innerHeight}
                style={{ background: '#fff' }}
            >
                <Layer>
                    {elements.map((el) => {
                        const ElementComponent = GraphLibrary[el.type];
                        if (!ElementComponent) return null; // Skip unknown element types
                        return (
                            <ElementComponent
                                key={el.id}
                                el={el}
                                onDragEnd={null}
                                onClickEl={null}
                            />
                        );
                    })}
                </Layer>
            </Stage>
        </div>
    );
};

export default SchemePage;