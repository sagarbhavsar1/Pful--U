"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

import uniPerformance from "@/data/university_performance.json";

// Map universities to representative emojis
function getUniEmoji(name) {
    const emojiMap = {
        'Harvard': '📕', 'MIT': '🤖', 'Stanford': '🌲', 'Yale': '🐶',
        'Princeton': '🐅', 'Columbia': '🦁', 'Cornell': '🐻', 'Brown': '🐻',
        'Dartmouth': '🌲', 'NYU': '🗽', 'UCLA': '🐻', 'UC Berkeley': '🐻',
        'USC': '✌️', 'Duke': '😈', 'Georgetown': '🐶', 'Rice': '🦉',
        'Vanderbilt': '⚓', 'Emory': '🦅', 'Tufts': '🐘', 'Brandeis': '⚖️',
        'Northwestern': '🐱', 'Michigan': '〽️', 'Notre Dame': '☘️',
        'Texas A&M': '👍', 'Penn State': '🦁', 'Ohio State': '🌰',
        'Florida State': '🍢', 'Clemson': '🐅', 'Auburn': '🦅',
        'Baylor': '🐻', 'TCU': '🐸', 'SMU': '🐴', 'LSU': '🐯',
        'Virginia Tech': '🦃', 'Purdue': '🚂', 'Iowa State': '🌪️',
        'Oregon State': '🦫', 'Boise State': '🟦', 'Gonzaga': '🐶',
        'Wake Forest': '😈', 'Tulane': '🌊', 'Spelman': '💙',
        'Morehouse': '🐅', 'Howard': '🦬', 'Northeastern': '🐾',
        'BYU': '🏔️', 'Brigham Young': '🏔️', 'Carnegie Mellon': '🏗️',
        'Johns Hopkins': '🩺', 'Boston University': '🐕', 'American': '🦅',
        'George Washington': '🏛️', 'Cal Poly': '🐎',
        'Arizona State': '😈', 'Colorado State': '🐏',
        'Kansas State': '🐱', 'Mississippi State': '🐶',
        'Oklahoma State': '🤠', 'Washington State': '🐆',
        'Michigan State': '💚', 'Indiana University': '🔴',
        'San Diego State': '⚡', 'San Jose State': '⚡',
        'Texas Tech': '🔴',
        'UC Irvine': '🐜', 'UC Santa Barbara': '🌊',
        'UC San Diego': '🔱', 'UC Davis': '🐄',
    };

    for (const [key, emoji] of Object.entries(emojiMap)) {
        if (name.includes(key)) return emoji;
    }

    // Fallback based on keywords
    const n = name.toLowerCase();
    if (n.includes('coastal') || n.includes('pacific') || n.includes('harbor')) return '🌊';
    if (n.includes('mountain') || n.includes('ridge') || n.includes('summit')) return '⛰️';
    if (n.includes('lake') || n.includes('river')) return '🏞️';
    if (n.includes('valley') || n.includes('prairie')) return '🌾';
    if (n.includes('northern') || n.includes('cascade')) return '🏔️';
    if (n.includes('southern')) return '☀️';
    if (n.includes('eastern') || n.includes('atlantic')) return '🌅';
    if (n.includes('western')) return '🌄';
    if (n.includes('metro') || n.includes('central') || n.includes('greater') || n.includes('upper')) return '🏙️';
    if (n.includes('institute') || n.includes('polytechnic')) return '⚙️';
    if (n.includes('university of')) return '🎓';
    return '🏫';
}

export default function UniversitySearch({ autoFocus = false }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);
    const router = useRouter();

    const search = useCallback((q) => {
        if (!q.trim()) {
            setResults([]);
            setIsOpen(false);
            return;
        }
        const lower = q.toLowerCase();
        const matches = uniPerformance
            .filter((u) => u.name.toLowerCase().includes(lower))
            .slice(0, 8);
        setResults(matches);
        setIsOpen(matches.length > 0);
        setHighlightedIndex(-1);
    }, []);

    const selectUni = useCallback(
        (uni) => {
            setQuery(uni.name);
            setIsOpen(false);
            router.push(`/parties?uni=${uni.university_id}`);
        },
        [router]
    );

    const handleKeyDown = (e) => {
        if (!isOpen) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightedIndex((prev) => Math.min(prev + 1, results.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightedIndex((prev) => Math.max(prev - 1, 0));
        } else if (e.key === "Enter" && highlightedIndex >= 0) {
            e.preventDefault();
            selectUni(results[highlightedIndex]);
        } else if (e.key === "Escape") {
            setIsOpen(false);
        }
    };

    // Close on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target) &&
                inputRef.current &&
                !inputRef.current.contains(e.target)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <div className="search-container">
            <div className="search-input-wrapper">
                <span className="search-icon" aria-hidden="true">🔍</span>
                <input
                    ref={inputRef}
                    type="text"
                    className="search-input"
                    placeholder="Search your university…"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        search(e.target.value);
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => query && search(query)}
                    autoFocus={autoFocus}
                    autoComplete="off"
                    aria-label="Search university"
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                    role="combobox"
                    id="university-search-input"
                />
            </div>

            {isOpen && (
                <div
                    className="search-dropdown"
                    ref={dropdownRef}
                    role="listbox"
                    aria-label="University results"
                    id="university-search-results"
                >
                    {results.map((uni, i) => (
                        <div
                            key={uni.university_id}
                            className={`search-result ${i === highlightedIndex ? "highlighted" : ""}`}
                            onClick={() => selectUni(uni)}
                            onMouseEnter={() => setHighlightedIndex(i)}
                            role="option"
                            aria-selected={i === highlightedIndex}
                            id={`search-result-${uni.university_id}`}
                        >
                            <div className="search-result-icon">{getUniEmoji(uni.name)}</div>
                            <div className="search-result-info">
                                <div className="search-result-name">{uni.name}</div>
                                <div className="search-result-detail">
                                    {uni.region} • {uni.type} • {uni.student_population.toLocaleString()} users
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
