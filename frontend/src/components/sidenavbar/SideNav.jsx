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



const NavRow = ({ icon, title, subTitle, onClick, isSelected }) => (
  <div
    className={`sidebar-row ${isSelected ? "selected" : ""}`}
    onClick={onClick}
  >
    <div className="sidebar-icon-wrapper">
      <i className={icon}></i>
    </div>
    <div className="info">
      <div className="info-title">{title}</div>
      <div className="info-subtitle">{subTitle}</div>
    </div>
  </div>
);
    
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
        </div>
      </div>
    );
  };