import { useEffect, useState } from "react";
import { EtCaptcha } from "ethiopian-captcha/react";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:5501";
const TYPES = [
  ["fidel", "Fidel"],
  ["geez-math", "Ge'ez math"],
  ["click-image", "Click-image"],
];

const serverSnippet = `import { createCaptcha } from "ethiopian-captcha";

const captcha = createCaptcha({ secret: process.env.CAPTCHA_SECRET });

// Generate: "fidel" | "geez-math" | "click-image"
const challenge = await captcha.generate("fidel");
// { success, type, captchaId, image, expiresAt }

// Validate (single-use)
const result = await captcha.validate(challenge.captchaId, userInput);

if (result.success) {
  console.log("Captcha verified");
} else {
  console.log(result.code, result.message);
}`;

const reactSnippet = `import { EtCaptcha } from "ethiopian-captcha/react";

<EtCaptcha
  challenge={challenge}
  loading={loading}
  onRefresh={fetchChallenge}
  onVerify={({ captchaId, input }) => verify(captchaId, input)}
/>`;

function App() {
  const [captchaData, setCaptchaData] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("fidel");

  const fetchCaptcha = async () => {
    try {
      setLoading(true);
      setMessage("loading");

      const res = await fetch(
        `${API}/captcha`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type }),
        },
      );
      const data = await res.json();
      setCaptchaData(data);
      setMessage("");

      setLoading(false);
    } catch (error) {
      console.error("Error loading CAPTCHA", error);
      setMessage("API Error");
      return setLoading(false);
    }
  };

  const verifyCaptcha = async ({ captchaId, input }) => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/captcha/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ captchaId, input }),
      });
      const result = await res.json();

      if (result.success) {
        setMessage("Verified successfully");
        setTimeout(fetchCaptcha, 1500);
      } else if (result.code === "INCORRECT") {
        setMessage(`${result.message} (${result.attemptsLeft} left)`);
        setLoading(false);
      } else {
        // expired / too many attempts / invalid: the captcha is used up
        setMessage(result.message);
        fetchCaptcha();
      }
    } catch (error) {
      console.error("Error validating captcha ", error);
      setMessage("API Error");
      setLoading(false);
    }
  };

  useEffect(() => {
    setCaptchaData(null); // reset previous captcha
    fetchCaptcha(); // fetch new captcha for the selected type
  }, [type]);

  return (
    <div className="bg-gray-100 text-gray-800 min-h-screen">
      <section className="w-full min-h-screen flex flex-col lg:flex-row items-center justify-center gap-10 px-6 py-10 lg:px-10">
        <div className="max-w-xl text-center lg:text-left">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            EthiopianCaptcha 🇪🇹
          </h1>
          <p className="text-lg lg:text-xl mb-6">
            A lightweight, secure CAPTCHA built for Ethiopian users: Amharic
            fidel and Ge'ez-numeral challenges, drawn as distorted vector images.
          </p>
          <p className="text-gray-600 mb-8">
            Server-side generation & validation, HMAC-hashed answers,
            single-use captchas, TTL & attempt limiting.
          </p>

          <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
            <a
              href="#installation"
              className="bg-amber-600 hover:bg-amber-700 px-6 py-3 rounded text-white text-sm font-medium transition"
            >
              Get Started
            </a>

            <a
              href="https://github.com/amenadam/ethiopian-captcha"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-gray-900 hover:bg-black px-6 py-3 rounded text-white text-sm font-medium transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" />
              </svg>
              GitHub
            </a>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full flex flex-col items-center transition-all">
          <h3 className="text-lg font-semibold mb-4 text-center ">Live Demo</h3>
          <div className="flex flex-wrap gap-2 mb-3 justify-center">
            {TYPES.map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={`${type === value ? "bg-amber-600 text-white" : "bg-gray-300 text-gray-700"} px-4 py-1 rounded-lg text-sm`}
                onClick={() => setType(value)}
              >
                {label}
              </button>
            ))}
          </div>
          {!captchaData && (
            <div className="w-full h-32 bg-gray-100 rounded animate-pulse" />
          )}
          {captchaData?.success && (
            <EtCaptcha
              challenge={captchaData}
              loading={loading}
              onRefresh={fetchCaptcha}
              onVerify={verifyCaptcha}
            />
          )}
          <p className="text-center mt-4 text-sm min-h-5">{message}</p>

          <p className="text-xs text-gray-500 text-center mt-2">
            {type === "fidel" && "Type the Amharic fidel shown in the image"}
            {type === "geez-math" &&
              "Solve the sum written in Ge'ez numerals (answer in 1 2 3 or ፩ ፪ ፫)"}
            {type === "click-image" &&
              "Click the cell that shows the requested item"}
          </p>
        </div>
      </section>

      {/* INSTALLATION */}
      <section
        id="installation"
        className="w-full min-h-screen flex flex-col items-center justify-center gap-8 px-6 py-10 bg-white"
      >
        <div className="max-w-4xl w-full">
          <h2 className="text-3xl lg:text-4xl font-bold mb-10 text-center">
            Installation
          </h2>

          {/* Code Block 1: Installation Command */}
          <div className="relative bg-gray-900 rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-gray-300 text-sm font-mono ml-2">
                  terminal
                </span>
              </div>
              <button
                onClick={() =>
                  navigator.clipboard.writeText("npm install ethiopian-captcha")
                }
                className="text-gray-400 hover:text-white transition"
                title="Copy to clipboard"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
              </button>
            </div>
            <pre className="p-6 overflow-x-auto">
              <code className="text-green-400 font-mono text-lg">
                npm install ethiopian-captcha
              </code>
            </pre>
          </div>

          <div className="mt-10">
            <h3 className="text-2xl font-semibold mb-6 text-center">
              Server-side Usage
            </h3>

            {/* Code Block 2: Server-side JavaScript */}
            <div className="relative bg-gray-900 rounded-xl shadow-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-300 text-sm font-mono ml-2">
                    JavaScript
                  </span>
                </div>
                <button
                  onClick={() =>
                    navigator.clipboard
                      .writeText(serverSnippet)
                  }
                  className="text-gray-400 hover:text-white transition"
                  title="Copy to clipboard"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                </button>
              </div>
              <pre className="p-6 overflow-x-auto">
                <code className="text-gray-100 font-mono text-sm lg:text-base leading-relaxed whitespace-pre">{serverSnippet}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* USAGE */}
      <section className="w-full min-h-screen flex flex-col items-center justify-center gap-8 px-6 py-10">
        <div className="max-w-4xl w-full">
          <h2 className="text-3xl lg:text-4xl font-bold mb-10 text-center">
            React Component
          </h2>

          {/* Code Block 3: React Component */}
          <div className="relative bg-gray-900 rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-gray-300 text-sm font-mono ml-2">
                  React
                </span>
              </div>
              <button
                onClick={() =>
                  navigator.clipboard
                    .writeText(reactSnippet)
                }
                className="text-gray-400 hover:text-white transition"
                title="Copy to clipboard"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
              </button>
            </div>
            <pre className="p-6 overflow-x-auto">
              <code className="text-gray-100 font-mono text-sm lg:text-base leading-relaxed whitespace-pre">{reactSnippet}</code>
            </pre>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-amber-800 mb-3">
              Important Notes:
            </h4>
            <ul className="list-disc pl-5 text-amber-700 space-y-2">
              <li>The React component does NOT handle validation logic</li>
              <li>It makes no HTTP requests; it is fully controlled by props</li>
              <li>generate() and validate() are async and run on your server</li>
              <li>Set a secret (and a shared store if you run several servers)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="w-full min-h-screen flex flex-col items-center justify-center gap-10 px-6 py-10 bg-white">
        <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-center">
          Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl">
          <div className="bg-gray-50 p-6 rounded-xl shadow text-center border border-gray-200">
            <div className="text-2xl mb-3">🇪🇹</div>
            <h3 className="font-semibold mb-2">Fidel & Ge'ez Numerals</h3>
            <p className="text-sm text-gray-600">
              Native support for Ethiopian languages
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl shadow text-center border border-gray-200">
            <div className="text-2xl text-center mb-3 flex flex-col items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                className="bi bi-fingerprint"
                viewBox="0 0 20 20"
              >
                <path d="M8.06 6.5a.5.5 0 0 1 .5.5v.776a11.5 11.5 0 0 1-.552 3.519l-1.331 4.14a.5.5 0 0 1-.952-.305l1.33-4.141a10.5 10.5 0 0 0 .504-3.213V7a.5.5 0 0 1 .5-.5Z" />
                <path d="M6.06 7a2 2 0 1 1 4 0 .5.5 0 1 1-1 0 1 1 0 1 0-2 0v.332q0 .613-.066 1.221A.5.5 0 0 1 6 8.447q.06-.555.06-1.115zm3.509 1a.5.5 0 0 1 .487.513 11.5 11.5 0 0 1-.587 3.339l-1.266 3.8a.5.5 0 0 1-.949-.317l1.267-3.8a10.5 10.5 0 0 0 .535-3.048A.5.5 0 0 1 9.569 8m-3.356 2.115a.5.5 0 0 1 .33.626L5.24 14.939a.5.5 0 1 1-.955-.296l1.303-4.199a.5.5 0 0 1 .625-.329" />
                <path d="M4.759 5.833A3.501 3.501 0 0 1 11.559 7a.5.5 0 0 1-1 0 2.5 2.5 0 0 0-4.857-.833.5.5 0 1 1-.943-.334m.3 1.67a.5.5 0 0 1 .449.546 10.7 10.7 0 0 1-.4 2.031l-1.222 4.072a.5.5 0 1 1-.958-.287L4.15 9.793a9.7 9.7 0 0 0 .363-1.842.5.5 0 0 1 .546-.449Zm6 .647a.5.5 0 0 1 .5.5c0 1.28-.213 2.552-.632 3.762l-1.09 3.145a.5.5 0 0 1-.944-.327l1.089-3.145c.382-1.105.578-2.266.578-3.435a.5.5 0 0 1 .5-.5Z" />
                <path d="M3.902 4.222a5 5 0 0 1 5.202-2.113.5.5 0 0 1-.208.979 4 4 0 0 0-4.163 1.69.5.5 0 0 1-.831-.556m6.72-.955a.5.5 0 0 1 .705-.052A4.99 4.99 0 0 1 13.059 7v1.5a.5.5 0 1 1-1 0V7a3.99 3.99 0 0 0-1.386-3.028.5.5 0 0 1-.051-.705M3.68 5.842a.5.5 0 0 1 .422.568q-.044.289-.044.59c0 .71-.1 1.417-.298 2.1l-1.14 3.923a.5.5 0 1 1-.96-.279L2.8 8.821A6.5 6.5 0 0 0 3.058 7q0-.375.054-.736a.5.5 0 0 1 .568-.422m8.882 3.66a.5.5 0 0 1 .456.54c-.084 1-.298 1.986-.64 2.934l-.744 2.068a.5.5 0 0 1-.941-.338l.745-2.07a10.5 10.5 0 0 0 .584-2.678.5.5 0 0 1 .54-.456" />
                <path d="M4.81 1.37A6.5 6.5 0 0 1 14.56 7a.5.5 0 1 1-1 0 5.5 5.5 0 0 0-8.25-4.765.5.5 0 0 1-.5-.865m-.89 1.257a.5.5 0 0 1 .04.706A5.48 5.48 0 0 0 2.56 7a.5.5 0 0 1-1 0c0-1.664.626-3.184 1.655-4.333a.5.5 0 0 1 .706-.04ZM1.915 8.02a.5.5 0 0 1 .346.616l-.779 2.767a.5.5 0 1 1-.962-.27l.778-2.767a.5.5 0 0 1 .617-.346m12.15.481a.5.5 0 0 1 .49.51c-.03 1.499-.161 3.025-.727 4.533l-.07.187a.5.5 0 0 1-.936-.351l.07-.187c.506-1.35.634-2.74.663-4.202a.5.5 0 0 1 .51-.49" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Secure by Design</h3>
            <p className="text-sm text-gray-600">
              HMAC-hashed answers, single-use, no text in the image
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl shadow text-center border border-gray-200">
            <div className="text-2xl mb-3">⚡</div>
            <h3 className="font-semibold mb-2">Zero Dependencies</h3>
            <p className="text-sm text-gray-600">
              Lightweight with no external dependencies
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl shadow text-center border border-gray-200">
            <div className="text-2xl mb-3">🔄</div>
            <h3 className="font-semibold mb-2">Configurable</h3>
            <p className="text-sm text-gray-600">
              TTL, attempts, and type configuration
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-8 text-sm  bg-gray-900 text-gray-300">
        <div className="max-w-6xl mx-auto px-6">
          <p className="mb-2">© {new Date().getFullYear()} EthiopianCaptcha</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
