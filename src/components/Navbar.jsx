import gsap from "gsap";
import { useWindowScroll } from "react-use";
import { useEffect, useRef, useState } from "react";

const navItems = [
  { label: "Home", id: "hero" },
  { label: "About", id: "about" },
  { label: "Recommendations", id: "recommendations" },
  { label: "Contact", id: "contact" },
  { label: "Footer", id: "footer" },
];

const NavBar = () => {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isIndicatorActive, setIsIndicatorActive] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const audioElementRef = useRef(null);
  const navContainerRef = useRef(null);
  const { y: currentScrollY } = useWindowScroll();

  const toggleAudioIndicator = () => {
    setIsAudioPlaying((prev) => !prev);
    setIsIndicatorActive((prev) => !prev);
  };

  useEffect(() => {
    if (isAudioPlaying) {
      audioElementRef.current.play();
    } else {
      audioElementRef.current.pause();
    }
  }, [isAudioPlaying]);

  useEffect(() => {
    if (currentScrollY === 0) {
      setIsNavVisible(true);
      navContainerRef.current.classList.remove("floating-nav");
    } else if (currentScrollY > lastScrollY) {
      setIsNavVisible(false);
      navContainerRef.current.classList.add("floating-nav");
    } else if (currentScrollY < lastScrollY) {
      setIsNavVisible(true);
      navContainerRef.current.classList.add("floating-nav");
    }

    setLastScrollY(currentScrollY);
  }, [currentScrollY, lastScrollY]);

  useEffect(() => {
    gsap.to(navContainerRef.current, {
      y: isNavVisible ? 0 : -100,
      opacity: isNavVisible ? 1 : 0,
      duration: 0.2,
    });
  }, [isNavVisible]);

  const handleScrollTo = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div ref={navContainerRef} className="fixed inset-x-0 top-4 z-50 h-16 border-none transition-all duration-700 sm:inset-x-6 bg-transparent backdrop-blur-md">
      <header className="absolute top-1/2 w-full -translate-y-1/2">
        <nav className="flex size-full items-center justify-between p-4">
          <div className="flex items-center gap-7">
          <img src="/img/logo.png" alt="Insight Logo" className="w-10" />
          </div>
          <div className="flex h-full items-center">
            <div className="hidden md:flex gap-6">
              {navItems.map(({ label, id }) => (
                <button key={id} onClick={() => handleScrollTo(id)} className="nav-hover-btn transition duration-300">{label}</button>
              ))}
            </div>
            <button onClick={toggleAudioIndicator} className="ml-10 flex items-center space-x-0.5">
              <audio ref={audioElementRef} className="hidden" src="/audio/loop.mp3" loop />
              {[1, 2, 3, 4].map((bar) => (
                <div key={bar} className={`indicator-line ${isIndicatorActive ? "active" : ""}`} style={{ animationDelay: `${bar * 0.1}s` }} />
              ))}
            </button>
          </div>
        </nav>
      </header>
    </div>
  );
};

export default NavBar;
