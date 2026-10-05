import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/auth/actions";

export function LogoutButton({ className }: { className?: string } = {}) {
  return (
    <form action={signOutAction}>
      <Button className={className} type="submit">Logout</Button>
    </form>
  );
}
