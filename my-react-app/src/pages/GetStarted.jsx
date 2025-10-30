import React, { useEffect } from "react";
import LiquidBackground from "https://cdn.jsdelivr.net/npm/threejs-components@0.0.22/build/backgrounds/liquid1.min.js";
import "../styles/GetStarted.css";

const GetStarted = () => {
  useEffect(() => {
    const app = LiquidBackground(document.getElementById("canvas"));
    app.liquidPlane.material.metalness = 0.75;
    app.liquidPlane.material.roughness = 0.25;
    app.liquidPlane.uniforms.displacementScale.value = 5;
    app.setRain(false);

    // Clean up on component unmount
    return () => {
      app.dispose?.();
    };
  }, []);

  return (
    <div className="getstarted-container">
      <canvas id="canvas" className="liquid-canvas"></canvas>

      <div className="overlay">
        <h6 className="title">GLNDRS POOL</h6>
        <p className="subtitle">
          Stake. Earn. Grow your crypto in the wave of liquidity.
        </p>
        <button
          className="getstarted-btn"
          onClick={() => (window.location.href = "/dashboard")}
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default GetStarted;
