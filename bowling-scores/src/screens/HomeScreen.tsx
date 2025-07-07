import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useGame } from '../contexts/GameContext';
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

  const handleNewGame = () => {
    // Reset game state before navigating to player setup
    resetGame();
    navigation.navigate('PlayerSetup');
  };

  return (
    <Container variant='screenCentered'>
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Typography variant='h1' style={styles.title}>
            Bowling Score Tracker
          </Typography>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            variant='primary'
            fullWidth
            onPress={handleNewGame}
            style={styles.button}>
            New Game
          </Button>

          <Button
            variant='secondary'
            fullWidth
            onPress={() => navigation.navigate('History')}
            style={styles.button}>
            View History
          </Button>

          <Button
            leftIcon='bar-chart'
            variant='outline'
            fullWidth
            onPress={() => navigation.navigate('Statistics')}
            style={styles.button}>
            Statistics
          </Button>
        </View>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    paddingHorizontal: 20, // Ensure content doesn't touch edges
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 56, // More breathing room
    paddingHorizontal: 16, // Extra padding for title
  },
  title: {
    textAlign: 'center',
    marginBottom: 0,
  },
  buttonContainer: {
    width: '100%',
    gap: 20, // Better gap between buttons
    paddingHorizontal: 8, // Ensure buttons don't touch edges
  },
  button: {
    marginVertical: 0,
  },
});

export default HomeScreen;
