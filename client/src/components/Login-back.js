import React from "react";

const Background = ({ image }) => {
  const backgroundStyle = {
    position: "fixed",
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundImage: `url('/${image}')`, // ✅ Loads from public/
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    zIndex: -1, // ✅ Ensures it stays behind content
  };

  return <div style={backgroundStyle} />;
};

export default Background;
