import './SearchProfile.scss';

const SearchProfile = ({ user }) => {
  return (
    <div className="search-profile-container">
      <img
        src={user.avatarUrl || 'avatar.svg'}
        alt={`${user.username}'s avatar`}
        className="avatar"
      />
      <div className="profile-info">
        <h3 className="profile-username">{user.username}</h3>
        <p className="profile-email">{user.email}</p>
      </div>
    </div>
  );
};

export default SearchProfile;
