import React from 'react';
import { hasFlag } from 'country-flag-icons';

const FlagIcon = ({ countryCode, size = 'medium' }) => {

    const flagAvailable = hasFlag(countryCode);


    if (flagAvailable) {
        return (
            <img
                src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${countryCode}.svg`}
                alt={`Flag of ${countryCode}`}
                style={{ 
                    width: size === 'small' ? '20px' : size === 'medium' ? '40px' : '60px',
                    height: 'auto',
                    borderRadius: '2px',
                    objectFit: 'cover'
                }}
            />
        );
    } else {
        return null;
    }
};

export default FlagIcon;
