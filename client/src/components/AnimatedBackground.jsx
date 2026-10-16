import React from "react";
import "./AnimatedBackground.css";

const AnimatedBackground = () => {
  return (
    <div className="enviro-3d-background" aria-hidden="true">
      {/* Perspective grid */}
      <div className="enviro-grid"></div>

      {/* Floating 3D spheres */}
      <div className="enviro-orb orb-one"></div>
      <div className="enviro-orb orb-two"></div>
      <div className="enviro-orb orb-three"></div>
      <div className="enviro-orb orb-four"></div>

      {/* Environmental lighting */}
      <div className="enviro-light light-one"></div>
      <div className="enviro-light light-two"></div>

      {/* Floating particles */}
      <div className="enviro-particle particle-one"></div>
      <div className="enviro-particle particle-two"></div>
      <div className="enviro-particle particle-three"></div>
      <div className="enviro-particle particle-four"></div>
      <div className="enviro-particle particle-five"></div>
    </div>
  );
};

export default AnimatedBackground;