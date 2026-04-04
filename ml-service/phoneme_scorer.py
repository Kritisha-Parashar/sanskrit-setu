"""
Phoneme-level Sanskrit pronunciation scorer.
Compares expected word vs. transcribed word using phoneme sequences.
"""

from typing import Dict, Tuple
from difflib import SequenceMatcher
import unicodedata
import re

try:
    from indic_transliteration import sanscript
    HAS_INDIC_TRANSLITERATION = True
except ImportError:
    HAS_INDIC_TRANSLITERATION = False
    print("Warning: indic-transliteration not available. Romanized conversion will be basic.")


# Sanskrit phoneme mappings (Devanagari to IPA)
SANSKRIT_PHONEME_MAP = {
    # Vowels (स्वर)
    'अ': 'ə',      # schwa
    'आ': 'aː',     # long a
    'इ': 'i',      # short i
    'ई': 'iː',     # long i
    'उ': 'u',      # short u
    'ऊ': 'uː',     # long u
    'ऋ': 'ɾɪ',     # vocalic r
    'ॠ': 'ɾiː',    # long vocalic r
    'ए': 'e',      # long e
    'ऐ': 'ɛ',      # long ai
    'ओ': 'o',      # long o
    'औ': 'ɔ',      # long au
    
    # Velars (क्वचन्)
    'क': 'k',
    'ख': 'kʰ',
    'ग': 'g',
    'घ': 'gʰ',
    'ङ': 'ŋ',
    
    # Palatals (तालव्य)
    'च': 'tʃ',
    'छ': 'tʃʰ',
    'ज': 'dʒ',
    'झ': 'dʒʰ',
    'ञ': 'ɲ',
    
    # Retroflex (मूर्धन्य)
    'ट': 'ʈ',
    'ठ': 'ʈʰ',
    'ड': 'ɖ',
    'ढ': 'ɖʰ',
    'ण': 'ɳ',
    
    # Dentals (दन्त्य)
    'त': 't',
    'थ': 'tʰ',
    'द': 'd',
    'ध': 'dʰ',
    'न': 'n',
    
    # Labials (ओष्ठ्य)
    'प': 'p',
    'फ': 'pʰ',
    'ब': 'b',
    'भ': 'bʰ',
    'म': 'm',
    
    # Approximants & sibilants
    'य': 'j',
    'र': 'ɾ',
    'ल': 'l',
    'व': 'ʋ',
    'श': 'ʃ',
    'ष': 'ʂ',
    'स': 's',
    'ह': 'h',
}

# Romanization to IPA map (for comparing romanized output)
ROMANIZED_PHONEME_MAP = {
    'a': 'ə',
    'ā': 'aː',
    'i': 'i',
    'ī': 'iː',
    'u': 'u',
    'ū': 'uː',
    'ṛ': 'ɾɪ',
    'e': 'e',
    'ai': 'ɛ',
    'o': 'o',
    'au': 'ɔ',
    'ka': 'kə',
    'kha': 'kʰə',
    'ga': 'gə',
    'gha': 'gʰə',
    'ṅa': 'ŋə',
    'cha': 'tʃə',
    'chha': 'tʃʰə',
    'ja': 'dʒə',
    'jha': 'dʒʰə',
    'ña': 'ɲə',
    'ṭa': 'ʈə',
    'ṭha': 'ʈʰə',
    'ḍa': 'ɖə',
    'ḍha': 'ɖʰə',
    'ṇa': 'ɳə',
    'ta': 'tə',
    'tha': 'tʰə',
    'da': 'də',
    'dha': 'dʰə',
    'na': 'nə',
    'pa': 'pə',
    'pha': 'pʰə',
    'ba': 'bə',
    'bha': 'bʰə',
    'ma': 'mə',
    'ya': 'jə',
    'ra': 'ɾə',
    'la': 'ləoil',
    'va': 'ʋə',
    'sha': 'ʃə',
    'ṣa': 'ʂə',
    'sa': 'sə',
    'ha': 'hə',
}


def normalize_devanagari(text: str) -> str:
    """
    Normalize Devanagari text:
    - Remove combining marks (diacritics)
    - Decompose Unicode to NFC
    - Strip spaces
    """
    # Normalize to NFC (canonical form)
    text = unicodedata.normalize('NFC', text)
    # Remove combining marks (virama, anusvara, visarga, etc.)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    # Remove spaces
    text = text.strip()
    return text


def is_devanagari(text: str) -> bool:
    """Check if text contains Devanagari characters."""
    for char in text:
        if '\u0900' <= char <= '\u097F':  # Devanagari Unicode range
            return True
    return False


def romanized_to_devanagari(text: str) -> str:
    """
    Convert romanized Sanskrit to Devanagari.
    Uses indic-transliteration library for accurate conversion.
    """
    if not HAS_INDIC_TRANSLITERATION:
        # Fallback: simple mapping (less accurate)
        return simple_romanized_to_devanagari(text)
    
    text = text.lower().strip()
    
    # Try multiple romanization schemes (IAST, ITRANS, SLP1)
    for scheme in [sanscript.IAST, sanscript.ITRANS, sanscript.SLP1]:
        try:
            result = sanscript.transliterate(text, scheme, sanscript.DEVANAGARI)
            if result and result != text:  # If conversion was successful
                return result
        except Exception as e:
            continue
    
    # If all else fails, return original
    return text


