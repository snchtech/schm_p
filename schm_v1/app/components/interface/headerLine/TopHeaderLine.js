// import "./navbar.css";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TopNavBar = () => {
    const pathname = usePathname();
    const isActive = (path) => pathname === path;

    const navBarStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#333',
        padding: '10px 20px',
    };

    const menuStyle = {
        display: 'flex',
        gap: '20px',
    };

    const linkStyle = {
        textDecoration: 'none',
    };

    const menuItemStyle = {
        fontSize: '16px',
        fontWeight: 'bold',
        padding: '10px',
        borderRadius: '5px',
        cursor: 'pointer',
    };

    return (
        <div style={navBarStyle}>
            <div style={menuStyle}>
                <Link className="navLink" style={linkStyle} href="/" passHref>
                    <span style={{ ...menuItemStyle, color: isActive('/') ? '#00aaff' : '#fff' }}>Main</span>
                </Link>
                <Link className="navLink" style={linkStyle} href="/schemes" passHref>
                    <span style={{ ...menuItemStyle, color: isActive('/schemes') ? '#00aaff' : '#fff' }}>Scheme Catalog</span>
                </Link>
                <Link className="navLink" style={linkStyle} href="/editor" passHref>
                    <span style={{ ...menuItemStyle, color: isActive('/editor') ? '#00aaff' : '#fff' }}>Editor</span>
                </Link>
                <Link className="navLink" style={linkStyle} href="/create-scheme" passHref>
                    <span style={{ ...menuItemStyle, color: isActive('/create-scheme') ? '#00aaff' : '#fff' }}>Add New</span>
                </Link>
            </div>
        </div>
    );
};

export default TopNavBar;
