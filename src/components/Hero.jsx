import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
import { useEffect, useState, useRef } from "react";
import Button from "./Button";

gsap.registerPlugin(ScrollTrigger);
const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [loading, setLoading] = useState(true);
  const totalVideos = 7;
  const videoRef = useRef(null);
  useEffect(() => {
    const unmuteOnFirstLoad = () => {
      if (videoRef.current) {
        videoRef.current.muted = false;
      }
    };
    unmuteOnFirstLoad();
  }, []);
  const handleVideoLoad = () => {
    setLoading(false); 
  };
  const handleVideoEnd = () => {
    setCurrentIndex((prevIndex) => {
      return prevIndex === totalVideos ? 1 : prevIndex + 1;
    });
  };

  useEffect(() => {
    if (loading) return;

    gsap.fromTo(videoRef.current, { opacity: 0 }, { opacity: 1, duration: 1, ease: "power1.out" });
  }, [currentIndex, loading]);

  useGSAP(() => {
    gsap.set("#video-frame", { clipPath: "polygon(14% 0, 72% 0, 88% 90%, 0 95%)", borderRadius: "0% 0% 40% 10%", });
    gsap.from("#video-frame", { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", borderRadius: "0% 0% 0% 0%", ease: "power1.inOut", scrollTrigger: { trigger: "#video-frame", start: "center center", end: "bottom center", scrub: true,
      },
    });
    ScrollTrigger.create({trigger: "#hero-section",start: "bottom top",end: "bottom center",onEnter: () => {
        if (videoRef.current) {
          videoRef.current.muted = true;
        }
      },onLeaveBack: () => {
        if (videoRef.current) {
          videoRef.current.muted = false;
        }
      },
    });
  }, [loading]);

  const getVideoSrc = (index) => `/videos/hero-${index}.mp4`;
  const changeVideo = (direction) => {
    setLoading(true);
    setCurrentIndex((prevIndex) => {
      if (direction === "next") {
        return prevIndex === totalVideos ? 1 : prevIndex + 1;
      } else if (direction === "prev") {
        return prevIndex === 1 ? totalVideos : prevIndex - 1;
      }
      return prevIndex;
    });
  };

  return (
    <div id="hero-section" className="relative h-screen w-full overflow-x-hidden">
      {loading && (
        <div className="flex justify-center items-center absolute z-[100] h-screen w-full bg-violet-50">
          <div className="three-body">
            <div className="three-body__dot"></div>
            <div className="three-body__dot"></div>
            <div className="three-body__dot"></div>
          </div>
        </div>
      )}

      <div id="video-frame" className="relative z-10 h-screen w-full overflow-hidden rounded-lg bg-blue-75">
        <video ref={videoRef} src={getVideoSrc(currentIndex)} autoPlay loop={false} muted={false} playsInline onLoadedData={handleVideoLoad} onEnded={handleVideoEnd} className="absolute left-0 top-0 w-full h-full object-cover object-center"/>
        <div className="absolute bottom-10 right-10 z-40 text-right">
          <p className="text-blue-100 text-2xl font-robert-regular">InsightCorp Gaming</p>
        </div>

        <div className="absolute top-1/2 left-4 transform -translate-y-1/2 z-50">
        <button className="text-white bg-black rounded-full p-2" onClick={() => changeVideo("prev")}>{"<"}</button>
        </div>
        <div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-50">
        <button className="text-white bg-black rounded-full p-2" onClick={() => changeVideo("next")}>{">"}</button>
        </div>
      </div>
    </div>
  );
};

export default Hero;

