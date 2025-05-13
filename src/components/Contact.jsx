import Tilt from "react-parallax-tilt";
import Button from "./Button";
import { FaInstagram, FaLinkedin, FaGithub, FaXTwitter } from "react-icons/fa6";

const Contact = () => {
  return (
    <div id="contact" className="my-20 min-h-96 w-screen px-10">
      <div className="relative flex flex-col lg:flex-row justify-between items-center rounded-lg bg-black py-24 text-blue-50 sm:overflow-hidden px-6">
        <div className="w-full lg:w-1/2 flex justify-center mb-10 lg:mb-0">
          <Tilt glareEnable={true} glareMaxOpacity={0.4} scale={1.05} transitionSpeed={1500} tiltMaxAngleX={20} tiltMaxAngleY={20} className="rounded-xl overflow-hidden shadow-2xl">
            <img src="/img/image3.jpg" alt="Contact Visual" className="w-[350px] h-[350px] object-cover rounded-xl"/>
          </Tilt>
        </div>
        <div className="w-full lg:w-1/2 text-left px-4 lg:px-10">
          <p className="text-base md:text-lg lg:text-xl font-medium mb-6 leading-relaxed text-white">This web application was created as part of my{" "}<strong>Advanced Programming for Data Analytics</strong> assignment.It's also added to my personal project portfolio to build a strong presence in the ICT field. I built this project by exploring resources and tutorials from several creators—especially the amazing{" "}
              <a href="https://www.youtube.com/@javascriptmastery" target="_blank" rel="noopener noreferrer" className="text-blue-300 underline">JavaScript Mastery</a>{" "} YouTube channel and with the guidance of my tutor Mr. Yasas Palliyaguruge. I combined their knowledge with my personal touch and creativity. Big shoutout to both for their incredible support and inspiration!
          </p>
          <Button title="contact us" containerClass="mb-10 cursor-pointer" />
          <div className="flex gap-8 text-3xl text-blue-100">
            <a href="https://www.instagram.com/_chaliya___20/?igsh=MW1jNDN3cTR3M3I3Yg%3D%3D#" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram className="hover:text-pink-500 transition duration-300" />
            </a>
            <a href="https://www.linkedin.com/in/chalidu-wijekoon-656118262" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FaLinkedin className="hover:text-blue-500 transition duration-300" />
            </a>
            <a href="https://github.com/Charli20" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <FaGithub className="hover:text-gray-300 transition duration-300" />
            </a>
            <a href="https://x.com/ChaliduW" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
              <FaXTwitter className="hover:text-blue-400 transition duration-300" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
