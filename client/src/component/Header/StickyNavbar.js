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
                <div className="desktop-nav">
                    {user ? (
                        <div className="nav-items">
                            <NavLink to="/profile" className="nav-link">
                                <FaUser className="nav-icon" />
                                <span className="nav-text">{user.name}</span>
                            </NavLink>
                            <NavLink to="/cart" className="nav-link">
                                <FaShoppingCart className="nav-icon" />
                                <span className="nav-text">Cart ({cart.length})</span>
                            </NavLink>
                            <button className="nav-link" onClick={handleLogout}>
                                <span className="nav-text">Logout</span>
                            </button>
                        </div>
                    ) : (
                        <div className="nav-items">
                            <NavLink to="/login" className="nav-link">
                                <span className="nav-text">Login</span>
                            </NavLink>
                            <NavLink to="/register" className="nav-link">
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
                <div className={`mobile-nav ${isMenuOpen ? 'active' : ''}`}>
                    {user ? (
                        <div className="mobile-nav-items">
                            <NavLink to="/profile" className="mobile-nav-link" onClick={handleNavClick}>
                                <FaUser className="nav-icon" />
                                <span className="nav-text">{user.name}</span>
                            </NavLink>
                            <NavLink to="/cart" className="mobile-nav-link" onClick={handleNavClick}>
                                <FaShoppingCart className="nav-icon" />
                                <span className="nav-text">Cart ({cart.length})</span>
                            </NavLink>
                            <button className="mobile-nav-link" onClick={handleLogout}>
                                <span className="nav-text">Logout</span>
                            </button>
                        </div>
                    ) : (
                        <div className="mobile-nav-items">
                            <NavLink to="/login" className="mobile-nav-link" onClick={handleNavClick}>
                                <span className="nav-text">Login</span>
                            </NavLink>
                            <NavLink to="/register" className="mobile-nav-link" onClick={handleNavClick}>
                                <span className="nav-text">Register</span>
                            </NavLink>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default StickyNavbar;
