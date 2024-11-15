# 😊 Smile to Make Money 💰

A fun, interactive web application that lets users capture and share smiles while earning virtual appreciation through smile-back interactions.

## Features

- 📸 Real-time camera feed with selfie mode
- 🖼️ Photo capture with automatic image compression
- 👍 Social interactions with "smile back" feature
- 🗑️ Personal photo management
- 🌐 Share functionality
- 📱 Responsive design for all devices

## Technical Stack

- **Frontend**: Next.js with TypeScript
- **UI Components**: Custom components with Tailwind CSS
- **Icons**: Lucide React
- **Styling**: Custom neomorphic design with playful shadows

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables
4. Run the development server:
   ```bash
   npm run dev
   ```

## Database Schema

### Photos Table
- `user_id`: string
- `image_url`: string
- `timestamp`: timestamp
- `smile_count`: integer

## Features in Detail

### Image Processing
- Automatic image compression
- Maximum dimensions: 800x600
- JPEG compression with 60% quality
- Mirrored selfie view

### User Experience
- Persistent user identification
- Loading states with animated feedback
- Optimistic UI updates
- Error handling with user-friendly messages

## Contributing

Feel free to submit issues and pull requests!

---

Built with ❤️ and 😊