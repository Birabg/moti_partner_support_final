import { useAuth } from "../../context/useAuth";

import AdminPageHero from "../../components/admin/AdminPageHero";

import AccountSettings from
"../../components/settings/AccountSettings";

import SecuritySettings from
"../../components/settings/SecuritySettings";

import NotificationSettings from
"../../components/settings/NotificationSettings";

import SystemInformation from
"../../components/settings/SystemInformation";

import DangerZone from
"../../components/settings/DangerZone";

export default function SettingsPage() {

    const { user } = useAuth();

    return (

        <div className="space-y-8">

            <AdminPageHero
                eyebrow="Administration"
                title="Settings"
                description="Manage your account and system preferences."
            />

            <div
            className="
            grid
            md:grid-cols-2
            gap-6
            "
            >
                <AccountSettings
                    user={user}
                />

                <SecuritySettings />

                <NotificationSettings />

                <SystemInformation />
            </div>

            <DangerZone />

        </div>
    );
}
