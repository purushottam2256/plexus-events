import { useState, useEffect } from 'react';
import { Clock, MapPin, Users, ChevronDown, ExternalLink, ArrowLeft } from 'lucide-react';
// Event type definition
interface Event {
  id: number;
  name: string;
  image: string;
  venue: string;
  timings: string;
  dates: string;
  coordinatedBy: string;
  registrationLink: string;
  registrationFee: string;
  registrationDeadline: Date;
  description?: string;
}

function App() {
  //figma event
  const events: Event[] = [
    {
      id: 1,
      name: "Figma Workshop",
      image: "https://cdn.prod.website-files.com/59e16042ec229e00016d3a66/64309e7ce733f37f0a4c0880_Figma-rebrand-assets_Blog-hero.webp",
      venue: "310 Lab, Block B, MRCE",
      timings: "10 AM - 12:30 PM",
      dates: "11 March to 13 March",
      coordinatedBy: "Design Team Plexus",
      registrationLink: "https://forms.gle/8psGUs4tjUwPW7Pt7",
      registrationFee: "₹100",
      registrationDeadline: new Date("2025-03-11T10:00:00"),
      description: "Join us for an immersive three-day Figma Workshop where you'll learn the fundamentals of UI/UX design using Figma. This hands-on workshop will cover everything from basic interface design to advanced prototyping techniques. Perfect for beginners and intermediate designers looking to enhance their skills. Bring your laptop with Figma installed and get ready to transform your design workflow!"
    }
  ];

  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [countdowns, setCountdowns] = useState<{ [key: number]: string }>({});

  // View event details
  const viewEventDetails = (eventId: number) => {
    setSelectedEventId(eventId);
    // Smooth scroll to top when viewing details
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Go back to events list
  const goBackToEvents = () => {
    setSelectedEventId(null);
    // Smooth scroll to top when going back
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate and update countdowns
  useEffect(() => {
    const interval = setInterval(() => {
      const newCountdowns: { [key: number]: string } = {};
      
      events.forEach(event => {
        const now = new Date();
        const deadline = new Date(event.registrationDeadline);
        const diff = deadline.getTime() - now.getTime();
        
        if (diff <= 0) {
          newCountdowns[event.id] = "Registration Closed";
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          
          newCountdowns[event.id] = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        }
      });
      
      setCountdowns(newCountdowns);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [events]);

  // Find the selected event
  const selectedEvent = events.find(event => event.id === selectedEventId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      {/* Moving background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-blue-500/10"
            style={{
              width: `${Math.random() * 300 + 50}px`,
              height: `${Math.random() * 300 + 50}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 20 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header with Logos */}
        <header className="flex flex-col items-center mb-16">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
            {/* MRCE Logo */}
            <img 
              src ="/images/logo.png"
              alt="MRCE College Logo" 
              className="h-24 object-contain"
            />
            
          
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-white">
            Plexus Club Events
          </h1>
          <p className="text-xl text-blue-200 mt-2 text-center">MRCE College</p>
          <p className="text-md text-blue-300 mt-1 text-center italic">UNITED BY NERVES</p>
        </header>
        
        {selectedEvent ? (
          // Event Details Page
          <div className="max-w-4xl mx-auto">
            <button 
              onClick={goBackToEvents}
              className="flex items-center gap-2 text-blue-300 hover:text-blue-100 mb-6 transition-colors duration-300 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
              Back to Events
            </button>
            
            <div className="bg-white/5 rounded-xl overflow-hidden backdrop-blur-sm border border-white/10 hover:border-blue-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
              {/* Event Image */}
              <div className="h-80 overflow-hidden">
                <img 
                  src={selectedEvent.image} 
                  alt={selectedEvent.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="p-8">
                <div className="flex flex-col md:flex-row items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold">{selectedEvent.name}</h2>
                  
                  {/* Figma Logo */}
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg" 
                    alt="Figma Logo" 
                    className="h-10 mt-4 md:mt-0"
                  />
                </div>
                
                {/* Event Description */}
                <p className="text-blue-100 mb-8 leading-relaxed">
                  {selectedEvent.description}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <MapPin className="w-6 h-6 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-blue-200 font-medium">Venue</p>
                        <p className="text-lg">{selectedEvent.venue}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <Clock className="w-6 h-6 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-blue-200 font-medium">Timings</p>
                        <p className="text-lg">{selectedEvent.timings}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <Clock className="w-6 h-6 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-blue-200 font-medium">Dates</p>
                        <p className="text-lg">{selectedEvent.dates}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <Users className="w-6 h-6 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-blue-200 font-medium">Coordinated By</p>
                        <p className="text-lg">{selectedEvent.coordinatedBy}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-900/30 p-6 rounded-lg mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-blue-200 font-medium">Registration Fee</p>
                      <p className="font-bold text-2xl">{selectedEvent.registrationFee}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-blue-200 font-medium">Registration Closes In</p>
                      <p className="font-mono text-xl">{countdowns[selectedEvent.id] || "Loading..."}</p>
                    </div>
                  </div>
                </div>
                
                <a
                  href={selectedEvent.registrationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-blue-600 hover:bg-blue-500 text-center text-white py-4 px-6 rounded-lg transition-all duration-300 text-lg font-medium hover:shadow-lg hover:shadow-blue-600/30"
                >
                  Register Now <ExternalLink className="inline-block ml-2 w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        ) : (
          // Events List - Centered for single event
          <div className="max-w-2xl mx-auto">
            {events.map(event => (
              <div 
                key={event.id} 
                className="bg-white/5 rounded-xl overflow-hidden backdrop-blur-sm border border-white/10 hover:border-blue-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
              >
                {/* Event Image */}
                <div className="h-64 overflow-hidden">
                  <img 
                    src={event.image} 
                    alt={event.name} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>
                
                {/* Event Title and Buttons */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">{event.name}</h2>
                    
                    {/* Figma Logo */}
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg" 
                      alt="Figma Logo" 
                      className="h-8"
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => viewEventDetails(event.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-900/50 hover:bg-blue-800 text-white py-3 px-4 rounded-lg transition-all duration-300"
                    >
                      Details
                      <ChevronDown size={18} className="transition-transform duration-300" />
                    </button>
                    
                    <a
                      href={event.registrationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 px-4 rounded-lg transition-all duration-300"
                    >
                      Register <ExternalLink size={18} />
                    </a>
                  </div>
                  
                  {/* Preview Info */}
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-blue-200 truncate">{event.venue}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-blue-200 truncate">{event.dates}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <footer className="mt-20 py-6 border-t border-white/10 text-center text-white/60">
        <div className="flex justify-center items-center gap-4 mb-4">
          <img 
            src="/images/Plexus White.png"
            alt="Plexus Logo" 
            className="h-10 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallbackText = document.createElement('span');
              fallbackText.textContent = 'PLEXUS';
              fallbackText.className = 'font-tech text-xl text-white tracking-widest';
              e.currentTarget.parentNode?.appendChild(fallbackText);
            }}
          />
        </div>
        <p>© 2025 Plexus Club - MRCE College. </p>
      </footer>
    </div>
  );
}

export default App;