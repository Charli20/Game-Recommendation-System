import AnimatedTitle from "./AnimatedTitle";

const About = () => {
  return (
    <div
      id="about"
      className="min-h-[120vh] w-full bg-cover bg-center flex flex-col items-center justify-start pt-32 pb-24"
      style={{backgroundImage: "url('/img/image1.jpg')",}}
    >
      <div className="text-white text-center flex flex-col items-center gap-8 px-6 z-10">
        <AnimatedTitle 
          title="Let’s Level Up Your Pc and Mobile Gaming Experience with  InsightCorp Gaming!" containerClass="!text-white text-center"/>
        <div className="mt-24 z-10">
        <img src="/img/Insight..png" alt="InsightCorp Logo" className="w-96 h-96 rounded-full object-cover shadow-lg transition duration-300 ease-in-out hover:shadow-[0_0_100px_35px_rgba(255,255,255,0.9)]"/>
        </div>

        <div className="bg-black/60 backdrop-blur-md px-12 py-10 rounded-2xl max-w-5xl">
          <p className="text-2xl font-semibold mb-4">InsightCorp is an intelligent Steam game recommendation system</p>
          <p className="text-gray-200 text-lg leading-relaxed">Designed to match players with the perfect games based on their preferences, moods, and play styles. Whether you're into high-octane action, immersive storytelling, or cozy simulations, InsightCorp curates a personalized list to make sure you never waste time picking the next game just dive in and play.</p>
        </div>
      </div>
    </div>
  );
};

export default About;
