import { useState, useEffect } from "react";
import "./SearchBar.css";

interface Props {
  onSearch?: (lat: number, lon: number, name?: string) => void;
}

const SearchBar: React.FC<Props> = ({ onSearch }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.trim().length > 2) {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`)
          .then((res) => res.json())
          .then((data) => setSuggestions(data));
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSelect = (lat: string, lon: string, display_name: string) => {
    setQuery(display_name);
    setSuggestions([]);
    onSearch?.(parseFloat(lat), parseFloat(lon), display_name);
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
    );
    const data = await res.json();

    if (data.length > 0) {
      const { lat, lon, display_name } = data[0];
      onSearch?.(parseFloat(lat), parseFloat(lon), display_name);
      setSuggestions([]);
    } else {
      alert("Ništa nije pronađeno.");
    }
  };

  return (
    <div className="search-container">
      <div className="search-inner-wrapper">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Pretraži lokaciju..."
          className="search-input"
        />
        {suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map((s, idx) => (
              <li
                key={idx}
                className="suggestion-item"
                onClick={() => handleSelect(s.lat, s.lon, s.display_name)}
              >
                {s.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button onClick={handleSearch} className="search-button">
        🔍
      </button>
    </div>
  );
};

export default SearchBar;
