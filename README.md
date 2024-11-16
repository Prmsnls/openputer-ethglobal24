# 😊 Smile to Make Money 💰

An innovative Web3 application that uses Openputer AI Oracle to analyze your smile and rewards genuine happiness with cryptocurrency. Powered by blockchain technology, this dApp creates a unique intersection of artificial intelligence, emotional expression, and digital rewards.

## How It Works

1. 📸 Capture your smile through the app
2. 🤖 Openputer AI Oracle analyzes your smile's authenticity (scored 1-5)
3. ✨ Genuine smiles (score > 3) earn cryptocurrency rewards
4. 🌐 Winning smiles are stored on-chain and in our gallery

## Technical Stack

### Frontend
- Next.js with TypeScript
- Tailwind CSS for styling
- Privy for Web3 authentication
- ethers.js for blockchain interactions

### Backend
- Supabase for photo storage and metadata
- Real-time blockchain event processing
- Optimized image compression pipeline

## Features

- 🔐 Web3 wallet authentication via Privy
- 📸 Real-time camera feed with selfie mode
- 🤖 Decentralized AI smile analysis via Openputer
- 💰 Automatic token rewards for genuine smiles
- 👥 Social interactions with "smile back" feature
- 🖼️ Persistent gallery for winning smiles
- 📱 Responsive design for all devices

## Smart Contract Features

- Decentralized smile analysis via Openputer AI Oracle
- Real-time reward distribution
- Transparent scoring system
- Gas-optimized operations

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Database Schema

### Photos Table
- `user_id`: string
- `image_url`: string
- `timestamp`: timestamp
- `smile_score`: number
- `smile_count`: integer

## Technical Details

### Image Processing
- Automatic compression for optimal storage
- Maximum dimensions: 800x600
- JPEG optimization with quality preservation
- Mirrored selfie view for natural interaction

### Blockchain Integration
- Base Network compatibility
- Openputer AI Oracle for decentralized smile analysis
- Gas-efficient smart contract design
- Real-time event processing

### Security
- Secure wallet authentication
- Protected image storage
- Rate limiting on submissions
- Sybil resistance through wallet verification

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT

---

Built with ❤️ and 😊 on Base Network, powered by Openputer AI Oracle