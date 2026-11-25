import { LearnerShortcuts } from "../../components/learner/learner-shortcuts";
import { Header, Screen, SectionHeading } from "../../components/ui";
import { PasswordForm } from "../../components/profile/password-form";
import { ProfileForm } from "../../components/profile/profile-form";

export default function Profile() {
  return (
    <Screen>
      <Header canGoBack={false} />
      <ProfileForm />
      <SectionHeading eyebrow="Tiện ích" title="Dịch vụ học tập" />
      <LearnerShortcuts />
      <PasswordForm />
    </Screen>
  );
}
