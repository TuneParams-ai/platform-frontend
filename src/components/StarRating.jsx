// src/components/StarRating.jsx
// Component for displaying star ratings
import React from 'react';
import '../styles/components.css';

const StarRating = ({
    rating,
    maxRating = 5,
    showNumeric = true,
    reviewCount = 0,
    showReviewCount = true,
    size = 'medium',
    readonly = true
}) => {
    // Ensure rating is a valid number
    const numericRating = parseFloat(rating) || 0;
    const hasValidRating = numericRating > 0;

    // Generate stars array
    const stars = [];
    for (let i = 1; i <= maxRating; i++) {
        const isFilled = i <= Math.floor(numericRating);
        const isHalf = i === Math.ceil(numericRating) && numericRating % 1 !== 0;

        stars.push(
            <span
                key={i}
                className={`star ${isFilled ? 'filled' : ''} ${isHalf ? 'half' : ''} ${size}`}
            >
                {isFilled ? '★' : isHalf ? '⭐' : '☆'}
            </span>
        );
    }

    if (!hasValidRating) {
        return (
            <div className="star-rating no-rating">
                <span className="no-rating-text">No ratings yet</span>
            </div>
        );
    }

    return (
        <div className={`star-rating ${size} ${readonly ? 'readonly' : ''}`}>
            <div className="stars-container">
                {stars}
            </div>
            {showNumeric && (
                <span className="rating-numeric">
                    {numericRating.toFixed(1)}
                </span>
            )}
            {showReviewCount && reviewCount > 0 && (
                <span className="review-count">
                    ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
                </span>
            )}
        </div>
    );
};

export default StarRating;
