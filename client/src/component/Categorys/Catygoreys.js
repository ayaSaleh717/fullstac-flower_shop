import React, { useState, useEffect } from 'react';
import "./Categoryes.css"
import { getCategories } from '../../api/api';

const Categorys = ({ selectedCategory, onSelectCategory }) => {

    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories();
                // console.log(data);
                setCategories(data);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
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
            {categories.map((category) => (
                <button
                  className={`btn-cat ${selectedCategory === category._id ? 'active' : ''}`}
                  key={category._id}
                  onClick={() => onSelectCategory(category._id)}
                >
                  {category.name}
                </button>
            ))}
        </div>
    );
};

export default Categorys;
