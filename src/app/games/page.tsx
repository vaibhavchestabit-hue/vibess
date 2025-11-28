"use client";

import { useState } from "react";
import { Brain, Loader2, RefreshCw, Coins, Gamepad2, Flame, X } from "lucide-react";
import toast from "react-hot-toast";

export default function GamesPage() {
  const [overthink, setOverthink] = useState<string | null>(null);
  const [counter, setCounter] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Make Your Decision game state
  const [decisionResult, setDecisionResult] = useState<string | null>(null);
  const [decisionLoading, setDecisionLoading] = useState(false);

  // Rock Paper Scissors game state
  const rpsOptions = [
    { id: "rock", label: "Rock", emoji: "🪨" },
    { id: "paper", label: "Paper", emoji: "📄" },
    { id: "scissors", label: "Scissors", emoji: "✂️" },
  ] as const;
  type RpsOption = (typeof rpsOptions)[number]["id"];

  const [playerChoice, setPlayerChoice] = useState<RpsOption | null>(null);
  const [botChoice, setBotChoice] = useState<RpsOption | null>(null);
  const [rpsResult, setRpsResult] = useState<string | null>(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [rpsLoading, setRpsLoading] = useState(false);

  // FLAMES game state
  const [flamesName1, setFlamesName1] = useState("");
  const [flamesName2, setFlamesName2] = useState("");
  const [flamesResult, setFlamesResult] = useState<{ title: string; description: string } | null>(null);

  const handleOverthink = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/games/overthink", {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        setOverthink(data.overthink);
        setCounter(data.counter);
      } else {
        toast.error("Failed to generate overthink. Please try again.");
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setOverthink(null);
    setCounter(null);
  };

  // FLAMES game function
  const vibessFlames = (name1: string, name2: string) => {
    // 1. Clean names
    name1 = name1.toLowerCase().replace(/\s/g, '');
    name2 = name2.toLowerCase().replace(/\s/g, '');

    // 2. Convert to arrays
    let arr1 = name1.split('');
    let arr2 = name2.split('');

    // 3. Remove common letters
    for (let i = 0; i < arr1.length; i++) {
      for (let j = 0; j < arr2.length; j++) {
        if (arr1[i] === arr2[j]) {
          arr1[i] = '';
          arr2[j] = '';
          break;
        }
      }
    }

    // 4. Count remaining letters
    const remainingCount =
      arr1.filter(ch => ch !== '').length +
      arr2.filter(ch => ch !== '').length;

    // 5. FLAMES array
    let flames = ['F', 'L', 'A', 'M', 'E', 'S'];

    // 6. Elimination logic
    let count = remainingCount;
    while (flames.length > 1) {
      let index = (count % flames.length) - 1;
      if (index >= 0) {
        flames = flames.slice(index + 1).concat(flames.slice(0, index));
      } else {
        flames = flames.slice(0, flames.length - 1);
      }
    }

    // 7. Result mapping
    const resultMap: Record<string, { title: string; description: string }> = {
      F: {
        title: "Fun Buddies",
        description: "Always laughing, always bakchodi. No tension, only comedy."
      },
      L: {
        title: "Legendary Bakchod",
        description: "Chaotic duo. Together you two can ruin any serious conversation in 5 minutes."
      },
      A: {
        title: "Aesthetic Match",
        description: "Same wallpaper vibe. Same playlist energy. Same Instagram mood."
      },
      M: {
        title: "Momo Lovers",
        description: "United by one true love: street food. If life fails, momos won't."
      },
      E: {
        title: "Ek Tarfa Trauma",
        description: "One sided feelings. Other side: \"Bro we're just friends 😭\". Painful but funny."
      },
      S: {
        title: "Shaadi Material",
        description: "Family approved vibes. Shaadi.com energy unlocked."
      }
    };

    return resultMap[flames[0]];
  };

  const handleFlamesCalculate = () => {
    if (!flamesName1.trim() || !flamesName2.trim()) {
      return;
    }
    const result = vibessFlames(flamesName1.trim(), flamesName2.trim());
    setFlamesResult(result);
  };

  const handleFlamesReset = () => {
    setFlamesName1("");
    setFlamesName2("");
    setFlamesResult(null);
  };

  const handleMakeDecision = () => {
    setDecisionLoading(true);
    setDecisionResult(null);
    
    // Wait 2-3 seconds for suspense, then show result
    const delay = Math.random() * 1000 + 2000; // 2-3 seconds
    
    setTimeout(() => {
      const result = Math.random() < 0.5 ? "Heads" : "Tails";
      setDecisionResult(result);
      setDecisionLoading(false);
    }, delay);
  };

  const handleResetDecision = () => {
    setDecisionResult(null);
    setDecisionLoading(false);
  };

  const determineRpsWinner = (player: RpsOption, bot: RpsOption) => {
    if (player === bot) return "It's a tie!";
    if (
      (player === "rock" && bot === "scissors") ||
      (player === "paper" && bot === "rock") ||
      (player === "scissors" && bot === "paper")
    ) {
      return "You win!";
    }
    return "Bot wins!";
  };

  const handlePlayRps = (choice: RpsOption) => {
    if (rpsLoading) return;
    setRpsLoading(true);
    setPlayerChoice(choice);
    setRpsResult(null);

    setTimeout(() => {
      const botPick = rpsOptions[Math.floor(Math.random() * rpsOptions.length)].id;
      setBotChoice(botPick);
      const outcome = determineRpsWinner(choice, botPick);
      setRpsResult(outcome);
      if (outcome === "You win!") {
        setPlayerScore((prev) => prev + 1);
      } else if (outcome === "Bot wins!") {
        setBotScore((prev) => prev + 1);
      }
      setRpsLoading(false);
    }, 900);
  };

  const handleResetRps = () => {
    setPlayerChoice(null);
    setBotChoice(null);
    setRpsResult(null);
    setRpsLoading(false);
  };

  const handleResetRpsScore = () => {
    setPlayerScore(0);
    setBotScore(0);
    handleResetRps();
  };

  return (
    <div className="flex-1 flex gap-6 p-6 overflow-y-auto h-full">
      <section className="flex-1 max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Games</h1>
          <p className="text-white/60 text-sm">Fun games to pass time and have a laugh</p>
        </div>

        {/* FLAMES Game */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-orange-500/30 p-8 bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">FLAMES Game</h2>
                <p className="text-white/60 text-sm">A Vibess Desi Fun Edition - Find your relationship vibe</p>
              </div>
            </div>

            {!flamesResult ? (
              <div className="space-y-6">
                <div className="text-center py-8 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-white/80 text-sm mb-6">
                    Enter two names to discover your relationship vibe!
                  </p>
                  <div className="space-y-4 max-w-md mx-auto">
                    <div>
                      <label className="block text-xs text-white/60 mb-2 text-left">First Name</label>
                      <input
                        type="text"
                        value={flamesName1}
                        onChange={(e) => setFlamesName1(e.target.value)}
                        placeholder="Enter first name"
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/60 mb-2 text-left">Second Name</label>
                      <input
                        type="text"
                        value={flamesName2}
                        onChange={(e) => setFlamesName2(e.target.value)}
                        placeholder="Enter second name"
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all text-sm"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleFlamesCalculate}
                    disabled={!flamesName1.trim() || !flamesName2.trim()}
                    className="mt-6 px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
                  >
                    <Flame className="w-5 h-5" />
                    <span>Calculate FLAMES</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Result Display */}
                <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-2xl p-8 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-orange-500 to-red-500 mb-4">
                    <Flame className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="text-3xl font-bold text-white mb-3">{flamesResult.title}</h4>
                  <p className="text-white/80 text-lg leading-relaxed px-4 max-w-lg mx-auto">
                    {flamesResult.description}
                  </p>
                </div>

                {/* Names Display */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-white/60">
                  <span className="font-semibold">{flamesName1}</span>
                  <span className="text-xl">❤️</span>
                  <span className="font-semibold">{flamesName2}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleFlamesReset}
                    className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Try Another</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* The Overthink Button Game */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-purple-500/30 p-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">The Overthink Button</h2>
                <p className="text-white/60 text-sm">Press to get a random overthinking thought and its ridiculous counter</p>
              </div>
            </div>

            {!overthink ? (
              <div className="space-y-6">
                <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-white/60 text-sm mb-6">
                    Ready to overthink? Press the button below!
                  </p>
                  <button
                    onClick={handleOverthink}
                    disabled={loading}
                    className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Thinking...</span>
                      </>
                    ) : (
                      <>
                        <Brain className="w-5 h-5" />
                        <span>Press to Overthink</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Overthink Thought */}
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-2xl">🤔</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-red-400 font-semibold uppercase tracking-wider mb-2">Overthink:</p>
                      <p className="text-white text-lg leading-relaxed">{overthink}</p>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                    <span className="text-2xl">⬇️</span>
                  </div>
                </div>

                {/* Counter Thought */}
                <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-2xl">💡</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-green-400 font-semibold uppercase tracking-wider mb-2">Counter:</p>
                      <p className="text-white text-lg leading-relaxed font-medium">{counter}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleOverthink}
                    disabled={loading}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Thinking...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        <span>Overthink Again</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>


        {/* Make Your Decision Game */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-purple-500/30 p-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Make Your Decision</h2>
                <p className="text-white/60 text-sm">Can't decide? Let fate choose for you with a coin flip</p>
              </div>
            </div>

            {!decisionResult ? (
              <div className="space-y-6">
                <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
                  {decisionLoading ? (
                    <div className="space-y-6">
                      <div className="flex justify-center">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-6xl animate-spin" style={{ animationDuration: '0.3s' }}>
                          🪙
                        </div>
                      </div>
                      <p className="text-white/80 text-lg font-semibold">The coin is flipping...</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-white/60 text-sm mb-6">
                        Press the button to flip the coin!
                      </p>
                      <button
                        onClick={handleMakeDecision}
                        disabled={decisionLoading}
                        className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
                      >
                        <Coins className="w-5 h-5" />
                        <span>Make Your Decision</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Result Display */}
                <div className={`rounded-2xl p-8 text-center ${
                  decisionResult === "Heads" 
                    ? "bg-yellow-500/20 border border-yellow-500/30" 
                    : "bg-gray-500/20 border border-gray-500/30"
                }`}>
                  <div className="mb-4">
                    <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center text-4xl font-bold ${
                      decisionResult === "Heads"
                        ? "bg-yellow-500/30 text-yellow-300"
                        : "bg-gray-500/30 text-gray-300"
                    }`}>
                      {decisionResult === "Heads" ? "🪙" : "🪙"}
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white mb-2">{decisionResult}</p>
                  <p className="text-white/60 text-sm">
                    {decisionResult === "Heads" 
                      ? "The coin landed on Heads!" 
                      : "The coin landed on Tails!"}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleMakeDecision}
                    disabled={decisionLoading}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {decisionLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Flipping...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        <span>Flip Again</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleResetDecision}
                    className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>


        {/* Rock Paper Scissors */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-purple-500/30 p-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Rock • Paper • Scissors</h2>
                <p className="text-white/60 text-sm">Challenge the bot and see who gets the bragging rights</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-white/5 rounded-2xl border border-white/10 p-4 flex flex-col gap-4">
                <div className="text-center">
                  <p className="text-white/60 text-xs uppercase tracking-widest mb-2">Scoreboard</p>
                  <div className="flex items-center justify-between text-white font-semibold text-lg">
                    <div className="text-left">
                      <p className="text-white/60 text-xs">You</p>
                      <p className="text-2xl">{playerScore}</p>
                    </div>
                    <span className="text-white/40 text-sm">vs</span>
                    <div className="text-right">
                      <p className="text-white/60 text-xs">Bot</p>
                      <p className="text-2xl">{botScore}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleResetRpsScore}
                  className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-all"
                >
                  Reset Scoreboard
                </button>
                <button
                  onClick={handleResetRps}
                  className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-all"
                >
                  Clear Round
                </button>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <div>
                  <p className="text-white/70 text-sm mb-3">Pick your weapon</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {rpsOptions.map((option) => {
                      const isActive = playerChoice === option.id && !rpsLoading;
                      return (
                        <button
                          key={option.id}
                          onClick={() => handlePlayRps(option.id)}
                          disabled={rpsLoading}
                          className={`p-4 rounded-2xl border transition-all ${
                            isActive
                              ? "border-purple-500/60 bg-purple-500/20 text-white"
                              : "border-white/10 bg-white/5 text-white/80 hover:border-white/30"
                          }`}
                        >
                          <div className="text-3xl mb-2">{option.emoji}</div>
                          <p className="font-semibold">{option.label}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-white/50 text-xs uppercase mb-2">You Played</p>
                      <p className="text-3xl">
                        {playerChoice ? rpsOptions.find((o) => o.id === playerChoice)?.emoji : "❔"}
                      </p>
                      <p className="text-white font-semibold mt-1">
                        {playerChoice ? rpsOptions.find((o) => o.id === playerChoice)?.label : "Waiting..."}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/50 text-xs uppercase mb-2">Result</p>
                      {rpsLoading ? (
                        <div className="flex flex-col items-center gap-2 text-white/70">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span className="text-sm">Bot is thinking...</span>
                        </div>
                      ) : (
                        <p
                          className={`text-xl font-bold ${
                            rpsResult === "You win!"
                              ? "text-green-400"
                              : rpsResult === "Bot wins!"
                              ? "text-red-400"
                              : "text-white/80"
                          }`}
                        >
                          {rpsResult || "Make your move"}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-white/50 text-xs uppercase mb-2">Bot Played</p>
                      <p className="text-3xl">
                        {botChoice ? rpsOptions.find((o) => o.id === botChoice)?.emoji : "❔"}
                      </p>
                      <p className="text-white font-semibold mt-1">
                        {botChoice ? rpsOptions.find((o) => o.id === botChoice)?.label : "Waiting..."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

