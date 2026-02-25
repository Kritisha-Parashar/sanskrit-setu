export interface Dialogue {
  speaker: "teacher" | "monkey";
  sanskrit: string;
  english: string;
}

export interface QuizFillBlank {
  type: "fill-blank";
  question: string;
  prefix: string;
  suffix: string;
  correctAnswer: string;
  placeholder: string;
}

export interface QuizMultipleChoice {
  type: "multiple-choice";
  question: string;
  options: string[];
  correctAnswer: string;
}

export type Quiz = QuizFillBlank | QuizMultipleChoice;

export interface Scene {
  title: string;
  dialogues: Dialogue[];
  quiz: Quiz;
}

export const lessonScenes: Scene[] = [
  {
    title: "Morning in the Gurukul",
    dialogues: [
      {
        speaker: "teacher",
        sanskrit: "स्वागतम्, बालक!",
        english: "Welcome, child!",
      },
      {
        speaker: "monkey",
        sanskrit: "नमस्ते, गुरुमाता!",
        english: "Namaste, respected teacher!",
      },
    ],
    quiz: {
      type: "fill-blank",
      question: "In Sanskrit, how do we say Welcome?",
      prefix: "स्वा",
      suffix: "म्",
      correctAnswer: "स्वागतम्",
      placeholder: "___",
    },
  },
  {
    title: "Learning Vowels",
    dialogues: [
      {
        speaker: "teacher",
        sanskrit: "आज हम स्वराः सीखेंगे।",
        english: "Today we will learn vowels.",
      },
      {
        speaker: "monkey",
        sanskrit: "गुरुमाता, 'अ' का अर्थ क्या है?",
        english: "Teacher, what is the meaning of 'अ'?",
      },
      {
        speaker: "teacher",
        sanskrit: "अश्वः। It means Horse.",
        english: "Ashvah – It means Horse.",
      },
    ],
    quiz: {
      type: "multiple-choice",
      question: "What does अश्वः mean?",
      options: ["Mango", "Horse", "Sage"],
      correctAnswer: "Horse",
    },
  },
  {
    title: "Respect and Culture",
    dialogues: [
      {
        speaker: "teacher",
        sanskrit: "जब हम किसी को सम्मान से अभिवादन करते हैं...",
        english: "When we greet someone respectfully...",
      },
    ],
    quiz: {
      type: "multiple-choice",
      question: "When we greet someone respectfully, we say __.",
      options: ["धन्यवाद", "नमस्ते", "शुभरात्रि"],
      correctAnswer: "नमस्ते",
    },
  },
  {
    title: "Mini Dialogue Practice",
    dialogues: [
      {
        speaker: "teacher",
        sanskrit: "अहं विद्यार्थी अस्मि।",
        english: "I am a student.",
      },
    ],
    quiz: {
      type: "fill-blank",
      question: "Complete the sentence:",
      prefix: "अहं ",
      suffix: " अस्मि।",
      correctAnswer: "विद्यार्थी",
      placeholder: "___",
    },
  },
];