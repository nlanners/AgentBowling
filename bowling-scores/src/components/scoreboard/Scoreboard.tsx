import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Game } from '../../types';
import { Typography, Card } from '../ui';
import PlayerRow from './PlayerRow';
import { useTheme } from '../../contexts/ThemeContext';

export interface ScoreboardProps {
  game: Game;
}

/**
 * Main scoreboard component that displays all players and their frames
 */
const Scoreboard: React.FC<ScoreboardProps> = ({ game }) => {
  const { theme } = useTheme();
  const { players, frames, currentPlayer, currentFrame, isComplete } = game;
  const headerScrollViewRef = useRef<ScrollView>(null);
  const playerScrollViewRefs = useRef<ScrollView[]>([]);

  // Function to sync all ScrollViews when one is scrolled
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollX = event.nativeEvent.contentOffset.x;

    // Sync header ScrollView
    if (headerScrollViewRef.current) {
      headerScrollViewRef.current.scrollTo({ x: scrollX, animated: false });
    }

    // Sync all player ScrollViews
    playerScrollViewRefs.current.forEach((scrollRef) => {
      if (scrollRef) {
        scrollRef.scrollTo({ x: scrollX, animated: false });
      }
    });
  };

  // Register player ScrollView refs
  const registerPlayerScrollViewRef = (
    index: number,
    ref: ScrollView | null
  ) => {
    if (ref) {
      playerScrollViewRefs.current[index] = ref;
    }
  };

  return (
    <Card style={styles.container}>
      <Typography variant='h3' style={styles.title}>
        Scoreboard
      </Typography>

      <View style={styles.headerRow}>
        <View style={styles.playerHeaderColumn}>
          <Typography variant='caption' color={theme.colors.text.secondary}>
            Player
          </Typography>
        </View>
        <ScrollView
          ref={headerScrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.framesHeader}
          scrollEnabled={false}>
          {Array.from({ length: 10 }).map((_, index) => (
            <View key={`header-${index}`} style={styles.frameHeaderCell}>
              <Typography variant='caption' color={theme.colors.text.secondary}>
                {index + 1}
              </Typography>
            </View>
          ))}
        </ScrollView>
      </View>

      <ScrollView>
        {players.map((player, playerIndex) => (
          <PlayerRow
            key={`player-${player.id}`}
            player={player}
            frames={frames[playerIndex] || []}
            currentPlayerIndex={currentPlayer}
            playerIndex={playerIndex}
            currentFrameIndex={currentFrame}
            isGameComplete={isComplete}
            onScroll={handleScroll}
            scrollViewRef={(ref) =>
              registerPlayerScrollViewRef(playerIndex, ref)
            }
          />
        ))}
      </ScrollView>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
    overflow: 'hidden',
  },
  title: {
    padding: 16,
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  playerHeaderColumn: {
    width: 100,
    paddingLeft: 16,
  },
  framesHeader: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  frameHeaderCell: {
    width: 40,
    alignItems: 'center',
    marginHorizontal: 2,
  },
});

export default Scoreboard;
