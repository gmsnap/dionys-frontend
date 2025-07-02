import React from 'react';

export enum SortOption {
  Newest = 'Newest',
  Unread = 'Unread',
  Unanswered = 'Unanswered',
  Done = 'Done'
}

interface Props {
  value: SortOption;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

const SortDropdown: React.FC<Props> = ({ value, onChange }) => {
  return (
    <select value={value} onChange={onChange} style={{ marginLeft: 8, padding: 4 }}>
      <option value={SortOption.Newest}>Neue Anfragen</option>
      <option value={SortOption.Unread}>ungelesene Nachrichten</option>
      <option value={SortOption.Unanswered}>Antwort ausstehend</option>
      <option value={SortOption.Done}>erledigt</option>
    </select>
  );
};

export default SortDropdown;
