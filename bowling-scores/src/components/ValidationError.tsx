import React from 'react';
import { ValidationError } from '../utils/validation/gameValidationHelper';

interface ValidationErrorProps {
  error: ValidationError | null;
  className?: string;
  onClose?: () => void;
}

/**
 * A component for displaying validation errors to the user
 */
const ValidationErrorComponent: React.FC<ValidationErrorProps> = ({
  error,
  className = '',
  onClose,
}) => {
  if (!error) return null;

  const renderDetails = () => {
    if (!error.details || error.details.length === 0) return null;

    return (
      <ul className='mt-1 list-disc pl-5 text-sm'>
        {error.details.map((detail, index) => (
          <li key={index}>{detail}</li>
        ))}
      </ul>
    );
  };

  const getIconForErrorType = () => {
    switch (error.type) {
      case 'INVALID_PLAYER':
        return '👤';
      case 'INVALID_GAME_SETUP':
        return '🎮';
      case 'INVALID_ROLL':
        return '🎳';
      case 'INVALID_GAME_STATE':
        return '⚠️';
      case 'INVALID_ROLL_SEQUENCE':
        return '📋';
      default:
        return '❌';
    }
  };

  return (
    <div
      className={`bg-red-50 border border-red-200 rounded-md p-3 mb-4 ${className}`}
      role='alert'>
      <div className='flex justify-between items-start'>
        <div className='flex items-start'>
          <span className='text-xl mr-2'>{getIconForErrorType()}</span>
          <div>
            <p className='font-medium text-red-800'>{error.message}</p>
            {renderDetails()}
          </div>
        </div>
        {onClose && (
          <button
            type='button'
            className='text-red-500 hover:text-red-700 focus:outline-none'
            onClick={onClose}
            aria-label='Close'>
            <span className='text-xl'>&times;</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ValidationErrorComponent;
