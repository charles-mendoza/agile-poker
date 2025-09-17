# Agile Poker

A real-time planning poker app for Agile sprint planning with **AI-assisted insights**. Built with **Next.js + TypeScript**, **Radix UI**, and **Firebase Firestore** for realtime collaboration. Enhanced with **Genkit AI integration** for smarter story estimation support and analysis.

---

## 🚀 Features

### Moderator Flow

- **Create a Game Room** with:
  - Your Name
  - Game Name
  - Game Description _(optional)_
  - Stories _(optional, one per line)_
  - Estimation Card Type _(Scrum, Fibonacci, Sequential, Hourly, Days, T-Shirt)_
- **Manage Rounds**:
  - Choose a story to estimate
  - Accept round results
  - Play again with the same story
  - Reveal cards at any time
  - Cancel a round

### Player Flow

- **Join via link** (example: `/ff61c53d`)
- Enter player name
- **Select an estimation card** or choose to **Skip round**
- Wait for the moderator to reveal results

---

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
- **State & Data**: [Firebase (Firestore & Realtime)](https://firebase.google.com/)
- **AI Integration**: [Genkit](https://firebase.google.com/docs/genkit) with [Google AI](https://ai.google/), [Genkit Next.js SDK](https://www.npmjs.com/package/@genkit-ai/next)
