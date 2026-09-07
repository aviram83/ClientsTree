import * as React from 'react';
import { SearchBar } from 'client';

/** Controlled input — the dashboard owns the query and passes the setter down. */
export const Empty = () => {
  const [q, setQ] = React.useState('');
  return (
    <div className="w-96 rounded-full border bg-card px-4 py-3">
      <SearchBar searchQuery={q} setSearchQuery={setQ} />
    </div>
  );
};

/** With a query typed: the clear affordance appears at the RTL trailing edge. */
export const WithQuery = () => {
  const [q, setQ] = React.useState('דנה');
  return (
    <div className="w-96 rounded-full border bg-card px-4 py-3">
      <SearchBar searchQuery={q} setSearchQuery={setQ} />
    </div>
  );
};
