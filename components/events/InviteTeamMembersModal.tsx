'use client';

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Check, UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { EventMember, UserLite } from "@/lib/types";
import { useFetchUsers } from "@/lib/client/features/users/hooks";
import { useAddMember } from "@/lib/client/features/members/hooks";

interface InviteTeamMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  currentMembers: EventMember[];
  onMembersUpdated?: (newMembers: EventMember[]) => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function InviteTeamMembersModal({
  isOpen,
  onClose,
  eventId,
  currentMembers,
  onMembersUpdated,
}: InviteTeamMembersModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<UserLite[]>([]);
  const [isInviting, setIsInviting] = useState(false);

  const { data: allUsers = [] } = useFetchUsers({ q: searchQuery, enabled: isOpen });

  const addMemberMutation = useAddMember(eventId);

  const availableUsers: UserLite[] = allUsers.filter(
    (u) => !currentMembers.some((m) => m.userId === u.userId)
  );

  const handleToggleUser = (user: UserLite) => {
    if (isInviting) return; // Prevent selection while inviting
    
    setSelectedUsers((prev) =>
      prev.some((u) => u.userId === user.userId)
        ? prev.filter((u) => u.userId !== user.userId)
        : [...prev, user]
    );
  };

  const handleInvite = async () => {
    if (!selectedUsers.length || isInviting) return;

    setIsInviting(true);

    try {
      // Invite all selected users
      await Promise.all(
        selectedUsers.map((u) => 
          addMemberMutation.mutateAsync({ memberId: u.userId })
        )
      );

      const newMembers: EventMember[] = [
        ...currentMembers,
        ...selectedUsers.map((u) => ({
          eventMemberId: `demo-${u.userId}-${Date.now()}`,
          userId: u.userId,
          eventId,
          joinedAt: new Date().toISOString(),
        })),
      ];

      toast.success(
        `Successfully invited ${selectedUsers.length} member${selectedUsers.length > 1 ? 's' : ''}!`
      );
      
      onMembersUpdated?.(newMembers);
      setSelectedUsers([]);
      setSearchQuery("");
      onClose();
    } catch (err: any) {
      console.error('Failed to invite members:', err);
      toast.error(err?.message || "Failed to invite members. Please try again.");
    } finally {
      setIsInviting(false);
    }
  };

  const handleClose = () => {
    if (!isInviting) {
      setSelectedUsers([]);
      setSearchQuery("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Invite Team Members</DialogTitle>
          <DialogDescription>
            Search and select users to invite to this event.
          </DialogDescription>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            disabled={isInviting}
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {availableUsers.length > 0 ? (
            availableUsers.map((user) => {
              const isSelected = selectedUsers.some((u) => u.userId === user.userId);
              return (
                <div
                  key={user.userId}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    isSelected
                      ? "border-primary/50 bg-primary/5"
                      : "border-border hover:border-primary/30 hover:bg-muted/50"
                  } ${isInviting ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={() => handleToggleUser(user)}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <UserPlus className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p>No users found.</p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-border">
          <Button 
            variant="outline" 
            onClick={handleClose} 
            disabled={isInviting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleInvite}
            disabled={selectedUsers.length === 0 || isInviting}
            className="min-w-[100px]"
          >
            {isInviting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Inviting...
              </>
            ) : (
              `Invite${selectedUsers.length > 0 ? ` (${selectedUsers.length})` : ""}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}