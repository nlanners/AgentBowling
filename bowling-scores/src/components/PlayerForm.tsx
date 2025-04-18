import React, { useState } from 'react';
import { Player } from '../types/game';
import {
  GameValidationHelper,
  ValidationError,
} from '../utils/validation/gameValidationHelper';
import ValidationErrorComponent from './ValidationError';

interface PlayerFormProps {
  onAddPlayer: (player: Player) => void;
  existingPlayers: Player[];
  maxPlayers?: number;
}

const PlayerForm: React.FC<PlayerFormProps> = ({
  onAddPlayer,
  existingPlayers,
  maxPlayers = 6,
}) => {
  const [playerName, setPlayerName] = useState('');
  const [validationError, setValidationError] =
    useState<ValidationError | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    try {
      // Validate player name
      GameValidationHelper.validatePlayer(playerName);

      // Check for duplicate names
      if (
        existingPlayers.some(
          (p) => p.name.toLowerCase() === playerName.toLowerCase()
        )
      ) {
        throw {
          type: 'INVALID_PLAYER',
          message: 'Player name already exists',
          details: ['Please choose a different name'],
        } as ValidationError;
      }

      // Check max players
      if (existingPlayers.length >= maxPlayers) {
        throw {
          type: 'INVALID_GAME_SETUP',
          message: `Maximum ${maxPlayers} players allowed`,
          details: ['Please start a new game to add more players'],
        } as ValidationError;
      }

      // Add the player
      onAddPlayer({
        id: Date.now().toString(),
        name: playerName.trim(),
        frames: [],
        totalScore: 0,
      });

      // Reset form
      setPlayerName('');
    } catch (error) {
      setValidationError(error as ValidationError);
    }
  };

  return (
    <div className='mb-6'>
      <h3 className='text-lg font-medium mb-2'>Add Player</h3>

      {validationError && (
        <ValidationErrorComponent
          error={validationError}
          onClose={() => setValidationError(null)}
        />
      )}

      <form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-2'>
        <input
          type='text'
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder='Enter player name'
          className='px-4 py-2 border rounded-md flex-grow'
          aria-label='Player name'
        />
        <button
          type='submit'
          className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md'>
          Add Player
        </button>
      </form>

      <p className='text-sm text-gray-500 mt-2'>
        {existingPlayers.length}/{maxPlayers} players added
      </p>
    </div>
  );
};

export default PlayerForm;
