import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface VowelWord {
  sanskrit: string;
  word: string;
  devanagariWord: string;
  english: string;
  roman: string;
}

const vowelWords: VowelWord[] = [
  { sanskrit: "अ", devanagariWord: "अश्वः", word: "ashvah", roman: "a", english: "Horse" },
  { sanskrit: "आ", devanagariWord: "आम्रम्", word: "āmram", roman: "aa", english: "Mango" },
  { sanskrit: "इ", devanagariWord: "इक्षुः", word: "ikṣuh", roman: "i", english: "Sugarcane" },
  { sanskrit: "ई", devanagariWord: "ईश्वरः", word: "īśvarah", roman: "ii", english: "God" },
  { sanskrit: "उ", devanagariWord: "उदरम्", word: "udaram", roman: "u", english: "Stomach" },
  { sanskrit: "ऊ", devanagariWord: "ऊर्णा", word: "ūrṇā", roman: "uu", english: "Wool" },
  { sanskrit: "ऋ", devanagariWord: "ऋषिः", word: "ṛṣih", roman: "ri", english: "Sage" },
  { sanskrit: "ऌ", devanagariWord: "ऌ", word: "ḷi", roman: "li", english: "L vowel" },
  { sanskrit: "ए", devanagariWord: "एकः", word: "ekah", roman: "e", english: "One" },
  { sanskrit: "औ", devanagariWord: "औषधम्", word: "auṣadham", roman: "au", english: "Medicine" },
  { sanskrit: "ॡ", devanagariWord: "ॡ", word: "ḹ", roman: "lli", english: "Long L vowel" },
  { sanskrit: "ऐ", devanagariWord: "ऐरावतः", word: "airāvatah", roman: "ai", english: "Airavata (Elephant)" },
  { sanskrit: "ओ", devanagariWord: "ओष्ठ", word: "oṣṭha", roman: "o", english: "Lip" },
];

const getRandomVowelTests = () =>
  [...vowelWords].sort(() => Math.random() - 0.5).slice(0, 6);

