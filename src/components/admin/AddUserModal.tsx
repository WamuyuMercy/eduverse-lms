"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createUserSchema, type CreateUserInput } from "@/lib/validations";
import type { Class } from "@/types";

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddUserModal({ open, onClose, onSuccess }: AddUserModalProps) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      role: "STUDENT",
      curriculum: "IGCSE",
    },
  });

  const role = watch("role");
  const curriculum = watch("curriculum");

  useEffect(() => {
    if (open) {
      const fetchClasses = async () => {
        const res = await fetch(`/api/classes${curriculum ? `?curriculum=${curriculum}` : ""}`);
        const data = await res.json();
        if (data.success) setClasses(data.data);
      };
      fetchClasses();
    }
  }, [open, curriculum]);

  const onSubmit = async (data: CreateUserInput) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (result.success) {
        reset();
        onSuccess();
      } else {
        setServerError(result.error || "Failed to create user");
      }
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setServerError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create an account for a new student, teacher, or administrator.
          </DialogDescription>
        </DialogHeader>

        {serverError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Jane Wanjiku"
            error={errors.name?.message}
            {...register("name")}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="jane@example.com"
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Min. 8 characters"
            error={errors.password?.message}
            {...register("password")}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="form-label">Role</label>
              <select className="form-input" {...register("role")}>
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
                <option value="ADMIN">Admin</option>
              </select>
              {errors.role && <p className="form-error">{errors.role.message}</p>}
            </div>

            {(role === "STUDENT" || role === "TEACHER") && (
              <div className="space-y-1.5">
                <label className="form-label">Curriculum</label>
                <select className="form-input" {...register("curriculum")}>
                  <option value="IGCSE">IGCSE</option>
                  <option value="CBC">CBC</option>
                </select>
              </div>
            )}
          </div>

          {role === "STUDENT" && (
            <div className="space-y-1.5">
              <label className="form-label">Assign to Class</label>
              <select className="form-input" {...register("classId")}>
                <option value="">— Select class —</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.gradeLevel})
                  </option>
                ))}
              </select>
            </div>
          )}

          <Input
            label="Phone (optional)"
            type="tel"
            placeholder="+254 7XX XXX XXX"
            {...register("phone")}
          />

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating...
                </>
              ) : (
                "Create User"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
