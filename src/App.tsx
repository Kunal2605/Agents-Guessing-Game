import { useState } from 'react'
import { Send, Brain, Sparkles, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassContainer, AgentBubble } from './components/BaseUI'
import { GeminiService } from './services/GeminiService'

type GameState = 'setup' | 'playing' | 'result'

interface Message {
  agentName: string
  message: string
  type: 'helper1' | 'helper2' | 'guesser'
}

function App() {
  const [gameState, setGameState] = useState<GameState>('setup')
  const [secretWord, setSecretWord] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [currentAgent, setCurrentAgent] = useState<'helper1' | 'helper2' | 'guesser' | null>(null)
  const [result, setResult] = useState<{ guess: string; isCorrect: boolean } | null>(null)

  const handleStartGame = async () => {
    const cleanWord = secretWord.trim()
    if (!cleanWord) return

    setGameState('playing')
    setMessages([])
    setResult(null)

    try {
      const service = new GeminiService()
      let currentHistory: string[] = []
      let solved = false
      let round = 1

      while (!solved) {
        // Helper 1
        setCurrentAgent('helper1')
        setIsThinking(true)
        const clue1 = await service.getHelper1Clue(cleanWord, currentHistory, round)
        const msg1: Message = { agentName: `Helper Alpha (Rnd ${round})`, message: clue1, type: 'helper1' }
        setMessages(prev => [...prev, msg1])
        currentHistory.push(`Helper 1 Clue: ${clue1}`)
        setIsThinking(false)
        await new Promise(r => setTimeout(r, 800))

        // Guesser after Helper 1
        setCurrentAgent('guesser')
        setIsThinking(true)
        const guess1 = await service.getGuesserGuess(currentHistory)
        const msgGuess1: Message = { agentName: `The Oracle (Rnd ${round}.1)`, message: `Guess: ${guess1.toUpperCase()}`, type: 'guesser' }
        setMessages(prev => [...prev, msgGuess1])
        currentHistory.push(`The Oracle Guess: ${guess1}`)
        setIsThinking(false)

        solved = guess1.toLowerCase() === cleanWord.toLowerCase() ||
          guess1.toLowerCase().includes(cleanWord.toLowerCase()) ||
          cleanWord.toLowerCase().includes(guess1.toLowerCase())

        if (solved) {
          setResult({ guess: guess1, isCorrect: true })
          setGameState('result')
          break
        }
        await new Promise(r => setTimeout(r, 800))

        // Helper 2
        setCurrentAgent('helper2')
        setIsThinking(true)
        const clue2 = await service.getHelper2Clue(cleanWord, currentHistory, round)
        const msg2: Message = { agentName: `Helper Beta (Rnd ${round})`, message: clue2, type: 'helper2' }
        setMessages(prev => [...prev, msg2])
        currentHistory.push(`Helper 2 Clue: ${clue2}`)
        setIsThinking(false)
        await new Promise(r => setTimeout(r, 800))

        // Guesser after Helper 2
        setCurrentAgent('guesser')
        setIsThinking(true)
        const guess2 = await service.getGuesserGuess(currentHistory)
        const msgGuess2: Message = { agentName: `The Oracle (Rnd ${round}.2)`, message: `Guess: ${guess2.toUpperCase()}`, type: 'guesser' }
        setMessages(prev => [...prev, msgGuess2])
        currentHistory.push(`The Oracle Guess: ${guess2}`)
        setIsThinking(false)

        solved = guess2.toLowerCase() === cleanWord.toLowerCase() ||
          guess2.toLowerCase().includes(cleanWord.toLowerCase()) ||
          cleanWord.toLowerCase().includes(guess2.toLowerCase())

        if (solved) {
          setResult({ guess: guess2, isCorrect: true })
          setGameState('result')
          break
        }

        round++
        if (round > 10) { // Safety break
          setResult({ guess: 'Giving up...', isCorrect: false })
          setGameState('result')
          break
        }

        await new Promise(r => setTimeout(r, 1500))
      }
      setCurrentAgent(null)

    } catch (error: any) {
      console.error("Game Error:", error)
      const message = error?.message || "Something went wrong."
      alert(`${message}\n\nCheck your API key or word. See console for details.`)
      setGameState('setup')
    }
  }

  return (
    <div className="min-h-screen py-12 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-extrabold tracking-tighter mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          Agent Mind Games
        </h1>
        <p className="text-slate-400">Two AI helpers. One AI guesser. One secret word.</p>
      </motion.div>

      <div className="w-full max-w-2xl px-4">
        <AnimatePresence mode="wait">
          {gameState === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <GlassContainer className="p-8">
                <div className="flex flex-col gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                      <Brain size={14} /> Secret Word
                    </label>
                    <input
                      type="text"
                      value={secretWord}
                      onChange={(e) => setSecretWord(e.target.value)}
                      placeholder="e.g. Astronaut, Waterfall, Pizza"
                      className="input-glass w-full"
                    />
                  </div>

                  <button
                    onClick={handleStartGame}
                    disabled={!secretWord}
                    className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Start Game <Send size={18} />
                  </button>
                </div>
              </GlassContainer>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <GlassContainer className="p-6 max-h-[600px] overflow-y-auto custom-scrollbar">
                <div className="flex flex-col gap-4">
                  {messages.map((msg, i) => (
                    <AgentBubble
                      key={i}
                      agentName={msg.agentName}
                      message={msg.message}
                      type={msg.type}
                    />
                  ))}
                  {isThinking && (
                    <AgentBubble
                      agentName={currentAgent === 'helper1' ? 'Helper Alpha' : currentAgent === 'helper2' ? 'Helper Beta' : 'The Oracle'}
                      message=""
                      type={currentAgent || 'helper1'}
                      isThinking={true}
                    />
                  )}
                </div>
              </GlassContainer>
            </motion.div>
          )}

          {gameState === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <GlassContainer className="p-10">
                <div className="mb-6">
                  {result?.isCorrect ? (
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/50">
                      <Sparkles className="text-green-400" size={40} />
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/50">
                      <RefreshCw className="text-red-400" size={40} />
                    </div>
                  )}
                  <h2 className="text-3xl font-bold mb-2">
                    {result?.isCorrect ? "Victory!" : "Defeat!"}
                  </h2>
                  <p className="text-slate-400">
                    The Oracle guessed: <span className="text-white font-mono uppercase tracking-widest">{result?.guess}</span>
                  </p>
                  <p className="text-slate-500 text-sm">Secret word: {secretWord}</p>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setGameState('setup')}
                    className="btn-primary"
                  >
                    Play Again
                  </button>
                  <button
                    onClick={() => setGameState('playing')}
                    className="text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    View Conversation
                  </button>
                </div>
              </GlassContainer>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  )
}

export default App
