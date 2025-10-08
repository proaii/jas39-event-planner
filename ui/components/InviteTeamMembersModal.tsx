import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Search, UserPlus, Check, X } from 'lucide-react';

interface InviteTeamMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMembers: string[];
  onInviteMembers: (newMembers: string[]) => void;
}

// Mock data for suggested users and recent collaborators
const suggestedUsers = [
  { name: 'Jennifer Adams', email: 'jennifer.adams@university.edu', role: 'Computer Science Student', recentProject: 'Web Development Workshop' },
  { name: 'Robert Kim', email: 'robert.kim@university.edu', role: 'Engineering Student', recentProject: 'Robotics Competition' },
  { name: 'Maria Santos', email: 'maria.santos@university.edu', role: 'Design Student', recentProject: 'UI/UX Workshop' },
  { name: 'James Wilson', email: 'james.wilson@university.edu', role: 'Business Student', recentProject: 'Startup Pitch Night' },
  { name: 'Kelly Zhang', email: 'kelly.zhang@university.edu', role: 'Mathematics Student', recentProject: 'Study Group Session' },
  { name: 'Daniel Garcia', email: 'daniel.garcia@university.edu', role: 'Physics Student', recentProject: 'Science Fair' }
];

const recentCollaborators = [
  { name: 'Sarah Chen', email: 'sarah.chen@university.edu', role: 'Frequent Collaborator', lastWorkedWith: 'Last week' },
  { name: 'Michael Brown', email: 'michael.brown@university.edu', role: 'Frequent Collaborator', lastWorkedWith: '2 weeks ago' },
  { name: 'David Wilson', email: 'david.wilson@university.edu', role: 'Frequent Collaborator', lastWorkedWith: 'Last month' }
];

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

export function InviteTeamMembersModal({ 
  isOpen, 
  onClose, 
  currentMembers, 
  onInviteMembers 
}: InviteTeamMembersModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Filter users based on search query and exclude current members
  const filteredSuggested = suggestedUsers.filter(user => 
    !currentMembers.includes(user.name) &&
    (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredRecent = recentCollaborators.filter(user => 
    !currentMembers.includes(user.name) &&
    (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleToggleUser = (userName: string) => {
    setSelectedUsers(prev => 
      prev.includes(userName) 
        ? prev.filter(name => name !== userName)
        : [...prev, userName]
    );
  };

  const handleInvite = () => {
    if (selectedUsers.length > 0) {
      onInviteMembers(selectedUsers);
      setSelectedUsers([]);
      setSearchQuery('');
      onClose();
    }
  };

  const handleCancel = () => {
    setSelectedUsers([]);
    setSearchQuery('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Invite Team Members</DialogTitle>
          <DialogDescription>
            Search for and select users to invite to this event. Invited members will be able to view and collaborate on event tasks.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-6 overflow-hidden flex flex-col">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selected Users Count */}
          {selectedUsers.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <span className="text-sm font-medium text-primary">
                {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedUsers([])}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </div>
          )}

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto space-y-6">
            {/* Recent Collaborators */}
            {filteredRecent.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-foreground">Recent Collaborators</h3>
                <div className="space-y-2">
                  {filteredRecent.map((user) => (
                    <UserItem
                      key={user.email}
                      user={{
                        name: user.name,
                        email: user.email,
                        subtitle: user.lastWorkedWith,
                        badge: 'Recent'
                      }}
                      isSelected={selectedUsers.includes(user.name)}
                      onToggle={() => handleToggleUser(user.name)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Users */}
            {filteredSuggested.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-foreground">Suggested Users</h3>
                <div className="space-y-2">
                  {filteredSuggested.map((user) => (
                    <UserItem
                      key={user.email}
                      user={{
                        name: user.name,
                        email: user.email,
                        subtitle: user.recentProject,
                        badge: 'Suggested'
                      }}
                      isSelected={selectedUsers.includes(user.name)}
                      onToggle={() => handleToggleUser(user.name)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {filteredSuggested.length === 0 && filteredRecent.length === 0 && searchQuery && (
              <div className="text-center py-8 text-muted-foreground">
                <UserPlus className="w-8 h-8 mx-auto mb-3 opacity-50" />
                <p>No users found matching "{searchQuery}"</p>
                <p className="text-sm mt-1">Try searching by name or email address</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleInvite}
            disabled={selectedUsers.length === 0}
            className="min-w-[100px]"
          >
            Invite {selectedUsers.length > 0 ? `(${selectedUsers.length})` : ''}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface UserItemProps {
  user: {
    name: string;
    email: string;
    subtitle: string;
    badge: string;
  };
  isSelected: boolean;
  onToggle: () => void;
}

function UserItem({ user, isSelected, onToggle }: UserItemProps) {
  return (
    <div 
      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
        isSelected 
          ? 'border-primary/50 bg-primary/5' 
          : 'border-border hover:border-primary/30 hover:bg-muted/50'
      }`}
      onClick={onToggle}
    >
      <div className="flex items-center space-x-3">
        <Avatar className="w-10 h-10">
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium text-foreground">{user.name}</h4>
            <Badge variant="secondary" className="text-xs px-2 py-0.5">
              {user.badge}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{user.subtitle}</p>
        </div>
      </div>
      
      <div className="ml-3">
        {isSelected ? (
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30" />
        )}
      </div>
    </div>
  );
}