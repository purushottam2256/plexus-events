import { useState, useEffect } from 'react';
import { Clock, MapPin, Users, ChevronDown, ExternalLink, ArrowLeft, Calendar, Info } from 'lucide-react';

// Event status type
type EventStatus = 'active' | 'pre-production' | 'cancelled' | 'coming-soon' | 'ended';

// Description section type
interface DescriptionSection {
  type: 'title' | 'subtitle' | 'paragraph' | 'bulletpoints';
  content: string;
  items?: string[];
}

// Event type definition with enhanced description
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
  registrationStartDate: Date;
  status: EventStatus;
  description: DescriptionSection[];
  logo?: string;
}

// Function to handle image path resolution
const resolveImagePath = (imagePath: string) => {
  // If it's an external URL (starts with http or https), use it as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a relative path without a leading slash, add one
  if (!imagePath.startsWith('/')) {
    return `/${imagePath}`;
  }
  
  return imagePath;
};

function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [countdowns, setCountdowns] = useState<{ [key: number]: string }>({});
  const [registrationStatus, setRegistrationStatus] = useState<{ [key: number]: { isOpen: boolean, message: string } }>({});
  const [imageFallbacks, setImageFallbacks] = useState<{ [key: string]: boolean }>({});

  // Handle image error
  const handleImageError = (imageUrl: string) => {
    setImageFallbacks(prev => ({
      ...prev,
      [imageUrl]: true
    }));
  };

  // Fetch events data from public folder
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('./events.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch events: ${response.status} ${response.statusText}`);
        }
        
        const eventsData = await response.json();
        
        // Convert string dates to Date objects
        const processedEvents = eventsData.map((event: Event) => ({
          ...event,
          registrationDeadline: new Date(event.registrationDeadline),
          registrationStartDate: new Date(event.registrationStartDate)
        }));
        
        setEvents(processedEvents);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err instanceof Error ? err.message : 'Failed to load events');
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);
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

  // Calculate and update countdowns and registration status
  useEffect(() => {
    if (events.length === 0) return;

    const interval = setInterval(() => {
      const newCountdowns: { [key: number]: string } = {};
      const newRegistrationStatus: { [key: number]: { isOpen: boolean, message: string } } = {};
      
      events.forEach(event => {
        const now = new Date();
        const deadline = new Date(event.registrationDeadline);
        const startDate = new Date(event.registrationStartDate);
        const diff = deadline.getTime() - now.getTime();
        const startDiff = startDate.getTime() - now.getTime();
        
        // Check if event has ended by parsing end date from the dates string
        let isEventEnded = false;
        const datesStr = event.dates.toLowerCase();
        if (datesStr.includes('to')) {
          // Format like "11 March to 13 March"
          const parts = datesStr.split('to');
          if (parts.length > 1) {
            const endDateStr = parts[1].trim();
            // Extract year (assuming current or next year if not specified)
            const year = new Date().getFullYear();
            // Parse the end date (approximate method)
            const endDate = new Date(`${endDateStr} ${year}`);
            // Add one day to include the full last day
            endDate.setDate(endDate.getDate() + 1);
            isEventEnded = now > endDate;
          }
        } else if (datesStr.includes('in')) {
          // Format like "Every Saturday in April"
          const monthMatch = datesStr.match(/(january|february|march|april|may|june|july|august|september|october|november|december)/i);
          if (monthMatch) {
            const monthStr = monthMatch[0];
            const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
            const monthIndex = monthNames.findIndex(m => m.toLowerCase() === monthStr.toLowerCase());
            if (monthIndex !== -1) {
              const year = new Date().getFullYear();
              // Create a date for the last day of the specified month
              const endOfMonth = new Date(year, monthIndex + 1, 0);
              isEventEnded = now > endOfMonth;
            }
          }
        }
        
        // Calculate countdown
        if (diff <= 0) {
          newCountdowns[event.id] = "Registration Closed";
          newRegistrationStatus[event.id] = { isOpen: false, message: "Registration Closed" };
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          
          newCountdowns[event.id] = `${days}d ${hours}h ${minutes}m ${seconds}s`;
          
          // Check if registration is open based on start date
          if (startDiff > 0) {
            newRegistrationStatus[event.id] = { isOpen: false, message: "Registration Opens Soon" };
          } else {
            newRegistrationStatus[event.id] = { isOpen: true, message: "Registration Open" };
          }
        }
        
        // Override registration status based on event status
        if (event.status === 'cancelled') {
          newRegistrationStatus[event.id] = { isOpen: false, message: "Event Cancelled" };
        } else if (event.status === 'pre-production') {
          newRegistrationStatus[event.id] = { isOpen: false, message: "Coming Soon" };
        } else if (event.status === 'coming-soon') {
          newRegistrationStatus[event.id] = { isOpen: false, message: "Coming Soon" };
        }
        
        // Override status for ended events
        if (isEventEnded && event.status === 'active') {
          // Create a modified copy of the event with ended status
          event.status = 'ended';
          newRegistrationStatus[event.id] = { isOpen: false, message: "Event Ended" };
        }
      });
      
      setCountdowns(newCountdowns);
      setRegistrationStatus(newRegistrationStatus);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [events]);

  // Find the selected event
  const selectedEvent = events.find(event => event.id === selectedEventId);

  // Get status badge styles
  const getStatusBadge = (status: EventStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-600 text-white';
      case 'pre-production':
        return 'bg-yellow-600 text-white';
      case 'cancelled':
        return 'bg-red-600 text-white';
      case 'coming-soon':
        return 'bg-blue-600 text-white';
      case 'ended':
        return 'bg-gray-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  // Get status label
  const getStatusLabel = (status: EventStatus) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'pre-production':
        return 'In Preparation';
      case 'cancelled':
        return 'Cancelled';
      case 'coming-soon':
        return 'Coming Soon';
      case 'ended':
        return 'Event Ended';
      default:
        return 'Unknown';
    }
  };

  // Render description sections
  const renderDescriptionSection = (section: DescriptionSection, index: number) => {
    switch (section.type) {
      case 'title':
        return <h3 key={index} className="text-2xl font-bold mt-6 mb-3">{section.content}</h3>;
      case 'subtitle':
        return <h4 key={index} className="text-xl font-semibold mt-5 mb-2 text-blue-300">{section.content}</h4>;
      case 'paragraph':
        return <p key={index} className="text-blue-100 mb-4 leading-relaxed">{section.content}</p>;
      case 'bulletpoints':
        return (
          <ul key={index} className="list-disc pl-6 mb-5 space-y-2">
            {section.items?.map((item, i) => (
              <li key={i} className="text-blue-100">{item}</li>
            ))}
          </ul>
        );
      default:
        return null;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-blue-200">Loading events...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Error Loading Events</h2>
          <p className="text-blue-100 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-6 rounded-lg transition-colors duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
              src="./images/Plexus White.png"
              alt="MRCE College Logo" 
              className="h-36 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallbackText = document.createElement('span');
                fallbackText.textContent = 'PLEXUS';
                fallbackText.className = 'font-bold text-4xl text-white';
                e.currentTarget.parentNode?.appendChild(fallbackText);
              }}
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
              {/* Event Image and Status Badge */}
              <div className="h-80 overflow-hidden relative">
                {!imageFallbacks[selectedEvent.image] ? (
                  <img 
                    src={resolveImagePath(selectedEvent.image)} 
                    alt={selectedEvent.name} 
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(selectedEvent.image)}
                  />
                ) : (
                  <div className="w-full h-full bg-blue-900/50 flex items-center justify-center">
                    <span className="text-2xl font-bold">{selectedEvent.name}</span>
                  </div>
                )}
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(selectedEvent.status)}`}>
                  {getStatusLabel(selectedEvent.status)}
                </div>
              </div>
              
              <div className="p-8">
                <div className="flex flex-col md:flex-row items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold">{selectedEvent.name}</h2>
                  
                  {/* Event Logo */}
                  {selectedEvent.logo && !imageFallbacks[selectedEvent.logo] && (
                    <img 
                      src={resolveImagePath(selectedEvent.logo)} 
                      alt={`${selectedEvent.name} Logo`} 
                      className="h-10 mt-4 md:mt-0"
                      onError={() => handleImageError(selectedEvent.logo!)}
                    />
                  )}
                </div>
                
                {/* Event Description - Enhanced with sections */}
                <div className="mb-8">
                  {selectedEvent.description.map((section, index) => 
                    renderDescriptionSection(section, index)
                  )}
                </div>
                
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
                      <Calendar className="w-6 h-6 text-blue-400 mt-0.5 flex-shrink-0" />
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
                      <p className="text-sm text-blue-200 font-medium">
                        {registrationStatus[selectedEvent.id]?.isOpen 
                          ? "Registration Closes In" 
                          : "Registration Status"}
                      </p>
                      <div className="flex items-center">
                        <p className="font-mono text-xl">
                          {registrationStatus[selectedEvent.id]?.isOpen 
                            ? countdowns[selectedEvent.id] || "Loading..." 
                            : registrationStatus[selectedEvent.id]?.message}
                        </p>
                        {!registrationStatus[selectedEvent.id]?.isOpen && (
                          <Info className="ml-2 w-5 h-5 text-blue-300" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <a
                  href={registrationStatus[selectedEvent.id]?.isOpen ? selectedEvent.registrationLink : "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block w-full text-center text-white py-4 px-6 rounded-lg transition-all duration-300 text-lg font-medium ${
                    registrationStatus[selectedEvent.id]?.isOpen 
                      ? "bg-blue-600 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-600/30" 
                      : "bg-gray-600 cursor-not-allowed"
                  }`}
                  onClick={e => {
                    if (!registrationStatus[selectedEvent.id]?.isOpen) {
                      e.preventDefault();
                    }
                  }}
                >
                  {registrationStatus[selectedEvent.id]?.isOpen 
                    ? <>Register Now <ExternalLink className="inline-block ml-2 w-5 h-5" /></>
                    : registrationStatus[selectedEvent.id]?.message}
                </a>
              </div>
            </div>
          </div>
        ) : (
          // Events List - Grid for multiple events
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map(event => (
              <div 
                key={event.id} 
                className="bg-white/5 rounded-xl overflow-hidden backdrop-blur-sm border border-white/10 hover:border-blue-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
              >
                {/* Event Image and Status Badge */}
                <div className="h-48 overflow-hidden relative">
                  {!imageFallbacks[event.image] ? (
                    <img 
                      src={resolveImagePath(event.image)} 
                      alt={event.name} 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      onError={() => handleImageError(event.image)}
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-900/50 flex items-center justify-center">
                      <span className="text-xl font-bold">{event.name}</span>
                    </div>
                  )}
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(event.status)}`}>
                    {getStatusLabel(event.status)}
                  </div>
                </div>
                
                {/* Event Title and Buttons */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold truncate">{event.name}</h2>
                    
                    {/* Event Logo */}
                    {event.logo && !imageFallbacks[event.logo] && (
                      <img 
                        src={resolveImagePath(event.logo)} 
                        alt={`${event.name} Logo`} 
                        className="h-6"
                        onError={() => handleImageError(event.logo!)}
                      />
                    )}
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => viewEventDetails(event.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-900/50 hover:bg-blue-800 text-white py-2 px-3 rounded-lg transition-all duration-300"
                    >
                      Details
                      <ChevronDown size={16} className="transition-transform duration-300" />
                    </button>
                    
                    <a
                      href={registrationStatus[event.id]?.isOpen ? event.registrationLink : "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all duration-300 ${
                        registrationStatus[event.id]?.isOpen 
                          ? "bg-blue-600 hover:bg-blue-500 text-white" 
                          : "bg-gray-600 text-white/80 cursor-not-allowed"
                      }`}
                      onClick={e => {
                        if (!registrationStatus[event.id]?.isOpen) {
                          e.preventDefault();
                        }
                      }}
                    >
                      {registrationStatus[event.id]?.isOpen 
                        ? <>Register <ExternalLink size={16} /></>
                        : <>{registrationStatus[event.id]?.message || "Coming Soon"}</>}
                    </a>
                  </div>
                  
                  {/* Preview Info */}
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-blue-200 truncate">{event.venue}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-400" />
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
            src="./images/mrce.png"
            alt="MRCE Logo" 
            className="h-24 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallbackText = document.createElement('span');
              fallbackText.textContent = 'MRCE';
              fallbackText.className = 'font-bold text-2xl text-white';
              e.currentTarget.parentNode?.appendChild(fallbackText);
            }}
          />
          <img 
            src="./images/Plexus White.png"
            alt="Plexus Logo" 
            className="h-24 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallbackText = document.createElement('span');
              fallbackText.textContent = 'PLEXUS';
              fallbackText.className = 'font-bold text-2xl text-white';
              e.currentTarget.parentNode?.appendChild(fallbackText);
            }}
          />
          <img 
            src="./images/aiml.png"
            alt="AIML Logo" 
            className="h-24 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallbackText = document.createElement('span');
              fallbackText.textContent = 'AIML';
              fallbackText.className = 'font-bold text-2xl text-white';
              e.currentTarget.parentNode?.appendChild(fallbackText);
            }}
          />
        </div>
        <p>© 2025 Plexus Club - MRCE College. </p>
      </footer>
      
      {/* Add CSS for float animation */}
      <style>{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
          }
          33% {
            transform: translateY(-50px) translateX(50px);
          }
          66% {
            transform: translateY(30px) translateX(-30px);
          }
          100% {
            transform: translateY(0) translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

export default App;