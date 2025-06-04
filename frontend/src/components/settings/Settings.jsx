import MainLayout from "../main/MainLayout";
import AccountForm from "./AccountForm";

export default function Settings() {
  return (
    <MainLayout>
        <div className="centered-container">
            <div className="settings-container">
                
                <AccountForm />
            </div>
        </div>
    </MainLayout>
    );
}