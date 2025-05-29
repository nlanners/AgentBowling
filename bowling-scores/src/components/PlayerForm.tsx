import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import createCommonStyles from '../theme/styles';
import {
  GameValidationHelper,
  ValidationError,
} from '../utils/validation/gameValidationHelper';
import ValidationErrorComponent from './ValidationError';
import { Player } from '../types';
import Button from './ui/Button';
import Typography from './ui/Typography';

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
  const { theme } = useTheme();
  const commonStyles = createCommonStyles();

  const handleSubmit = () => {
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
        isActive: true,
      });

      // Reset form
      setPlayerName('');
    } catch (error) {
      setValidationError(error as ValidationError);
    }
  };

  return (
    <View style={styles.container}>
      <Typography variant='heading' style={styles.heading}>
        Add Player
      </Typography>

      {validationError && (
        <ValidationErrorComponent
          error={validationError}
          onClose={() => setValidationError(null)}
        />
      )}

      <View style={styles.formContainer}>
        <TextInput
          value={playerName}
          onChangeText={setPlayerName}
          placeholder='Enter player name'
          style={commonStyles.input}
          accessibilityLabel='Player name'
        />
        <Button onPress={handleSubmit} variant='primary'>
          Add Player
        </Button>
      </View>

      <Typography variant='caption' style={styles.counter}>
        {existingPlayers.length}/{maxPlayers} players added
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  heading: {
    marginBottom: 8,
  },
  formContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  counter: {
    marginTop: 8,
  },
});

export default PlayerForm;
