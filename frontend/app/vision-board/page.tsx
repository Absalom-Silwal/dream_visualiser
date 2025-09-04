"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Add custom styles for animations
const customStyles = `
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes scale-up {
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
  }
  
  @keyframes bounce-in {
    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.3); }
    50% { transform: translate(-50%, -50%) scale(1.05); }
    70% { transform: translate(-50%, -50%) scale(0.9); }
    100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  }
  
  @keyframes slide-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-fade-in {
    animation: fade-in 0.6s ease-out;
  }
  
  .animate-scale-up {
    animation: scale-up 0.8s ease-out;
  }
  
  .animate-bounce-in {
    opacity: 0;
    animation: bounce-in 0.8s ease-out forwards;
  }
  
  .animate-slide-up {
    opacity: 0;
    animation: slide-up 0.6s ease-out forwards;
  }
`;

interface UserData {
  role: string;
  who: string;
  goal: string;
  health: string;
}

interface Milestone {
  milestone: string;
  vision: string;
  imagePrompt: string;
  images: Array<{ url: string }>;
}

interface GeneratedImage {
  response: {
    milestones: Milestone[];
  };
}

export default function VisionBoard() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [additionalText, setAdditionalText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Add custom styles to document head
    const styleElement = document.createElement('style');
    styleElement.textContent = customStyles;
    document.head.appendChild(styleElement);

    // Retrieve user data from localStorage
    const storedData = localStorage.getItem("userData");
    if (storedData) {
      setUserData(JSON.parse(storedData));
    } else {
      // If no data, redirect back to home
      router.push("/");
    }
    setIsLoading(false);

    // Cleanup styles on unmount
    return () => {
      if (styleElement && document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, [router]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdditionalText(e.target.value);
  };

  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateImage = async () => {
    if (!userData) return;

    setIsGenerating(true);
    console.log(userData);
    try {
      const response = await fetch(
        "http://localhost:3001/generate-story-card",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role: userData.role,
            who: userData.who,
            goal: userData.goal,
            health: userData.health,
            additionalText: additionalText,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const data = await response.json();
      setGeneratedImage(data);
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[url('/background.svg')] bg-cover bg-center">
        <div className="text-white text-xl">Loading your vision board...</div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  // Loading screen for image generation
  if (isGenerating) {
    return (
      <div className="min-h-screen bg-[url('/background.svg')] bg-cover bg-center bg-no-repeat flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-300 mx-auto mb-4"></div>
          <div className="text-white text-xl font-semibold">
            crafting and unlocking visions made just for you ...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[url('/background.svg')] bg-cover bg-center bg-no-repeat p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto min-h-screen flex flex-col">
        {/* Header with Logo */}
        <div className="relative flex items-center justify-center mb-6">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Image
              src="/onlyUlogo.png"
              alt="OnlyU Logo"
              width={60}
              height={60}
              className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12"
            />
            <h1 className="text-white text-lg sm:text-xl lg:text-2xl font-bold">
              OnlyU Vision Board
            </h1>
          </div>
          <button
            onClick={() => router.push("/")}
            className="absolute right-0 text-white hover:text-gray-300 transition-colors text-sm sm:text-base"
          >
            ← Back
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* User's Vision Text - Centered */}
          <div className="flex-1 flex items-center justify-center p-2 sm:p-4 pb-16">
            <div className="text-center max-w-6xl mx-auto relative w-full">
              {generatedImage ? (
                <div className="space-y-6 animate-fade-in">
                  <div className="p-4 sm:p-6 lg:p-8 mb-2">
                    
                    {/* Mind Map Layout - Desktop */}
                    <div className="relative min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] items-center justify-center overflow-visible hidden sm:flex">
                      {/* Center User Vision Card */}
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20 z-10 relative animate-scale-up max-w-xs sm:max-w-sm">
                        <h3 className="text-white text-base sm:text-lg lg:text-xl font-bold mb-3">
                          Your Vision
                        </h3>
                        <div className="space-y-2 text-white text-xs sm:text-sm">
                          <p>
                            <span className="font-semibold">I want to be a {userData.role} who {userData.who}.</span>
                          </p>
                          <p>
                            <span className="font-semibold">My goal is to {userData.goal}</span>
                          </p>
                          {additionalText && (
                            <p className="text-purple-200/80 text-xs">
                              <span className="font-semibold">{additionalText}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Milestone Images with Connecting Lines */}
                      {generatedImage.response.milestones.map((milestone, index) => {
                        // Calculate position for two-column layout (left and right)
                        const isLeftColumn = index < Math.ceil(generatedImage.response.milestones.length / 2);
                        const columnIndex = isLeftColumn ? index : index - Math.ceil(generatedImage.response.milestones.length / 2);
                        const yOffset = (columnIndex - Math.floor(generatedImage.response.milestones.length / 4)) * 200; // Vertical spacing
                        
                        return (
                          <div
                            key={index}
                            className="absolute animate-bounce-in"
                            style={{
                              left: `calc(50% + ${isLeftColumn ? -420 : 420}px)`, // Left column is much further (-420px), right stays at 420px
                              top: `calc(${index % 2 == 1 ? '80%' : '50%'} + ${yOffset}px)`,
                              transform: 'translate(-50%, -50%)',
                              animationDelay: `${index * 0.2}s`,
                            }}
                          >
                            {/* Milestone Card */}
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 w-88">
                              {milestone.images && (
                                <div className="relative w-full h-40 mb-3">
                                  <Image
                                    src={milestone.images[0]['url']}
                                    alt={`${milestone.milestone} visualization`}
                                    fill
                                    className="object-cover rounded-lg"
                                  />
                                </div>
                              )}
                              <div className="text-center">
                                <h4 className="text-purple-900 text-sm font-bold mb-2">
                                  {milestone.milestone}
                                </h4>
                                <p className="text-white/80 text-s text-start">
                                  {milestone.vision}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Mobile Layout - Cards below center card */}
                    <div className="sm:hidden">
                      {/* Mobile Vision Card */}
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 animate-scale-up mb-6">
                        <h3 className="text-white text-lg font-bold mb-3 text-center">
                          Your Vision
                        </h3>
                        <div className="space-y-2 text-white text-sm">
                          <p>
                            <span className="font-semibold">I want to be a {userData.role} who {userData.who}.</span>
                          </p>
                          <p>
                            <span className="font-semibold">My goal is to {userData.goal}</span>
                          </p>
                          {additionalText && (
                            <p className="text-purple-300/60 text-sm">
                              <span className="font-semibold">{additionalText}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Mobile milestone cards */}
                      <div className="space-y-4">
                        {generatedImage.response.milestones.map((milestone, index) => (
                          <div
                            key={index}
                            className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 animate-slide-up"
                            style={{
                              animationDelay: `${index * 0.2}s`,
                            }}
                          >
                            {milestone.images && (
                              <div className="relative w-full h-48 mb-3">
                                <Image
                                  src={milestone.images[0]['url']}
                                  alt={`${milestone.milestone} visualization`}
                                  fill
                                  className="object-cover rounded-lg"
                                />
                              </div>
                            )}
                            <div className="text-center">
                              <h4 className="text-purple-200 text-base font-bold mb-2">
                                {milestone.milestone}
                              </h4>
                              <p className="text-white/80 text-sm text-start">
                                {milestone.vision}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/20 max-w-2xl mx-auto">
                  <h2 className="text-white text-2xl sm:text-3xl font-bold mb-6">
                    Your Vision
                  </h2>
                  <div className="space-y-4 text-white text-base sm:text-lg">
                    <p>
                      <span className="font-semibold">I want to be a</span>{" "}
                      <span className="text-yellow-300">{userData.role}</span>{" "}
                      <span className="font-semibold">who</span>{" "}
                      <span className="text-yellow-300">{userData.who}</span>
                    </p>
                    <p>
                      <span className="font-semibold">
                        My personal goal is to
                      </span>{" "}
                      <span className="text-yellow-300">{userData.goal}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Input Field at Bottom - Always Fixed */}
        <div className="mt-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <input
                type="text"
                value={additionalText}
                onChange={handleTextChange}
                placeholder="Add more details to your vision... (e.g., specific goals, dreams, aspirations)"
                className="flex-1 bg-white/20 border border-white/30 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-gray-700 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent text-sm sm:text-base min-h-[44px]"
              />
              <button
                onClick={handleGenerateImage}
                disabled={isGenerating}
                className={`font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors duration-200 text-sm sm:text-base min-h-[44px] whitespace-nowrap ${
                  isGenerating
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-yellow-500 hover:bg-yellow-600"
                } text-black`}
              >
                {isGenerating ? "Generating..." : "Generate Image"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
