import React, { useState, useEffect } from 'react';
import "./Categoryes.css"
import { getCategories } from '../../api/api';

const Categorys = ({ selectedCategory, onSelectCategory }) => {

    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getCategories();
                console.log('Categories response:', response);
                
                // The API returns an array of categories directly
                if (Array.isArray(response)) {
                    setCategories(response);
                } else {
                    console.warn('Unexpected categories data format:', response);
                    setCategories([]);
                }
            } catch (error) {
                console.error('Failed to fetch categories:', error);
                setCategories([]);
            }
        };

        fetchCategories();
    }, []);

    return (
        <div className="category-container">
            <button
              className={`btn-cat ${selectedCategory === null ? 'active' : ''}`}
              onClick={() => onSelectCategory(null)}
            >
              All
            </button>
            {categories.map((category) => {
                console.log('Category object:', category); // Debug log
                return (
                    <button
                        className={`btn-cat ${selectedCategory === category._id ? 'active' : ''}`}
                        key={category._id}
                        onClick={() => onSelectCategory(category._id)}
                    >
                        {category.catName || category.name || 'Unnamed Category'}
                    </button>
                );
            })}
        </div>
    );
};

export default Categorys;
