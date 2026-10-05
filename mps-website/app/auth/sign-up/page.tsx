import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Akun MPS Adyaveda</CardTitle>
            <CardDescription>
              Pendaftaran akun mandiri tidak tersedia.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Akun dibuat atau diundang oleh administrator. Hubungi pengurus
              MPS untuk mendapatkan akses.
            </p>
            <Link
              className="inline-block font-medium text-foreground underline underline-offset-4"
              href="/auth/login"
            >
              Kembali ke halaman masuk
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
