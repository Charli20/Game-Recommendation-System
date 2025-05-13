import { useState, useRef } from "react";
import axios from "axios";

export const BentoTilt = ({ children, className = "" }) => {
  const [transformStyle, setTransformStyle] = useState("");
  const itemRef = useRef(null);

  const handleMouseMove = (event) => {
    if (!itemRef.current) return;
    const { left, top, width, height } = itemRef.current.getBoundingClientRect();
    const relativeX = (event.clientX - left) / width;
    const relativeY = (event.clientY - top) / height;
    const tiltX = (relativeY - 0.5) * 5;
    const tiltY = (relativeX - 0.5) * -5;
    setTransformStyle(
      `perspective(700px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(.95, .95, .95)`
    );
  };

  const handleMouseLeave = () => setTransformStyle("");

  return (
    <div ref={itemRef} className={className} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ transform: transformStyle }}>{children}</div>
  );
};

const Features = () => {
  const [query, setQuery] = useState("");
  const [tone, setTone] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/recommend", { query, tone });
      setRecommendations(response.data.recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="recommendations" className="bg-black min-h-screen pb-32 pt-32">
      <div className="container mx-auto px-4 md:px-10">
        <div className="text-center mb-10 animate-fadeInUp">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2"> Choose your favorite game and mood</h2>
          <p className="text-gray-400 text-md md:text-lg"> Get personalized gaming recommendations based on your taste and emotion. </p>
        </div>
        <div className="mb-14 flex flex-col items-center justify-center gap-5 md:flex-row animate-slideUp">
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Enter game or theme..." className="w-72 rounded-lg border border-gray-300 bg-white px-5 py-3 text-black shadow-md transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300"/>
          <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-60 rounded-lg border border-gray-300 bg-white px-4 py-3 text-black shadow-md transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="">Select Emotion</option>
            <option value="happy">Happy</option>
            <option value="sad">Sad</option>
            <option value="angry">Angry</option>
            <option value="surprising">Surprise</option>
            <option value="suspenseful">Suspenseful</option>
          </select>
          <button onClick={fetchRecommendations} className="rounded-lg bg-blue-600 px-6 py-3 text-white shadow-md transition duration-300 hover:bg-blue-700 hover:shadow-lg">
            {loading ? "Loading..." : "Get Recommendations"}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
          {recommendations.length > 0 ? (
            recommendations.map((game, index) => (
              <BentoTilt key={index}>
                <div className="relative h-full overflow-hidden rounded-md bg-zinc-900 p-5 text-white shadow-lg transition hover:shadow-xl">
                  <img src={game.header_image} alt={game.title} className="mb-3 h-40 w-full rounded-md object-cover"/>
                  <h1 className="text-lg font-bold">{game.title}</h1>
                  <p className="text-sm opacity-70">Released: {game.release_date}</p>
                  <p className="text-sm opacity-70">Price: {game.price}</p>
                  <p className="text-sm opacity-70 mb-2">Developer: {game.developer}</p>
                  <p className="text-sm mb-3">{game.description}</p>
                  <div className="flex gap-2 flex-wrap">
                    {game.videos && (
                      <a href={game.videos} target="_blank" rel="noopener noreferrer" className="rounded bg-purple-600 px-3 py-1 text-xs hover:bg-purple-700">View Movie</a>
                    )}
                    {game.screenshots?.length > 0 && (
                      <a href={game.screenshots[0]} target="_blank" rel="noopener noreferrer" className="rounded bg-green-600 px-3 py-1 text-xs hover:bg-green-700">View Screenshot</a>
                    )}
                  </div>
                </div>
              </BentoTilt>
            ))
          ) : (
            !loading && (
              <p className="col-span-3 text-center text-white">No recommendations found.</p>
            )
          )}
        </div>
      </div>
    </section>
  );
};

export default Features;