def simple_romanized_to_devanagari(text: str) -> str:
    """
    Fallback: Simple romanized-to-Devanagari conversion (basic).
    This is a very basic mapping and will not handle all cases correctly.
    The indic-transliteration library is much more accurate.
    """
    text = text.lower().strip()
    
    # Simple direct substitutions (WARNING: incomplete and inaccurate!)
    mapping = {
        'ashva': 'अश्व',
        'ashvah': 'अश्वः',
        'gaja': 'गज',
        'gajah': 'गजः',
        'nara': 'नर',
        'narah': 'नरः',
        'balaka': 'बालक',
        'balakah': 'बालकः',
        'vidya': 'विद्या',
        'vidyah': 'विद्याः',
    }
    
    # Try longest matches first
    for rom, dev in sorted(mapping.items(), key=lambda x: -len(x[0])):
        if rom in text:
            return mapping[rom]
    
    return text


def devanagari_to_phonemes(text: str) -> str:
    """
    Convert Devanagari text to IPA phoneme sequence.
    """
    text = normalize_devanagari(text)
    phonemes = []
    for char in text:
        if char in SANSKRIT_PHONEME_MAP:
            phonemes.append(SANSKRIT_PHONEME_MAP[char])
        else:
            # If char not in map, skip (handles unknown chars, anusvara, etc.)
            pass
    return ''.join(phonemes)


def romanized_to_phonemes(text: str) -> str:
    """
    Convert romanized Sanskrit text to IPA phoneme sequence.
    Handles IAST and common romanizations.
    """
    text = text.lower().strip()
    phonemes = []
    i = 0
    while i < len(text):
        # Try multi-char matches first
        matched = False
        for length in [3, 2, 1]:
            substr = text[i:i+length]
            if substr in ROMANIZED_PHONEME_MAP:
                phonemes.append(ROMANIZED_PHONEME_MAP[substr])
                i += length
                matched = True
                break
        if not matched:
            i += 1
    return ''.join(phonemes)


def compute_phoneme_distance(phoneme_seq_1: str, phoneme_seq_2: str) -> Tuple[float, int, int]:
    """
    Compute normalized phoneme edit distance (Levenshtein-like).
    Returns: (normalized_distance 0-1, edit_distance, max_length)
    """
    # Use SequenceMatcher for similarity
    matcher = SequenceMatcher(None, phoneme_seq_1, phoneme_seq_2)
    similarity = matcher.ratio()  # 0-1, where 1 is perfect match
    
    # Edit distance approximation
    edit_distance = len(phoneme_seq_1) + len(phoneme_seq_2) - 2 * len(matcher.get_matching_blocks()[:-1])
    max_length = max(len(phoneme_seq_1), len(phoneme_seq_2))
    
    return similarity, edit_distance, max_length


def compare_pronunciations(
    expected_word_devanagari: str,
    transcribed_word_devanagari: str,
    transcribed_word_romanized: str = None
) -> Dict:
    """
    Main function: Compare expected vs. transcribed Sanskrit word.
    
    Args:
        expected_word_devanagari: Target word in Devanagari (e.g., "अश्वः")
        transcribed_word_devanagari: What ASR returned (may be Devanagari, romanized, or mixed)
        transcribed_word_romanized: Fallback romanized form (not used in current implementation)
    
    Returns:
        {
            "score": 0-100,
            "word_match": bool,
            "phoneme_sequence_expected": str,
            "phoneme_sequence_actual": str,
            "feedback": str,
            "similarity": float 0-1
        }
    """
    transcribed = transcribed_word_devanagari or transcribed_word_romanized or ""
    
    # Detect if transcribed text is romanized or Devanagari
    if transcribed and not is_devanagari(transcribed):
        # Convert romanized to Devanagari
        print(f"[Phoneme Scorer] Converting romanized '{transcribed}' to Devanagari")
        transcribed = romanized_to_devanagari(transcribed)
        print(f"[Phoneme Scorer] Converted to: '{transcribed}'")
    
    # Get phoneme sequences
    expected_phonemes = devanagari_to_phonemes(expected_word_devanagari)
    actual_phonemes = devanagari_to_phonemes(transcribed) if transcribed else ""
    
    # If no transcription, return 0
    if not actual_phonemes:
        return {
            "score": 0,
            "word_match": False,
            "phoneme_sequence_expected": expected_phonemes,
            "phoneme_sequence_actual": "",
            "feedback": "No speech detected. Please try again.",
            "similarity": 0.0
        }
    
    # Compare phoneme sequences
    similarity, _, _ = compute_phoneme_distance(expected_phonemes, actual_phonemes)
    score = int(round(similarity * 100))
    
    # Exact match check (after normalization)
    exact_match = normalize_devanagari(expected_word_devanagari) == normalize_devanagari(transcribed)
    
    # Generate feedback
    if score >= 90:
        feedback = "Excellent! Perfect or near-perfect pronunciation."
    elif score >= 75:
        feedback = "Great! Very close. Minor pronunciation differences."
    elif score >= 60:
        feedback = "Good! You're on the right track. Keep practicing."
    elif score >= 40:
        feedback = f"Getting there! Try again. Expected: '{expected_word_devanagari}'"
    else:
        feedback = f"Not quite. You said something different. Expected: '{expected_word_devanagari}'"
    
    return {
        "score": score,
        "word_match": exact_match,
        "phoneme_sequence_expected": expected_phonemes,
        "phoneme_sequence_actual": actual_phonemes,
        "feedback": feedback,
        "similarity": round(similarity, 3)
    }
