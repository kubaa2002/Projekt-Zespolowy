import { useState, useEffect } from "react";

const COOKIE_KEY = "cookieGDPRConsentAccepted";

export default function CookieGDPRConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(COOKIE_KEY);
    if (!accepted) setVisible(true);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem(COOKIE_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      background: "#222",
      color: "#fff",
      padding: "1rem",
      zIndex: 9999,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "1rem"
    }}>
      <span>
        Ta strona używa niezbędnych plików cookie, aby zapewnić podstawową funkcjonalność korzystania z serwisu. Dodatkowo 
        przechowujemy informacje które zostaną nam podane przy rejestracji. Więcej informacji na temat przetwarzania danych
        osobowych znajdziesz w naszej <a href="/privacypolicy" style={{ color: "#4CAF50" }}>Polityce Prywatności</a>.
      </span>
      <button className="btn btn-primary" onClick={acceptCookies}>
        Akceptuję
      </button>
    </div>
  );
}