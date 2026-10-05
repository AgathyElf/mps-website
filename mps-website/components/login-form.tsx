"use client";

import { useActionState } from "react";
import { signInAction, type LoginState } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: LoginState = { error: null };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    signInAction,
    initialState,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Masuk ke MPS Adyaveda</CardTitle>
        <CardDescription>
          Gunakan akun yang telah disediakan oleh administrator.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <div className="flex flex-col gap-5">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Kata sandi</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            {state.error ? (
              <p className="text-sm text-red-700" role="alert">
                {state.error}
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Memverifikasi..." : "Masuk"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
