import { GameBoard, Operation } from "../common/gameModel";

export interface AgentBase {
  makeMove(gameBoard: GameBoard): Operation[];
}