import { useNavigate } from "@tanstack/react-router";

function getCssVariable(variableName) {
  return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
}

function Hero() {
    const navigate = useNavigate();
    const circles = [
        { size: 800, backgroundColor: getCssVariable('--razacy-rozowy'), zIndex: -2 },
        { size: 1000, backgroundColor: getCssVariable('--ciemniejszy-rozowy'), zIndex: -3 },
        { size: 1200, backgroundColor: getCssVariable('--jeszcze-ciemniejszy-rozowy'), zIndex: -4 },
        { size: 1400, backgroundColor: getCssVariable('--jasny-fioletowy'), zIndex: -5 },
        { size: 1600, backgroundColor: getCssVariable('--bardziej-jasny-fioletowy'), zIndex: -6 },
      ];
    
      return (
        <div className="main-page-container">
          {circles.map((circle, index) => (
            <div
              key={index}
              className="background-circle"
              style={{
                width: `${circle.size}px`,
                height: `${circle.size}px`,
                backgroundColor: circle.backgroundColor,
                zIndex: circle.zIndex,
              }}
            >
              {index === 0 && (
                <>
                  {/* Ikonki na pierwszym okręgu */}
                  <i className="bi bi-tv circle-icon" style={{ top: '25%', left: '5%' }}></i>
                  <i className="bi bi-upload circle-icon" style={{ top: '25%', left: '95%' }}></i>
                  <i className="bi bi-windows circle-icon" style={{ top: '100%', left: '50%' }}></i>
                </>
              )}
              {index === 1 && (
                <>
                  {/* Ikonki na drugim okręgu */}
                  <i className="bi bi-flag circle-icon" style={{ top: '0%', left: '50%' }}></i>
                  <i className="bi bi-share-fill circle-icon" style={{ top: '50%', left: '0%' }}></i>
                  <i className="bi bi-reply circle-icon" style={{ top: '50%', left: '100%' }}></i>
                  <i className="bi bi-tiktok circle-icon" style={{ top: '85%', left: '85%' }}></i>
                  <i className="bi bi-suit-heart-fill circle-icon" style={{ top: '85%', left: '15%' }}></i>
                </>
              )}
            </div>
          ))}
          <div className="main-page-title">
            <i className="bi bi-heart me-2"></i>
            <span>Vibe</span>
          </div>
          <div className="main-page-subtitle">
            <span>We absolutely do not copy reddit</span>
          </div>
          <button
            className="btn btn-primary btn-welcome"
            onClick={() => navigate({to: "/login"})}
          >
            Bądź częścią naszej społeczności
            <i className="bi bi-arrow-up-right ms-2"></i>
          </button>
        </div>
      );
}

export default Hero;