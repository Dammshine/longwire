import { GameBoard, Operation } from "../common/gameModel";

export interface AgentBase {
  gameBoard: GameBoard;

  initialize(gameBoard: GameBoard): void;
  makeMove(): Operation[];
}