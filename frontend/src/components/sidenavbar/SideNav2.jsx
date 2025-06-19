import getColor from "../../utils/getColor";
import { Link } from "@tanstack/react-router";
import { useAuth } from "../../contexts/authProvider";
import useGetCommunities from "../../hooks/useGetCommunities";
import { CommunityRow } from "./SideNav";


export default function SideNav2() {
  const { user } = useAuth();
  const { communities, isLoading, error } = useGetCommunities(user?.id);
  

  if (error) return <div>Error: {error.message}</div>;
  return (
    <div className="side-wrapper user-select-none b2 side-nav-2 ">
      <div className="side-list-wrapper">
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
