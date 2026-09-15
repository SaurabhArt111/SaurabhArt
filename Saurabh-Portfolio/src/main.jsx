import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { LanguageProvider } from "./lib/i18n";
import { ThemeProvider } from "./lib/theme";
import SmoothScroll from "./components/layout/SmoothScroll";
import { PERSON, SITE_URL } from "./lib/site";

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: PERSON.name,
  jobTitle: PERSON.jobTitle,
  url: SITE_URL,
  sameAs: PERSON.sameAs,
  ...(PERSON.email ? { email: `mailto:${PERSON.email}` } : {}),
  ...(PERSON.location ? { address: { "@type": "PostalAddress", addressCountry: PERSON.location } } : {}),
};

const ld = document.createElement("script");
ld.type = "application/ld+json";
ld.textContent = JSON.stringify(personJsonLd);
document.head.appendChild(ld);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <SmoothScroll>
            <App />
          </SmoothScroll>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
