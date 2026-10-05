import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Akses belum tersedia</CardTitle>
            <CardDescription>
              Akun ini belum memiliki profil atau peran MPS yang valid.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <Link href="/">
              <Button variant="outline">Beranda</Button>
            </Link>
            <LogoutButton />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
