  import {useState} from "react";

  const sideNavItems = [
    {
      icon: "bi bi-bar-chart-fill",
      title: "Wszystkie posty",
      subTitle: "Wszystkie posty w jednym miejscu",
    },
    {
      icon: "bi-house-door-fill",
      title: "Strona główna",
      subTitle: "Wszystkie sugerowane posty",
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


  // Hardcoded communities for now
  const communitites = [
    {
      title: "HistoriaPolski", 
      numberOfUsers: 72200
    },
    {
      title: "Fanatycy Wędkarstwa", 
      numberOfUsers: 193
    }, 
    {
      title: "matematykadlakazdego", 
      numberOfUsers: 130000
    }, 
    {
      title: "ProgramowaniewC",
      numberOfUsers: 130000
    }
  ]

const NavRow = ({ icon, title, subTitle, onClick, isSelected }) => (
  <div
    className={`sidebar-row ${isSelected ? "selected" : ""}`}
    onClick={onClick}
  >
    <div className="navrow-icon-wrapper">
      <i className={icon}></i>
    </div>
    <div className="info">
      <div className="info-title">{title}</div>
      <div className="info-subtitle">{subTitle}</div>
    </div>
  </div>
);

// Maybe insted of image in the database store the color hex??? easy to implement, we could also add color field in the /new community form
const CommunityRow = ({title, numberOfUsers, isSelected, idx, onClick}) => {
  // colors for communites (also they are random, based on index)
  const colors = [
    "#007BF5", "#A2B1BF", "#1A5591", "#153452" 
  ];
  return (
    <div className={`community-row ${isSelected ? "selected" : ""}`} onClick={onClick}>
      <div className="community-icon-wrapper" style={{backgroundColor: colors[idx]}}>
        <i className="bi bi-person"></i>
      </div>
      <div className="community-info">
        <div className="community-title">{title}</div>
        <div className="community-users">{numberOfUsers > 999 ? Number((Math.abs(numberOfUsers)/1000).toFixed(1)) + 'k' : numberOfUsers} użytkowników</div> 
      </div>
    </div>
  )
}
    
export default function SideNav () {
    const [selected, setSelected] = useState(null);
  
    return (
      <div className="side-wrapper">
        <div className="side-list-wrapper">
          <div className="sidebar-card">
            {sideNavItems.map((item, index) => (
              <NavRow
                key={index}
                icon={item.icon}
                title={item.title}
                subTitle={item.subTitle}
                onClick={() => setSelected(index)}
                isSelected={selected === index}
              />
            ))}
          </div>
          <div className="sidebar-card">
            <div className="community-header">
              Obserwowane społeczności
            </div>
            <div className="community-list-wrapper">
              {communitites.map((community, index) => (
                <CommunityRow 
                  key={community.title} 
                  title={community.title} 
                  numberOfUsers={community.numberOfUsers}
                  idx={index % 4} // solution for now :P
                  onClick={() => setSelected(index+4)} // +4 as there are alredy 4 items in the first list. Probably should be refactored in the future
                  isSelected={selected === index+4}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };