  import {useCallback, useEffect, useState} from "react";
  import getColor from "../../utils/getColor";
  import { useAuth } from "../../contexts/authProvider";
  import axios from "axios";
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
    },
    {
      title: "MiłośnicyAstronomii",
      numberOfUsers: 45000
    },
    {
      title: "GotowanieZPasją",
      numberOfUsers: 82000
    },
    {
      title: "PolskaLiteratura",
      numberOfUsers: 15800
    },
    {
      title: "KinoEuropejskie",
      numberOfUsers: 12100
    },
    {
      title: "ZdrowiePsychicznePL",
      numberOfUsers: 50000
    },
    {
      title: "Motoryzacja24h",
      numberOfUsers: 60000
    },
    {
      title: "SzachyOnline",
      numberOfUsers: 27800
    },
    {
      title: "ZróbToSamDIY",
      numberOfUsers: 39200
    },
    {
      title: "EkonomiaDlaWszystkich",
      numberOfUsers: 47200
    },
    {
      title: "GóryiSzlaki",
      numberOfUsers: 21500
    },
    {
      title: "NaukaAngielskiego",
      numberOfUsers: 134000
    },
    {
      title: "MinecraftPL",
      numberOfUsers: 98000
    },
    {
      title: "Linuxowcy",
      numberOfUsers: 42000
    },
    {
      title: "RozwójOsobisty",
      numberOfUsers: 61000
    },
    {
      title: "PolitykaNaTrzeźwo",
      numberOfUsers: 35000
    },
    {
      title: "E-sportPolska",
      numberOfUsers: 72000
    }
  ];

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

const CommunityRow = ({title, numberOfUsers, isSelected, onClick}) => {
  return (
    <div className={`community-row ${isSelected ? "selected" : ""}`} onClick={onClick}>
      <div className="community-icon-wrapper" style={{backgroundColor: getColor(title)}}>
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
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // app.py blocked by cors policy, doesn't return id anyway. No endpoint on .net

    // const {token} = useAuth();
    // const decoded = jwt_decode(token);
    // const userId = decoded.user_id;

    

    // useEffect(() => {
    //   const serachUserCommunities = async  () => {
    //     setLoading(true);
    //     try{
    //     axios.get(`${import.meta.env.VITE_API_URL}/${userId}/communities`, {
    //       headers: {
    //         Authorization: `Bearer ${token}`
    //       }
    //     })
    //   } catch(err) {
    //     setError(err);
    //   } finally {
    //     setLoading(false);
    //   }
    //   };

    //   serachUserCommunities();
    // })

    if (error) return <div>Error: {error}</div>;
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
              {loading && data.length === 0 && <p>Ładowanie...</p>}
              {communitites.map((community, index)=> (
                <CommunityRow 
                  key={community.title}  
                  title={community.title} 
                  numberOfUsers={community.numberOfUsers}
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