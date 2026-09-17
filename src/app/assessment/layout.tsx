// Standalone layout for the /assessment/* routes.
// This intentionally renders ONLY {children}: no sidebar, no nav bar, no header.
// The assessment form is a clean, full-screen supplier-facing experience.
export default function AssessmentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
