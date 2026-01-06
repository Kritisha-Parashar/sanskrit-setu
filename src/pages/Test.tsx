import { useState } from "react";

const swar = [
  { devanagari: "अ", roman: "a" },
  { devanagari: "आ", roman: "aa" },
  { devanagari: "इ", roman: "i" },
  { devanagari: "ई", roman: "ii" },
  { devanagari: "उ", roman: "u" },
  { devanagari: "ऊ", roman: "uu" },
  { devanagari: "ऋ", roman: "ri" },
  { devanagari: "ए", roman: "e" },
  { devanagari: "ऐ", roman: "ai" },
  { devanagari: "ओ", roman: "o" },
  { devanagari: "औ", roman: "au" },
  { devanagari: "अं", roman: "am" },
  { devanagari: "अः", roman: "aha" },
];

const getRandomSwar = () => {
  return [...swar]
    .sort(() => 0.5 - Math.random())
    .slice(0, 6);
};

const Test = () => {
  // ✅ Hooks MUST be inside component
  const [testSet] = useState(getRandomSwar());
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentSwar = testSet[currentIndex];

  return (
    <div className="min-h-screen bg-background p-6">
      <h1 className="text-3xl font-bold mb-6">
        🧪 Vowel Pronunciation Test
      </h1>

      <p className="text-muted-foreground mb-6">
        Pronounce the following vowel:
      </p>

      {/* Swar Display */}
      <div className="text-center mb-8">
        <div className="text-8xl font-bold text-primary">
          {currentSwar.devanagari}
        </div>
        <div className="text-xl text-muted-foreground mt-2">
          ({currentSwar.roman})
        </div>
      </div>

      {/* Navigation (temporary) */}
      <button
        className="px-6 py-3 bg-primary text-white rounded-xl"
        onClick={() => setCurrentIndex((prev) => prev + 1)}
        disabled={currentIndex === testSet.length - 1}
      >
        Next
      </button>

      <p className="mt-4 text-sm text-muted-foreground">
        {currentIndex + 1} / {testSet.length}
      </p>
    </div>
  );
};

export default Test;
