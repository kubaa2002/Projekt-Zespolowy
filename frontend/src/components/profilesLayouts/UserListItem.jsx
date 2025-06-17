import { Link } from "@tanstack/react-router";

const UserListItem = ({ url, name, link }) => {
  return (
    <Link
      to={link}
      className="list-group-item list-group-item-action d-flex align-items-center p-3 text-decoration-none"
      style={{ minWidth: '300px', maxWidth: '300px' }}
    >
      <img
        src={url} onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/avatar.svg"; 
                }}
        alt={`${name}'s avatar`}
        className="rounded-circle me-3"
        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
      />
      <span>{name}</span>
    </Link>
  );
};

export default UserListItem;