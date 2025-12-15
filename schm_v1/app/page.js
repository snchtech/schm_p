'use client';
import Link from 'next/link';
import { FaFolderOpen, FaEdit, FaPlusSquare } from 'react-icons/fa';
import TopNavBar from './components/interface/headerLine/TopHeaderLine';

const buttonStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '150px',
    height: '150px',
    border: '2px solid #ccc',
    borderRadius: '10px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    transition: '0.3s',
};

const handleHover = (e, isHovering) => {
    e.currentTarget.style.backgroundColor = isHovering ? '#e6e6e6' : '#fff';
};

const MainAppPage = () => {
    return (
        <div>
            <TopNavBar />
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    backgroundColor: '#f5f5f5',
                }}
            >
                <h1 style={{ marginBottom: '30px', color: '#333' }}>
                    Welcome to the Scheme App
                </h1>
                <div style={{ display: 'flex', gap: '20px' }}>
                    {/* Scheme Catalog Button */}
                    <Link href="/schemes" passHref>
                        <div
                            style={buttonStyle}
                            onMouseEnter={(e) => handleHover(e, true)}
                            onMouseLeave={(e) => handleHover(e, false)}
                        >
                            <FaFolderOpen size={30} style={{ marginBottom: '10px' }} />
                            <span>Scheme Catalog</span>
                        </div>
                    </Link>

                    {/* Scheme Editor Button */}
                    <Link href="/editor" passHref>
                        <div
                            style={buttonStyle}
                            onMouseEnter={(e) => handleHover(e, true)}
                            onMouseLeave={(e) => handleHover(e, false)}
                        >
                            <FaEdit size={30} style={{ marginBottom: '10px' }} />
                            <span>Scheme Editor</span>
                        </div>
                    </Link>

                    {/* Create New Scheme Button */}
                    <Link href="/create-scheme" passHref>
                        <div
                            style={buttonStyle}
                            onMouseEnter={(e) => handleHover(e, true)}
                            onMouseLeave={(e) => handleHover(e, false)}
                        >
                            <FaPlusSquare size={30} style={{ marginBottom: '10px' }} />
                            <span>Create New Scheme</span>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default MainAppPage;