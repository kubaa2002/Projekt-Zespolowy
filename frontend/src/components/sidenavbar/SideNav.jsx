import getColor from "../../utils/getColor";
import { Link } from "@tanstack/react-router";
import { useAuth } from "../../contexts/authProvider";
import useGetCommunities from "../../hooks/useGetCommunities";
const sideNavItems = [
  {
    icon: "bi bi-bar-chart-fill",
    title: "Wszystkie posty",
    subTitle: "Wszystkie posty w jednym miejscu",
    linkTo: "/",
  },
  {
    icon: "bi-house-door-fill",
    title: "Strona główna",
    subTitle: "Wszystkie posty w jednym miejscu",
    linkTo: "/",
  },
  {
    icon: "bi bi-bookmark-fill",
    title: "Zapisane posty",
    subTitle: "Twoje zapisane posty",
  },
  {
    icon: "bi-person-plus-fill",
    title: "Obserwowani użytkownicy",
    subTitle: "Zobacz, co nowego u twoich obserwowanych",
  },
];


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

const CommunityRow = ({ title, numberOfUsers, link }) => {
  return (
    <Link to={link} activeProps={{ className: `selected` }}>
      <div className={`community-row`}>
        <div
          className="community-icon-wrapper"
          style={{ backgroundColor: getColor(title) }}
        >
          <i className="bi bi-person"></i>
        </div>
        <div className="community-info">
          <div className="community-title">{title}</div>
          <div className="community-users">
            {numberOfUsers > 999
              ? Number((Math.abs(numberOfUsers) / 1000).toFixed(1)) + "k"
              : numberOfUsers}{" "}
            użytkowników
          </div>
        </div>
      </div>
    </Link>
  );
};

export default function SideNav() {
  const { user } = useAuth();
  const {communities, isLoading, error} = useGetCommunities(user?.id); 

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
              link={item.linkTo || "/notImplemented"}
            />
          ))}
        </div>
        <div className="sidebar-card user-select-none">
          <div className="community-header">Obserwowane społeczności</div>
          <div className="community-list-wrapper">
            {isLoading && communities.length === 0 && <p>Ładowanie...</p>}
            {communities.map(community => (
              <CommunityRow
                key={community.name}
                title={community.name}
                link={`/communities/${community.id}`}
                numberOfUsers={404} // endpoint doesn't return number of users
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
