import './SearchProfile.scss';

const SearchProfile = ({ user }) => {
  return (
    <div className="search-profile-container">
      <img
        src='/avatar.svg'
        alt={`${user.userName}'s avatar`}
        className="avatar"
      />
      <div className="profile-info">
        <h3 className="profile-username">{user.userName}</h3>
      </div>
    </div>
  );
};

export default SearchProfile;
