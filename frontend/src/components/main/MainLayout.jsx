import SideNav from "../sidenavbar/SideNav";

export default function MainLayout({ children, centered }) {
  return (
    <div className="main-container">
      <SideNav />
      <div className={`main-wrapper${centered ? " main-wrapper-centered" : ""}`}>
        {children}
      </div>
    </div>
  );
}