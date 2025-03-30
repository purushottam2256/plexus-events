# Plexus Club Events - MRCE College

![Plexus Logo](/images/Plexus%20White.png)

A responsive React application that showcases upcoming Plexus Club events at MRCE College, allowing students to view event details and register.

## Features

- 🎨 Modern UI with responsive design
- 🌊 Animated background elements for visual appeal
- ⏱️ Real-time countdown timers for event registration deadlines
- 📱 Mobile-friendly interface
- 🔗 External registration links
- 🖼️ Smooth transitions and animations

## Tech Stack

- [React](https://reactjs.org/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Vite](https://vitejs.dev/) - Build tool
- [Lucide React](https://lucide.dev/docs/lucide-react) - Icon library

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn

### Installation

1. Clone the repository
   git clone https://github.com/your-username/plexus-events.git cd plexus-events

2. Install dependencies
   npm install

3. Start the development server
   npm run dev

4. Open your browser and visit `http://localhost:5173`

## Build for Production
npm run build

The built assets will be in the `dist` directory.

## Project Structure

- `/src` - Source code
  - `App.tsx` - Main application component
  - `main.tsx` - Entry point
  - `index.css` - Global styles and Tailwind imports
- `/images` - Static images 
- `/public` - Public assets

## Adding New Events

To add a new event, modify the events array in `src/App.tsx`:

```typescript
const events: Event[] = [
  {
    id: 2, // increment ID
    name: "Your Event Name",
    image: "image-url.jpg",
    venue: "Event Location",
    timings: "Event Time",
    dates: "Event Dates",
    coordinatedBy: "Coordinator Name",
    registrationLink: "https://example.com/register",
    registrationFee: "₹XXX",
    registrationDeadline: new Date("YYYY-MM-DDThh:mm:ss"),
    description: "Event description goes here..."
  },
  // existing events...
];
```
**About Plexus Club**

Plexus Club is the technical club at MRCE College, organizing various events, workshops and hackathons to enhance students technical skills and knowledge.
