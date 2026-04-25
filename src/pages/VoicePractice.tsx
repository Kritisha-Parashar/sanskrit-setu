import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from "axios";

const PRACTICE_WORDS = [
  "अश्वः", 
  "गज:", 
  "नर:", 
  "बालक:", 
  "विद्या:", 
];

const WORD_DATA: Record<string, { meaning: string; ipa: string }> = {
  अश्वः: { meaning: "Horse", ipa: "ˈaʃ.ʋəh" },
  "गज:": { meaning: "Elephant", ipa: "ˈgə.jəh" },
  "नर:": { meaning: "Man", ipa: "ˈnə.rəh" },
  "बालक:": { meaning: "Boy", ipa: "ˈbaː.ləkəh" },
  "विद्या:": { meaning: "Knowledge", ipa: "ˈʋɪ.dːjaː" },
};

interface PronunciationResult {
  word_match: boolean;
  score: number;
  transcription: string;
  transcription_devanagari: string;
  feedback: string;
  phoneme_sequence_expected: string;
  phoneme_sequence_actual: string;
  similarity: number;
}

interface Attempt {
  timestamp: number;
  result: PronunciationResult;
  audioBlob: Blob;
}

const VoicePractice: React.FC = () => {
  const navigate = useNavigate();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [wordScores, setWordScores] = useState<number[]>([]);
  const [sessionComplete, setSessionComplete] = useState(false);

  const currentWord = PRACTICE_WORDS[currentWordIndex];
  const wordInfo = WORD_DATA[currentWord];
  const bestAttempt =
    attempts.length > 0
      ? attempts.reduce((best, curr) =>
          curr.result.score > best.result.score ? curr : best,
        )
      : null;

  // Initialize MediaRecorder
  useEffect(() => {
    const initMediaRecorder = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        // Use browser's default audio codec (usually WebM)
        // Don't specify MIME type - let browser choose
        const recorder = new MediaRecorder(stream);

        recorder.onstart = () => {
          audioChunksRef.current = [];
          setRecordingTime(0);
        };

        recorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current = recorder;
      } catch (err) {
        setError("Cannot access microphone. Please check permissions.");
        console.error("Microphone error:", err);
      }
    };

    initMediaRecorder();

    return () => {
      if (mediaRecorderRef.current?.stream) {
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  // Recording timer
  useEffect(() => {
    if (!isRecording) return;
    const timer = setInterval(() => {
      setRecordingTime((prev) => {
        if (prev >= 5) {
          stopRecording();
          return prev;
        }
        return prev + 0.1;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [isRecording]);

  const startRecording = () => {
    if (!mediaRecorderRef.current) {
      setError("Microphone not initialized. Please refresh the page.");
      return;
    }
    setError(null);
    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    setIsRecording(false);

    // Wait for ondataavailable to be called
    setTimeout(async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
      if (audioBlob.size === 0) {
        setError("No audio recorded. Please try again.");
        return;
      }
      await evaluatePronunciation(audioBlob);
    }, 100);
  };

  const evaluatePronunciation = async (audioBlob: Blob) => {
    try {
      setIsEvaluating(true);
      setError(null);

      // Convert audio blob to base64 (browser-compatible)
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);

      reader.onload = async () => {
        try {
          // Extract base64 string from data URL (format: "data:audio/wav;base64,xxxxx...")
          const dataUrl = reader.result as string;
          const base64Audio = dataUrl.split(",")[1]; // Get part after the comma

          // Call backend API
          const response = await axios.post("/api/voice/evaluate", {
            word_expected: currentWord,
            audio_base64: base64Audio,
          });

          const result: PronunciationResult = response.data.data;

          // Store attempt
          const newAttempt: Attempt = {
            timestamp: Date.now(),
            result,
            audioBlob,
          };

          setAttempts((prev) => [newAttempt, ...prev]);
          setSuccessMessage(`Score: ${result.score}/100 - ${result.feedback}`);

          // Track best score for this word
          const currentBestScore = bestAttempt?.result.score || 0;
          const newBestScore = Math.max(result.score, currentBestScore);

          // Auto-advance to next word if score >= 50
          if (result.score >= 50) {
            setTimeout(() => {
              const newScores = [...wordScores, newBestScore];
              setWordScores(newScores);

              // Check if we've completed all words
              if (currentWordIndex < PRACTICE_WORDS.length - 1) {
                setCurrentWordIndex((prev) => prev + 1);
                setAttempts([]);
                setSuccessMessage(null);
              } else {
                // Session complete - show summary
                setSessionComplete(true);
              }
            }, 2000);
          }
        } catch (err: any) {
          const errorMsg =
            err.response?.data?.error || err.message || "Unknown error";
          setError(`Evaluation failed: ${errorMsg}`);
          console.error("Evaluation error:", err);
        } finally {
          setIsEvaluating(false);
        }
      };
    } catch (err: any) {
      setError("Failed to process audio");
      setIsEvaluating(false);
      console.error("Error:", err);
    }
  };

  const nextWord = () => {
    if (sessionComplete) {
      navigate("/dashboard");
    } else if (currentWordIndex < PRACTICE_WORDS.length - 1) {
      const newScores = [...wordScores, bestAttempt?.result.score || 0];
      setWordScores(newScores);
      setCurrentWordIndex((prev) => prev + 1);
      setAttempts([]);
      setError(null);
      setSuccessMessage(null);
    } else if (currentWordIndex === PRACTICE_WORDS.length - 1) {
      // Last word - manual completion
      const newScores = [...wordScores, bestAttempt?.result.score || 0];
      setWordScores(newScores);
      setSessionComplete(true);
    }
  };

  const previousWord = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex((prev) => prev - 1);
      setAttempts([]);
      setError(null);
      setSuccessMessage(null);
    }
  };

  const averageScore =
    wordScores.length > 0
      ? Math.round(wordScores.reduce((a, b) => a + b, 0) / wordScores.length)
      : 0;

  // If session is complete, show summary screen
  if (sessionComplete) {
    return (
      <div className="min-h-screen bg-[#9FD5CF] flex flex-col justify-center items-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
          <h1 className="text-4xl font-bold text-[#0B7D77] mb-4">
            🎉 Session Complete!
          </h1>
          <p className="text-gray-600 mb-6">
            Great job practicing Sanskrit pronunciation!
          </p>

          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <div className="text-6xl font-bold text-[#0B7D77] mb-2">
              {averageScore}%
            </div>
            <p className="text-xl text-gray-700 mb-6">Average Score</p>

            <div className="space-y-3 text-left max-h-48 overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-800">
                Word Scores:
              </h3>
              {PRACTICE_WORDS.map((word, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-white rounded"
                >
                  <span className="text-gray-700 font-medium">{word}</span>
                  <Badge className="text-base px-3 py-1">
                    {wordScores[idx]}%
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => navigate("/dashboard")}
              className="bg-[#0B7D77] hover:bg-[#0A6E68] text-white px-8 py-3 rounded-xl w-full"
              size="lg"
            >
              Back to Dashboard
            </Button>
            <Button
              onClick={() => {
                setCurrentWordIndex(0);
                setAttempts([]);
                setWordScores([]);
                setSessionComplete(false);
                setError(null);
                setSuccessMessage(null);
              }}
              className="bg-white text-[#0B7D77] border-2 border-[#0B7D77] hover:bg-gray-50 px-8 py-3 rounded-xl w-full font-semibold"
              size="lg"
            >
              Practice Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#9FD5CF] flex flex-col relative">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 px-4 py-2 bg-white/90 text-[#0B7D77] rounded-lg shadow-sm hover:bg-white transition-colors font-medium"
        >
          ← Back
        </button>
      </div>

      {/* Orange Progress Bar */}
      <div
        className="h-1 bg-orange-400"
        style={{
          width: `${((currentWordIndex + 1) / PRACTICE_WORDS.length) * 100}%`,
        }}
      />

      {/* Word Counter - Small Box */}
      <div className="flex justify-center py-4">
        <div className="bg-white px-6 py-2 rounded-full shadow-md inline-block">
          <p className="text-sm font-mono text-[#0B7D77]">
            Word {currentWordIndex + 1} / {PRACTICE_WORDS.length}
          </p>
        </div>
      </div>

      {/* Main Content - Centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 overflow-y-auto pb-32">
        {/* Word Box - Top */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 w-full max-w-2xl text-center">
          <div className="text-7xl font-bold text-[#0B7D77] leading-none mb-4">
            {currentWord}
          </div>
          <p className="text-2xl font-semibold text-[#0B7D77] mb-2">
            {wordInfo.meaning}
          </p>
          <p className="text-sm text-gray-600">IPA: {wordInfo.ipa}</p>
        </div>

        {/* Recording Box - Middle */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 w-full max-w-2xl">
          {error && (
            <Alert className="bg-red-50 border-red-200 mb-4">
              <AlertDescription className="text-red-800 text-sm">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="bg-green-50 border-green-200 mb-4">
              <AlertDescription className="text-green-800 text-sm">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Recording Timer */}
          {isRecording && (
            <div className="text-center py-4 bg-red-50 rounded-lg mb-4">
              <div className="text-3xl font-bold text-red-600 animate-pulse">
                {recordingTime.toFixed(1)}s
              </div>
              <p className="text-sm text-red-700 mt-2">Recording...</p>
            </div>
          )}

          {/* Record/Stop Button */}
          <div className="mb-4">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                disabled={isEvaluating}
                className="w-full bg-[#0B7D77] hover:bg-[#0A6E68] text-white px-6 py-3 rounded-xl text-lg"
              >
                🎙️ {isEvaluating ? "Evaluating..." : "Speak"}
              </Button>
            ) : (
              <Button
                onClick={stopRecording}
                disabled={isEvaluating}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl text-lg"
              >
                ⏹️ Stop & Evaluate
              </Button>
            )}
          </div>

          {/* Best Attempt */}
          {bestAttempt && (
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <div className="flex items-center gap-2 mb-3 font-semibold text-[#0B7D77]">
                {bestAttempt.result.word_match ? "✅" : "⭕"} Best Attempt (
                {bestAttempt.result.score}%)
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-600">Transcription:</p>
                  <p className="font-semibold text-gray-800">
                    "{bestAttempt.result.transcription_devanagari}"
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Feedback:</p>
                  <p className="text-gray-700">{bestAttempt.result.feedback}</p>
                </div>
                <div className="flex gap-4 pt-2">
                  <div>
                    <p className="text-gray-600 text-xs">Word Match:</p>
                    <p className="font-semibold text-gray-800">
                      {bestAttempt.result.word_match ? "Yes ✓" : "No ✗"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Similarity:</p>
                    <p className="font-semibold text-gray-800">
                      {(bestAttempt.result.similarity * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* All Attempts History */}
          {attempts.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 mt-4">
              <h4 className="text-sm font-semibold text-[#0B7D77] mb-3">
                All Attempts ({attempts.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {attempts.map((attempt, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-2 bg-white rounded text-sm"
                  >
                    <span className="text-gray-700">
                      "{attempt.result.transcription_devanagari}"
                    </span>
                    <Badge className="text-xs px-2 py-1">
                      {attempt.result.score}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-between px-8 py-6 bg-[#9FD5CF]/80 backdrop-blur-sm z-50 border-t border-white/20">
        <Button
          onClick={previousWord}
          disabled={currentWordIndex === 0}
          className="px-6 py-3 bg-white text-[#0B7D77] rounded-xl shadow disabled:opacity-40 hover:bg-gray-50"
        >
          ← Previous
        </Button>

        <Button
          onClick={nextWord}
          className="px-6 py-3 bg-[#0B7D77] hover:bg-[#0A6E68] text-white rounded-xl shadow"
        >
          Next →
        </Button>
      </div>
    </div>
  );
};

export default VoicePractice;