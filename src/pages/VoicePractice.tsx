import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from "axios";

// Import word bank (we'll use the first 5 words for Phase 1)
const PRACTICE_WORDS = [
  "अश्वः", // Horse
  "गज:", // Elephant
  "नर:", // Man
  "बालक:", // Boy
  "विद्या:", // Knowledge
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

          // Auto-advance to next word if perfect score
          if (
            result.score >= 90 &&
            currentWordIndex < PRACTICE_WORDS.length - 1
          ) {
            setTimeout(() => {
              setCurrentWordIndex((prev) => prev + 1);
              setAttempts([]);
              setSuccessMessage(null);
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
    if (currentWordIndex < PRACTICE_WORDS.length - 1) {
      setCurrentWordIndex((prev) => prev + 1);
      setAttempts([]);
      setError(null);
      setSuccessMessage(null);
    } else {
      navigate("/dashboard");
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 p-6">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          🎤 Voice Practice
        </h1>
        <p className="text-gray-600">
          Pronounce the Sanskrit word correctly. Record up to 5 seconds of
          audio.
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Progress */}
        <div className="flex justify-between items-center">
          <Badge variant="outline" className="text-lg px-4 py-2">
            Word {currentWordIndex + 1} of {PRACTICE_WORDS.length}
          </Badge>
          <div className="text-sm text-gray-600">
            Attempts: <strong>{attempts.length}</strong>
          </div>
        </div>

        {/* Word Card */}
        <Card className="border-2 border-purple-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-100 to-blue-100">
            <CardTitle className="text-center text-5xl mb-4">
              {currentWord}
            </CardTitle>
            <div className="text-center space-y-2">
              <p className="text-xl font-semibold text-gray-700">
                {wordInfo.meaning}
              </p>
              <p className="text-sm text-gray-600">
                IPA: <code className="text-xs">{wordInfo.ipa}</code>
              </p>
            </div>
          </CardHeader>
        </Card>

        {/* Recording Section */}
        <Card>
          <CardHeader>
            <CardTitle>Record Your Pronunciation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}

            {/* Recording Timer */}
            {isRecording && (
              <div className="text-center py-4 bg-red-50 rounded-lg">
                <div className="text-3xl font-bold text-red-600 animate-pulse">
                  {recordingTime.toFixed(1)}s
                </div>
                <p className="text-sm text-red-700 mt-2">Recording...</p>
              </div>
            )}

            {/* Record/Stop Button */}
            <div className="flex gap-4 justify-center">
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  disabled={isEvaluating}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg"
                  size="lg"
                >
                  🎙️ Start Recording
                </Button>
              ) : (
                <Button
                  onClick={stopRecording}
                  disabled={isEvaluating}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg"
                  size="lg"
                >
                  ⏹️ Stop & Evaluate
                </Button>
              )}
            </div>

            {isEvaluating && (
              <div className="text-center py-4">
                <p className="text-gray-600 animate-pulse">
                  Evaluating pronunciation...
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Best Attempt */}
        {bestAttempt && (
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {bestAttempt.result.word_match ? "✅" : "⭕"} Best Attempt
                (Score: {bestAttempt.result.score})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Transcription:</p>
                <p className="text-lg font-semibold">
                  {bestAttempt.result.transcription}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Feedback:</p>
                <p className="text-gray-800">{bestAttempt.result.feedback}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Word Match:</p>
                  <p className="font-semibold">
                    {bestAttempt.result.word_match ? "Yes ✓" : "No ✗"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Similarity:</p>
                  <p className="font-semibold">
                    {(bestAttempt.result.similarity * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex gap-4 justify-between">
          <Button
            onClick={previousWord}
            disabled={currentWordIndex === 0}
            variant="outline"
            className="px-6"
          >
            ← Previous Word
          </Button>

          <Button
            onClick={nextWord}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
          >
            {currentWordIndex === PRACTICE_WORDS.length - 1
              ? "Finish Practice"
              : "Next Word →"}
          </Button>
        </div>

        {/* Attempt History */}
        {attempts.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Attempts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {attempts.slice(1, 6).map((attempt, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded"
                  >
                    <span className="text-sm text-gray-700">
                      Attempt {attempts.length - idx}: "
                      {attempt.result.transcription}"
                    </span>
                    <Badge
                      variant={
                        attempt.result.score >= 75 ? "default" : "secondary"
                      }
                    >
                      {attempt.result.score}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VoicePractice;