const Test = () => {
  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;

  const [testSet] = useState(getRandomVowelTests());
  const [index, setIndex] = useState(0);
  const [listening, setListening] = useState(false);
  const [spoken, setSpoken] = useState("");
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);

  const item = testSet[index];

  const spokenSanskritMap: Record<string, string[]> = {
    "अश्वः": ["ashwa", "ashva", "ashw", "aswa"],
    "आम्रम्": ["aamram", "amram", "amaram", "amrum"],
    "इक्षुः": ["ikshu", "ikshoo", "ikshuh", "ikshu"],
    "ईश्वरः": ["ishwar", "eeshwar", "eeshvar", "ishwarh", "ishvar"],
    "उदरम्": ["udaram", "udar", "udrum", "udarum"],
    "ऊर्णा": ["oorna", "urna","udana"],
    "ऋषिः": ["rishi", "rishee", "rshi"],
    "ऌ": ["li", "lii", "lli"],
    "एकः": ["ek", "ekah", "ekaa", "ekka"],
    "ऐरावतः": ["airavat", "airavata", "airawat", "airavatah"],
    "ॡ": ["li", "lee", "lli", "llee"],
    "औषधम्": ["aushadham","aushdham", "aushadam","aushdham",],
    "ओष्ठ": ["osht", "oshth", "osth", "ooshth"]
  };

  const checkMatch = (text: string) => {
    const t = text.toLowerCase().trim();
    const list = spokenSanskritMap[item.devanagariWord] || [];
    return list.some(accepted => t === accepted);
  };

  const start = () => {
    if (!SpeechRecognition) return alert("Speech not supported");

    const r = new SpeechRecognition();
    r.lang = "en-IN";
    r.interimResults = false;

    setListening(true);
    setSpoken("");
    setResult(null);

    r.start();

    r.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      setSpoken(t);

      if (checkMatch(t)) {
        setResult("correct");
        setScore((s) => s + 1);
      } else {
        setResult("wrong");
      }
    };

    r.onend = () => setListening(false);
  };

  const next = () => {
    if (index < testSet.length - 1) {
      setIndex((i) => i + 1);
      setResult(null);
      setSpoken("");
    } else {
      setFinished(true);
    }
  };

  const previous = () => {
    if (index === 0) return;
    setIndex((i) => i - 1);
    setResult(null);
    setSpoken("");
  };

  if (finished) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#9FD5CF] text-center p-8">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full">
          <h2 className="text-3xl font-bold text-[#0B7D77] mb-4">Test Complete!</h2>
          <p className="text-xl text-gray-600 mb-4">
            Score: <b className="text-[#0B7D77]">{score}</b> / {testSet.length}
          </p>
          <div className="flex flex-col gap-3">
            <button
                onClick={() => window.location.reload()}
                className="bg-[#0B7D77] text-white px-6 py-3 rounded-xl hover:bg-[#0A6E68]"
            >
                Restart
            </button>
            <Link to="/dashboard" className="w-full">
                <button className="w-full bg-white text-[#0B7D77] border-2 border-[#0B7D77] px-6 py-3 rounded-xl hover:bg-gray-50 font-semibold transition-colors">
                    Go to Dashboard
                </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#9FD5CF] flex flex-col relative">

      {/* Added: Back Button */}
      <div className="absolute top-4 left-4 z-10">
        <Link to="/dashboard">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/90 text-[#0B7D77] rounded-lg shadow-sm hover:bg-white transition-colors font-medium">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
        </Link>
      </div>

      {/* Orange Progress Bar */}
      <div className="h-1 bg-orange-400" style={{ width: `${((index + 1) / testSet.length) * 100}%` }} />

      {/* Header */}
      <div className="bg-white text-center py-3 text-gray-700 font-medium shadow-sm">
        Slide {index + 1} of {testSet.length}
      </div>

      {/* Content */}
      <div className="flex flex-1 gap-6 mt-8 px-10 justify-center items-center">

        {/* LEFT SQUARE */}
        <div className="flex-1 bg-white rounded-3xl shadow-xl flex flex-col justify-center items-center py-16">
          <div className="text-[150px] font-bold text-[#0B7D77] leading-none">
            {item.sanskrit}
          </div>
        </div>

        {/* RIGHT RECT */}
        <div className="w-[40%] bg-white rounded-3xl shadow-xl p-10 flex flex-col items-center">
          <div className="text-4xl text-[#0B7D77] font-semibold">{item.devanagariWord}</div>
          <p className="text-gray-500 mt-1">{item.english}</p>

          {/* Speak */}
          <button
            onClick={start}
            disabled={listening}
            className={`mt-6 px-8 py-3 rounded-xl text-white text-lg ${
              listening ? "bg-gray-400" : "bg-[#0B7D77] hover:bg-[#0A6E68]"
            }`}
          >
            🎤 {listening ? "Listening..." : "Speak"}
          </button>

          {/* Feedback */}
          {spoken && <p className="mt-4 text-lg text-gray-700">You said: <b>{spoken}</b></p>}
          {result === "correct" && <p className="text-green-700 font-bold text-xl mt-2">✔ Correct!</p>}
          {result === "wrong" && <p className="text-red-600 font-bold text-xl mt-2">✖ Wrong!</p>}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between px-10 py-6">
        <button
          onClick={previous}
          disabled={index === 0}
          className="px-6 py-3 bg-white text-[#0B7D77] rounded-xl shadow disabled:opacity-40"
        >
          ← Previous
        </button>

        <button
          onClick={next}
          className="px-6 py-3 bg-[#0B7D77] text-white rounded-xl shadow hover:bg-[#0A6E68]"
        >
          Next →
        </button>
      </div>

    </div>
  );
};

export default Test;