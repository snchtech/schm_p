'use client';
import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Transformer } from 'react-konva';
import ToolPanel from '../interface/ToolPanel';
import { v4 as uuidv4 } from 'uuid';
import Select from 'react-select';
import TopNavBar from '../interface/headerLine/TopHeaderLine';
import GraphLibrary from '../../components/graph';

// Page formats in mm (converted to pixels at 72 DPI)
const pageFormats = {
    A4: { width: 1123, height: 794 },
    A3: { width: 1587, height: 1123 },
    A2: { width: 2245, height: 1587 },
    A1: { width: 3179, height: 2245 },
    AO: { width: 4494, height: 3179 },
};

// List of departments (can be fetched dynamically if needed)
const departmentOptions = ['ТЦ', 'РЦ'];

const Editor = () => {
    const stageRef = useRef(null);
    const transformerRef = useRef(null);
    const [referencePoint, setReferencePoint] = useState(null);
    const [elements, setElements] = useState([]);
    const [selectedScheme, setSelectedScheme] = useState(null);
    const [selectedElId, setSelectedElId] = useState(null);
    const [selectedFormat, setSelectedFormat] = useState('A4');
    const [isUpdated, setIsUpdated] = useState(false);
    const [schemeName, setSchemeName] = useState('');
    const [schemeDepartment, setSchemeDepartment] = useState('');
    const [canvasSize, setCanvasSize] = useState(pageFormats.A4);
    const [options, setOptions] = useState([]);

    // Update canvas size when format changes
    useEffect(() => {
        setCanvasSize(pageFormats[selectedFormat]);
    }, [selectedFormat]);

    const handleFormatChange = (format) => {
        setSelectedFormat(format);
    };

    // Handle element selection
    const handleSelectElement = (el) => {
        setSelectedElId(el.id);
        setReferencePoint({
            x: el.x + el.width / 2,
            y: el.y + el.height / 2,
        });
    };

    // Handle element deletion
    const deleteElement = () => {
        if (selectedElId === null) {
            alert('No element selected to delete.');
            return;
        }
        const updatedElements = elements.filter((el) => el.id !== selectedElId);
        setElements(updatedElements);
        setSelectedElId(null);
    };

    const fetchSchemes = async () => {
        try {
            const response = await fetch('/api/schemeslist');
            const data = await response.json();
            if (data.success) {
                const transformedOptions = data.data.map((scheme) => ({
                    value: scheme.scheme_id,
                    label: scheme.scheme_name,
                    scheme_format: scheme.scheme_format,
                    data: scheme.scheme_data,
                    department: scheme.department,
                }));
                setOptions(transformedOptions);
            } else {
                console.error('Failed to fetch schemes:', data.error);
            }
        } catch (error) {
            console.error('Error fetching schemes:', error);
        }
    };

    // Fetch schemes data from API
    useEffect(() => {
        fetchSchemes();
    }, []);

    // Handle scheme selection
    const handleSelectSchemeChange = (selectedOption) => {
        setSelectedScheme(selectedOption);
        setElements(selectedOption.data || []);
        setSchemeName(selectedOption.label || '');
        setSchemeDepartment(selectedOption.department || '');
    };

    // Add a new element
    const addElement = (type) => {
        const newElement = {
            id: uuidv4(),
            type,
            x: Math.random() * 300,
            y: Math.random() * 300,
            width: 100,
            height: 100,
            radius: 50,
            text: 'Text',
            points: [0, 0, 100, 100],
            fill: 'gray',
            draggable: true,
            rotation: 0,
        };

        setIsUpdated(true);
        setElements((prevElements) => [...prevElements, newElement]);
    };

    // Handle element drag
    const handleDragEnd = (id, e) => {
        setElements((prevElements) =>
            prevElements.map((el) =>
                el.id === id ? { ...el, x: e.target.x(), y: e.target.y() } : el
            )
        );

        setIsUpdated(true);
    };

    // Handle element rotation
    const handleRotate = (id, angle) => {
        setElements((prevElements) =>
            prevElements.map((el) =>
                el.id === id
                    ? { ...el, rotation: (el.rotation + angle) % 360 }
                    : el
            )
        );
        setIsUpdated(true);
    };

    // Clear selection when clicking outside
    const handleStageClick = (e) => {
        if (e.target === e.target.getStage()) {
            setSelectedElId(null);
        }
    };

    // Handle Preview for Print
    const handlePrintPreview = () => {
        if (!stageRef.current) return;

        const printWindow = window.open('', '_blank');
        const dataUrl = stageRef.current.toDataURL();

        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Preview - ${selectedFormat}</title>
                    <style>
                        body { margin: 0; }
                    </style>
                </head>
                <body>
                    <img src="${dataUrl}" width="${canvasSize.width}" height="${canvasSize.height}" />
                </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();
    };

    // Handle scheme update
    const handleUpdateScheme = async () => {
        if (!selectedScheme) return;

        const updatedScheme = {
            scheme_id: selectedScheme.value,
            scheme_name: schemeName,
            department: schemeDepartment,
            scheme_format: selectedFormat,
            scheme_data: elements,
        };

        try {
            const response = await fetch(
                `/api/updatescheme/${selectedScheme.value}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedScheme),
                }
            );

            if (response.ok) {
                alert('Scheme updated successfully!');
                fetchSchemes();
                setIsUpdated(false);
            } else {
                alert('Failed to update scheme.');
            }
        } catch (error) {
            console.error('Error updating scheme:', error);
        }
    };

    return (
        <div>
            <TopNavBar />
            <ToolPanel addElement={addElement} />
            {/* Other UI components */}
        </div>
    );
};

export default Editor;