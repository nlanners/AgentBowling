import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useGame } from '../contexts/GameContext';
import createCommonStyles from '../theme/styles';
import Typography from '../components/ui/Typography';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { theme } = useTheme();
  const { resetGame } = useGame();
  const commonStyles = createCommonStyles();

  const handleNewGame = () => {
    // Reset game state before navigating to player setup
    resetGame();
    navigation.navigate('PlayerSetup');
  };

  return (
    <Container variant='centered'>
      <Typography variant='h1'>Bowling Score Tracker</Typography>

      <View style={styles.buttonContainer}>
        <Button variant='primary' fullWidth onPress={handleNewGame}>
          New Game
        </Button>

        <Button
          variant='secondary'
          fullWidth
          onPress={() => navigation.navigate('History')}>
          View History
        </Button>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
});

export default HomeScreen;
