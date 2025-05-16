import { useState } from "react";
// Assuming this value state will be higher up in comp tree. Placeholder for now
export default function SearchInput() {
    const [value, setValue] = useState('');

    return (
        <div className="input-group search-group">
            <input type="text" className="form-control form-control-lg" placeholder="Wpisz tutaj, aby wyszukać..." value={value} onChange={(e) => setValue(e.target.value)}/>
            <span className="input-group-text search-icon">
                <i className="bi bi-search p-2" style={{ cursor: "pointer", userSelect: "none" }}></i>
            </span>
        </div>
    )
}