import SideNav from "../sidenavbar/SideNav";
import SideNav2 from "../sidenavbar/SideNav2";

export default function MainLayout({ children, centered }) {
  return (
    <div className="main-container">
      <SideNav />
      <div className={`main-wrapper${centered ? " main-wrapper-centered" : ""}`}>
        {children}
      </div>
      <SideNav2 />
    </div>
  );
}