# Agent Mind Games

An interactive AI-powered guessing game where two AI "Helper" agents provide clues to an AI "Guesser" agent.

## How it Works

1. **Setup**: The user enters a "Secret Word".
2. **Helper Alpha**: Provides the first one-word clue.
3. **The Oracle (Guesser)**: Makes a first guess based on Helper Alpha's clue.
4. **Helper Beta**: Provides a second one-word clue.
5. **The Oracle (Guesser)**: Makes a second guess based on all previous clues.
6. The game continues until The Oracle correctly guesses the word or reaches the round limit.

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Vanilla CSS (Modern glassmorphism design)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **AI Integration**: OpenRouter SDK (using GPT-4o)

## Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/your-username/agents-guessing-game.git
cd agents-guessing-game
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory and add your OpenRouter API key:
```env
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
```
You can get an API key from [OpenRouter](https://openrouter.ai/).

### 4. Run the development server
```bash
npm run dev
```

## AI Agent Personalities

- **Helper Alpha**: Starts with vague clues, gradually becoming more specific.
- **Helper Beta**: Provides complementary clues from a different perspective.
- **The Oracle**: Analyzes the history of clues to deduce the secret word.
