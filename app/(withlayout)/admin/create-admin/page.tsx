"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAdmin } from "@/features/admin/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { ShieldAlert } from "lucide-react";

export default function CreateAdminPage() {
  const { useCurrentUser } = useAuth();
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { createAdmin } = useAdmin();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const isSuperAdmin = user?.user?.role === "superadmin";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAdmin.mutateAsync(formData);
    setFormData({ name: "", email: "" });
  };

  if (userLoading) return <div className="p-6">Loading...</div>;

  if (!isSuperAdmin) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <ShieldAlert className="h-16 w-16 text-red-500" />
        <h1 className="text-2xl font-bold text-slate-800">Access Denied</h1>
        <p className="text-slate-600">Only Superadmins can create new administrative accounts.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create New Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email Address</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </Field>
              <Button type="submit" className="w-full" disabled={createAdmin.isPending}>
                {createAdmin.isPending ? "Creating..." : "Create Admin Account"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
