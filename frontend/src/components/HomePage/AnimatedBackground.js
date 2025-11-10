import React, { useEffect, useState } from 'react';
import './AnimatedBackground.css';

const AnimatedBackground = () => {
  const [icons, setIcons] = useState([]);

  useEffect(() => {
    const iconPaths = [
      '/boxing.png',
      '/famu.png',
      '/fsu.png',
      '/famu-fsu.png'
    ];

    let counter = 0;

    const createIcon = (startTime = 0) => {
      counter++;
      const newIcon = {
        id: `icon-${Date.now()}-${counter}-${Math.random()}`, // Guaranteed unique ID
        icon: iconPaths[Math.floor(Math.random() * iconPaths.length)],
        left: Math.random() * 100,
        animationDuration: 12, // Faster 12 seconds for better flow rate
        size: Math.random() * 50 + 25, // 25-75px
        opacity: Math.random() * 0.4 + 0.15, // 0.15-0.55 opacity
        rotation: Math.random() * 360,
        delay: startTime, // Staggered start times instead of random delays
        createdAt: Date.now(),
        startTime: Date.now() + (startTime * 1000) // Track when animation actually starts
      };
      return newIcon;
    };

    // Create initial icons with staggered start times for smooth flow
    const initialIcons = Array.from({ length: 40 }, (_, index) =>
      createIcon(index * 0.3) // Each icon starts 0.3 seconds after the previous one
    );
    setIcons(initialIcons);

    // Add single new icons periodically for denser flow
    const interval = setInterval(() => {
      setIcons(prevIcons => {
        const currentTime = Date.now();

        // Remove icons based on invisible barrier (when they reach 90vh position)
        const filteredIcons = prevIcons.filter(icon => {
          const timeSinceStart = currentTime - icon.startTime;
          const animationProgress = timeSinceStart / (icon.animationDuration * 1000);
          // Remove when icon reaches 90vh (invisible barrier)
          return animationProgress < 0.9;
        });

        // Add one new icon if we have less than 40
        if (filteredIcons.length < 40) {
          const newIcon = createIcon(0); // New icons start immediately
          return [...filteredIcons, newIcon];
        }
        return filteredIcons;
      });
    }, 350); // Add one new icon every 0.35 seconds for denser flow

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="animated-background">
      {icons.map(icon => (
        <div
          key={icon.id}
          className="falling-icon"
          style={{
            left: `${icon.left}%`,
            animationDuration: `${icon.animationDuration}s`,
            animationDelay: `${icon.delay}s`,
            width: `${icon.size}px`,
            height: `${icon.size}px`,
            opacity: icon.opacity,
            transform: `rotate(${icon.rotation}deg)`
          }}
        >
          <img
            src={`${process.env.PUBLIC_URL}${icon.icon}`}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default AnimatedBackground;