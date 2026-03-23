'use client'
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Field,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/features/auth/hooks/useAuth"

export function AdminLoginForm({
    className,
    ...props
}: React.ComponentProps<"form">) {
    const { loginAdmin } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await loginAdmin.mutateAsync({ email, password });
    }

    return (
        <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleSubmit}>
            <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-green-700 text-2xl font-bold">Admin Portal</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Enter your administrative credentials to continue
                    </p>
                </div>
                <Field>
                    <FieldLabel htmlFor="email">Admin Email</FieldLabel>
                    <Input 
                        id="email" 
                        type="email" 
                        placeholder="admin@bidooze.com" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input 
                        id="password" 
                        type="password" 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <div className="flex items-center justify-end">
                        <a
                            href="/forgot-password?panel=admin"
                            className="ml-auto text-sm underline-offset-4 hover:underline"
                        >
                            Forgot your password?
                        </a>
                    </div>
                </Field>
                <Field>
                    <Button type="submit" disabled={loginAdmin.isPending}>
                        {loginAdmin.isPending ? "Authenticating..." : "Login as Admin"}
                    </Button>
                </Field>
            </FieldGroup>
        </form>
    )
}
