import { SignUp } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <SignUp routing="path" path="/sign-up" />
    </div>
  );
}
