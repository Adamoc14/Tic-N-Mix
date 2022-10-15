// Imports and Package Declarations
import Link from 'next/link';

// Header Component 
const Header = ({currentUser}) => {

    // Variables for component
    const links = [
       !currentUser && { label: 'Sign Up' , href: '/auth/signup' },
       !currentUser && { label: 'Sign In' , href: '/auth/signin' },
       currentUser && { label: 'Sell Tickets' , href: '/tickets/new' },
       currentUser && { label: 'My Orders' , href: '/orders' },
       currentUser && { label: 'Sign Out' , href: '/auth/signout' },
    ].filter(linkTruthy => linkTruthy)
    .map(({ label , href }) => {
        return (
            <li className='nav-item' key={href}>
                <Link href={href}>
                    <a className="nav-link">{ label }</a>
                </Link>
            </li>
        );
    })

    return (
        <nav className="navbar navbar-light bg-light">
            <Link href="/">
                <a className="navbar-brand">
                    GitTix
                </a>
            </Link>

            <div className="d-flex justify-content-end">
                <ul className="nav d-flex align-items-center">
                    { links }
                </ul>
            </div>
        </nav>
    );
}

// Export Header
export default Header

