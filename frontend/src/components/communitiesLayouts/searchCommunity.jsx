import './searchCommunity.scss';

const SearchCommunity = ({ community }) => {
  return (
    <div className="search-community-container">
      <img
        src={community.avatarUrl || '/avatar.svg'}
        alt={`${community.name}'s avatar`}
        className="avatar"
      />
      <div className="community-info">
        <h3 className="community-name">{community.name}</h3>
        <p className="community-description">{community.description}</p>
      </div>
    </div>
  );
};

export default SearchCommunity;