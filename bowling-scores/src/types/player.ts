/**
 * Player interface representing an individual player in the bowling game
 */
export interface Player {
  /** Unique identifier for the player */
  id: string;

  /** Player's name */
  name: string;

  /** Boolean indicating if the player is currently active */
  isActive?: boolean;
}
