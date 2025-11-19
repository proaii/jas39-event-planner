"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: {
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    bio: string;
  };
  onChange: (key: string, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function EditProfileModal({
  open,
  onOpenChange,
  data,
  onChange,
  onSave,
  onCancel,
}: EditProfileModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={data.firstName}
                onChange={(e) => onChange("firstName", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="middleName">Middle Name</Label>
              <Input
                id="middleName"
                value={data.middleName}
                onChange={(e) => onChange("middleName", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={data.lastName}
                onChange={(e) => onChange("lastName", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => onChange("email", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={data.phone}
              onChange={(e) => onChange("phone", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={data.location}
              onChange={(e) => onChange("location", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="bio">About Me</Label>
            <Textarea
              id="bio"
              value={data.bio}
              onChange={(e) => onChange("bio", e.target.value)}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
