import '../styles/FilterSearch.css';

const FilterSearch = ({ setSearchTerm }) => (
  <input
    className="filter-search-input"
    placeholder="Search skill..."
    onChange={e => setSearchTerm(e.target.value)}
  />
);

export default FilterSearch;