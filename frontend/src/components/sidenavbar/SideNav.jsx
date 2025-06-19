import getColor from "../../utils/getColor";
import { Link } from "@tanstack/react-router";
import { useAuth } from "../../contexts/authProvider";
import useGetCommunities from "../../hooks/useGetCommunities";

const NavRow = ({ icon, title, subTitle, onClick, link }) => (
  <Link
    to={link}
    className={`sidebar-row`}
    activeProps={{ className: `selected` }}
    onClick={onClick}
  >
    <div className="navrow-icon-wrapper">
      <i className={icon}></i>
    </div>
    <div className="info">
      <div className="info-title">{title}</div>
      <div className="info-subtitle">{subTitle}</div>
    </div>
  </Link>
);

const CommunityRow = ({ title, numberOfUsers, id }) => {
  return (
    <Link to={`/communities/${id}`} activeProps={{ className: `selected` }}>
      <div className={`community-row`}>
        <img
          className="community-picture"
          src={`${import.meta.env.VITE_API_URL}/img/get/community/${id}`}
          alt="Community picture"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/avatar.svg";
          }}
        />
        <div className="community-info">
          <div className="community-title">{title}</div>
          <div className="community-users">
            {numberOfUsers > 999
              ? Number((Math.abs(numberOfUsers) / 1000).toFixed(1)) + "k"
              : numberOfUsers}{" "}
            {numberOfUsers == 1 ? "użytkownik" : "użytkowników"}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default function SideNav() {
  const { user } = useAuth();
  const { communities, isLoading, error } = useGetCommunities(user?.id);
  const sideNavItems = [
    {
      icon: "bi-house-door-fill",
      title: "Strona główna",
      subTitle: "Wszystkie posty w jednym miejscu",
      linkTo: "/",
    },
    {
      icon: "bi-person-plus-fill",
      title: "Obserwowani użytkownicy",
      subTitle: "Zobacz, co nowego u twoich obserwowanych",
      linkTo: "/users/following",
    },
    {
      icon: "bi bi-people-fill",
      title: "Społeczności",
      subTitle: "Zobacz wszystkie społeczności",
      linkTo: "/communities/list",
    },
    {
      icon: "bi bi-person-fill",
      title: "Mój profil",
      subTitle: "Podgląd własnego profilu",
      linkTo: `/users/${user?.id}`,
    },
    {
      icon: "bi bi bi-gear-fill",
      title: "Ustawienia",
      subTitle: "Zmień ustawienia",
      linkTo: "/settings",
    },
  ];

  if (error) return <div>Error: {error.message}</div>;
  return (
    <div className="side-wrapper user-select-none">
      <div className="side-list-wrapper">
        <div className="sidebar-card">
          {sideNavItems.map((item, index) => (
            <NavRow
              key={index}
              icon={item.icon}
              title={item.title}
              subTitle={item.subTitle}
              link={item.linkTo}
            />
          ))}
        </div>
        <div className="sidebar-card user-select-none">
          <div className="community-header">Obserwowane społeczności</div>
          <div className="community-list-wrapper">
            {isLoading && communities.length === 0 && <p>Ładowanie...</p>}
            {communities.map((community) => (
              <CommunityRow
                key={community.name}
                title={community.name}
                link={`/communities/${community.id}`}
                numberOfUsers={community.memberCount}
                id={community.id}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
