import React from 'react';

interface SearchResultHighlightProps {
  text: string;
  searchTerm: string;
  className?: string;
}

export const SearchResultHighlight: React.FC<SearchResultHighlightProps> = ({
  text,
  searchTerm,
  className = ""
}) => {
  if (!searchTerm) {
    return <span className={className}>{text}</span>;
  }

  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => 
        regex.test(part) ? (
          <mark key={index} className="bg-yellow-200 px-0.5 rounded text-inherit">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};