import '../index.css';

const FilterSearch = ({ setSearchTerm }) => (
  <input
    className="skill-search-bar"
    placeholder="Search skill..."
    onChange={e => setSearchTerm(e.target.value)}
  />
);

export default FilterSearch;