import React, { useState, useEffect, useRef } from 'react';
import './StickyNavbar.css';
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from '../../redux/feature/authSlice';
import { logoutUser } from '../../api/api';
import { emptycartIteam } from '../../redux/feature/cartSlice';
import { FaBars, FaTimes, FaShoppingCart, FaUser } from 'react-icons/fa';


const StickyNavbar = () => {
    const [isSticky, setSticky] = useState(false);
    const [isMenuOpen, setMenuOpen] = useState(false);
    const { cart } = useSelector((state) => state.allCart);
    const { user } = useSelector((state) => state.auth); // Get user from Redux store
    const dispatch = useDispatch();
    const navigate = useNavigate();
    useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY;
            if (offset > 100) {
                setSticky(true);
            } else {
                setSticky(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);


    const handleLogout = async () => {
        try {
            await logoutUser();
            // Pass dispatch to the logout action to clear cart
            dispatch(logout({ dispatch }));
            // Clear cart from Redux state
            dispatch(emptycartIteam());
            setMenuOpen(false);
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            // Still proceed with client-side logout even if server logout fails
            dispatch(logout({ dispatch }));
            dispatch(emptycartIteam());
            setMenuOpen(false);
            navigate('/login');
        }
    };

    const handleNavClick = () => {
        setMenuOpen(!isMenuOpen);
    };

    // Toggle mobile menu
    const toggleMenu = () => {
        setMenuOpen(!isMenuOpen);
    };

    // Close mobile menu when clicking outside
    const menuRef = useRef();
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <nav className={`navbar ${isSticky ? 'sticky' : ''}`} ref={menuRef}>
            <div className="navbar-container">
                <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
                    Bloomora
                </Link>

                {/* Desktop Navigation */}
                <div className="desktop-menu">
                    {user ? (
                        <div className="nav-items">
                            <NavLink to="/profile" className="nav-links">
                                <FaUser className="nav-icon" />
                                <span className="nav-text">{user.name}</span>
                            </NavLink>
                            <NavLink to="/cart" className="nav-links">
                                <FaShoppingCart className="nav-icon" />
                                <span className="nav-text">Cart ({cart.length})</span>
                            </NavLink>
                            <button className="nav-links" onClick={handleLogout}>
                                <span className="nav-text">Logout</span>
                            </button>
                        </div>
                    ) : (
                        <div className="nav-items">
                            <NavLink to="/login" className="nav-links">
                                <span className="nav-text">Login</span>
                            </NavLink>
                            <NavLink to="/register" className="nav-links">
                                <span className="nav-text">Register</span>
                            </NavLink>
                        </div>
                    )}
                </div>

                {/* Mobile menu button */}
                <div className="menu-icon" onClick={toggleMenu}>
                    {isMenuOpen ? <FaTimes /> : <FaBars />}
                </div>

                {/* Mobile Navigation */}
                <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
                    {user ? (
                        <>
                            <li className="nav-item">
                                <NavLink to="/profile" className="nav-links" onClick={handleNavClick}>
                                    <FaUser className="nav-icon" />
                                    <span className="nav-text">{user.name}</span>
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink to="/cart" className="nav-links" onClick={handleNavClick}>
                                    <FaShoppingCart className="nav-icon" />
                                    <span className="nav-text">Cart ({cart.length})</span>
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <button className="nav-links" onClick={handleLogout}>
                                    <span className="nav-text">Logout</span>
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li className="nav-item">
                                <NavLink to="/login" className="nav-links" onClick={handleNavClick}>
                                    <span className="nav-text">Login</span>
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink to="/register" className="nav-links" onClick={handleNavClick}>
                                    <span className="nav-text">Register</span>
                                </NavLink>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default StickyNavbar;
