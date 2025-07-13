import React, { useState, useEffect } from 'react';

interface UserSearchProps {
  onSearch: (query: string) => void;
  initialValue?: string;
  placeholder?: string;
}

const UserSearch: React.FC<UserSearchProps> = ({ 
  onSearch, 
  initialValue = '', 
  placeholder = 'Search users...' 
}) => {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  
  // Update local state when initialValue changes
  useEffect(() => {
    setSearchQuery(initialValue);
  }, [initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleClear = () => {
    setSearchQuery('');
    onSearch('');
  };

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <div className="search-input-container">
        <i className="fas fa-search search-icon"></i>
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            className="clear-button"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>
      <button type="submit" className="btn btn-primary">
        Search
      </button>
    </form>
  );
};

export default UserSearch; 