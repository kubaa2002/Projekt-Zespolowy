import './searchProfile.scss';

const SearchProfile = ({ user }) => {
  return (
    <div className="search-profile-container">
      <img
        src={`${import.meta.env.VITE_API_URL}/img/get/user/${user?.id}`}
          alt="Community picture"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/avatar.svg";
          }}
        className="avatar"
      />
      <div className="profile-info">
        <h3 className="profile-username">{user?.userName}</h3>
      </div>
    </div>
  );
};

export default SearchProfile;
