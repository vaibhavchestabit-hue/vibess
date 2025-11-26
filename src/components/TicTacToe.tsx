"use client";

import { useEffect, useState } from "react";
import { X, Circle, Trophy, RotateCcw } from "lucide-react";

type Player = "X" | "O";
type Cell = Player | null;
type Board = Cell[];

interface TicTacToeProps {
    onMove?: (board: Board, currentPlayer: Player, winner: Player | "draw" | null) => void;
    initialBoard?: Board;
    initialPlayer?: Player;
    disabled?: boolean;
    playerSymbol?: Player; // Which symbol this user controls
}

export default function TicTacToe({
    onMove,
    initialBoard,
    initialPlayer = "X",
    disabled = false,
    playerSymbol,
}: TicTacToeProps) {
    const [board, setBoard] = useState<Board>(initialBoard || Array(9).fill(null));
    const [currentPlayer, setCurrentPlayer] = useState<Player>(initialPlayer);
    const [winner, setWinner] = useState<Player | "draw" | null>(null);

    // Update board when initialBoard changes (for syncing from messages)
    useEffect(() => {
        if (initialBoard) {
            setBoard(initialBoard);
        }
    }, [initialBoard]);

    // Check for winner whenever board changes
    useEffect(() => {
        const result = checkWinner(board);
        setWinner(result);
    }, [board]);

    const checkWinner = (board: Board): Player | "draw" | null => {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6], // Diagonals
        ];

        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a] as Player;
            }
        }

        // Check for draw
        if (board.every((cell) => cell !== null)) {
            return "draw";
        }

        return null;
    };

    const handleCellClick = (index: number) => {
        // Prevent moves if game is over, cell is occupied, disabled, or not player's turn
        if (winner || board[index] || disabled) return;

        // If playerSymbol is set, only allow moves for that player
        if (playerSymbol && currentPlayer !== playerSymbol) return;

        const newBoard = [...board];
        newBoard[index] = currentPlayer;
        setBoard(newBoard);

        const nextPlayer = currentPlayer === "X" ? "O" : "X";
        setCurrentPlayer(nextPlayer);

        // Notify parent component
        if (onMove) {
            const result = checkWinner(newBoard);
            onMove(newBoard, nextPlayer, result);
        }
    };

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setCurrentPlayer("X");
        setWinner(null);
        if (onMove) {
            onMove(Array(9).fill(null), "X", null);
        }
    };

    const renderCell = (index: number) => {
        const cell = board[index];
        const isWinningCell = winner && winner !== "draw" && checkWinningCells(board, winner).includes(index);

        return (
            <button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={disabled || !!winner || !!cell || (playerSymbol && currentPlayer !== playerSymbol)}
                className={`
          aspect-square rounded-2xl border-2 transition-all duration-300
          flex items-center justify-center text-4xl font-bold
          ${cell ? "bg-white/10" : "bg-white/5 hover:bg-white/15"}
          ${isWinningCell ? "border-yellow-400 bg-yellow-400/20" : "border-white/20"}
          ${!cell && !winner && !disabled && (!playerSymbol || currentPlayer === playerSymbol) ? "cursor-pointer hover:scale-105" : "cursor-not-allowed"}
          disabled:opacity-50
        `}
            >
                {cell === "X" && <X className="w-12 h-12 text-purple-400 animate-in fade-in zoom-in duration-300" />}
                {cell === "O" && <Circle className="w-12 h-12 text-pink-400 animate-in fade-in zoom-in duration-300" />}
            </button>
        );
    };

    const checkWinningCells = (board: Board, winner: Player): number[] => {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6],
        ];

        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (board[a] === winner && board[b] === winner && board[c] === winner) {
                return pattern;
            }
        }
        return [];
    };

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10">
            {/* Game Status */}
            <div className="mb-6 text-center">
                {winner ? (
                    <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2">
                            <Trophy className="w-6 h-6 text-yellow-400" />
                            <h3 className="text-2xl font-bold text-white">
                                {winner === "draw" ? "It's a Draw!" : `Player ${winner} Wins!`}
                            </h3>
                        </div>
                        <button
                            onClick={resetGame}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold transition-all flex items-center gap-2 mx-auto"
                        >
                            <RotateCcw className="w-4 h-4" />
                            New Game
                        </button>
                    </div>
                ) : (
                    <div className="space-y-1">
                        <p className="text-white/60 text-sm">Current Turn</p>
                        <div className="flex items-center justify-center gap-2">
                            {currentPlayer === "X" ? (
                                <X className="w-6 h-6 text-purple-400" />
                            ) : (
                                <Circle className="w-6 h-6 text-pink-400" />
                            )}
                            <span className="text-xl font-bold text-white">Player {currentPlayer}</span>
                        </div>
                        {playerSymbol && (
                            <p className="text-white/40 text-xs">
                                You are playing as {playerSymbol}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Game Board */}
            <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 9 }).map((_, index) => renderCell(index))}
            </div>

            {/* Player Legend */}
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-white/60">
                <div className="flex items-center gap-2">
                    <X className="w-4 h-4 text-purple-400" />
                    <span>Player X</span>
                </div>
                <div className="flex items-center gap-2">
                    <Circle className="w-4 h-4 text-pink-400" />
                    <span>Player O</span>
                </div>
            </div>
        </div>
    );
}
