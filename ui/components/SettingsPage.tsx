import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { User, Bell, Palette, Shield, HelpCircle, Edit, Save, X, Mail, Phone, MapPin } from 'lucide-react';
import { Sidebar } from './Sidebar';

interface SettingsPageProps {
  currentUser: string;
  onBack: () => void;
  defaultTab?: string;
  // Navigation handlers
  onNavigateToDashboard: () => void;
  onNavigateToEvents: () => void;
  onNavigateToTasks: () => void;
  onNavigateToCalendar: () => void;
  onNavigateToSettings: () => void;
  onStyleGuide?: () => void;
}

export function SettingsPage({ 
  currentUser, 
  onBack,
  defaultTab = "profile",
  onNavigateToDashboard,
  onNavigateToEvents,
  onNavigateToTasks,
  onNavigateToCalendar,
  onNavigateToSettings,
  onStyleGuide 
}: SettingsPageProps) {
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [taskReminders, setTaskReminders] = useState(true);
  const [eventUpdates, setEventUpdates] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  // Appearance settings - check for saved preference and system preference
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      if (saved !== null) {
        return JSON.parse(saved);
      }
      // Check system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [compactView, setCompactView] = useState(false);

  // Privacy settings
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [activityTracking, setActivityTracking] = useState(true);

  // Profile settings
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Parse the current user's name into components
  const parseFullName = (fullName: string) => {
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) {
      return { firstName: parts[0], middleName: '', lastName: '' };
    } else if (parts.length === 2) {
      return { firstName: parts[0], middleName: '', lastName: parts[1] };
    } else {
      return { 
        firstName: parts[0], 
        middleName: parts.slice(1, -1).join(' '), 
        lastName: parts[parts.length - 1] 
      };
    }
  };

  const [profileData, setProfileData] = useState({
    ...parseFullName(currentUser),
    email: 'alex.johnson@university.edu',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    bio: 'Computer Science student passionate about technology and event organizing. Always excited to collaborate on innovative projects and bring ideas to life.'
  });

  const [editProfileData, setEditProfileData] = useState(profileData);

  // Helper function to get initials from name components
  const getInitials = (firstName: string, middleName: string, lastName: string) => {
    const initials = [];
    if (firstName) initials.push(firstName[0]);
    if (middleName) initials.push(middleName[0]);
    if (lastName) initials.push(lastName[0]);
    return initials.join('').toUpperCase();
  };

  // Helper function to get full name from components
  const getFullName = (firstName: string, middleName: string, lastName: string) => {
    const parts = [firstName, middleName, lastName].filter(part => part.trim());
    return parts.join(' ');
  };

  const handleSaveProfile = () => {
    setProfileData(editProfileData);
    setIsEditingProfile(false);
  };

  const handleCancelProfile = () => {
    setEditProfileData(profileData);
    setIsEditingProfile(false);
  };

  // Apply dark mode on mount
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="flex min-h-full">
      {/* Left Sidebar */}
      <Sidebar
        currentView="settings"
        onNavigateToDashboard={onNavigateToDashboard}
        onNavigateToEvents={onNavigateToEvents}
        onNavigateToTasks={onNavigateToTasks}
        onNavigateToCalendar={onNavigateToCalendar}
        onNavigateToSettings={() => {}} // No-op since we're already on settings
        onStyleGuide={onStyleGuide}
      />
      
      {/* Main Content */}
      <main className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences and application settings</p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Privacy
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
                {!isEditingProfile ? (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingProfile(true)}
                    className="border-primary text-primary hover:bg-primary hover:text-white"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelProfile}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveProfile}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Avatar and Basic Info */}
              <div className="flex items-start space-x-6">
                <div className="flex flex-col items-center space-y-3">
                  <Avatar className="w-24 h-24">
                    <AvatarFallback className="bg-primary text-white text-2xl">
                      {getInitials(profileData.firstName, profileData.middleName, profileData.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  {isEditingProfile && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        // In a real app, this would open a file picker
                        alert('Profile picture upload would be implemented here');
                      }}
                    >
                      <Edit className="w-3 h-3 mr-2" />
                      Change Photo
                    </Button>
                  )}
                </div>
                
                <div className="flex-1 space-y-4">
                  {/* Name Fields */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="w-4 h-4" />
                      <span className="font-medium">Name</span>
                    </div>
                    
                    {isEditingProfile ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* First Name */}
                        <div className="space-y-1">
                          <Label htmlFor="profile-first-name" className="text-sm text-muted-foreground">
                            First Name
                          </Label>
                          <Input
                            id="profile-first-name"
                            value={editProfileData.firstName}
                            onChange={(e) => setEditProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                            placeholder="Enter first name"
                          />
                        </div>

                        {/* Middle Name */}
                        <div className="space-y-1">
                          <Label htmlFor="profile-middle-name" className="text-sm text-muted-foreground">
                            Middle Name <span className="text-xs">(optional)</span>
                          </Label>
                          <Input
                            id="profile-middle-name"
                            value={editProfileData.middleName}
                            onChange={(e) => setEditProfileData(prev => ({ ...prev, middleName: e.target.value }))}
                            placeholder="Enter middle name"
                          />
                        </div>

                        {/* Last Name */}
                        <div className="space-y-1">
                          <Label htmlFor="profile-last-name" className="text-sm text-muted-foreground">
                            Last Name
                          </Label>
                          <Input
                            id="profile-last-name"
                            value={editProfileData.lastName}
                            onChange={(e) => setEditProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                            placeholder="Enter last name"
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-foreground font-medium">
                        {getFullName(profileData.firstName, profileData.middleName, profileData.lastName)}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="profile-email" className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>Email Address</span>
                    </Label>
                    {isEditingProfile ? (
                      <Input
                        id="profile-email"
                        type="email"
                        value={editProfileData.email}
                        onChange={(e) => setEditProfileData(prev => ({ ...prev, email: e.target.value }))}
                        className="max-w-md"
                      />
                    ) : (
                      <p className="text-foreground">{profileData.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="profile-phone" className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>Phone Number</span>
                  </Label>
                  {isEditingProfile ? (
                    <Input
                      id="profile-phone"
                      value={editProfileData.phone}
                      onChange={(e) => setEditProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  ) : (
                    <p className="text-foreground">{profileData.phone}</p>
                  )}
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="profile-location" className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>Location</span>
                  </Label>
                  {isEditingProfile ? (
                    <Input
                      id="profile-location"
                      value={editProfileData.location}
                      onChange={(e) => setEditProfileData(prev => ({ ...prev, location: e.target.value }))}
                    />
                  ) : (
                    <p className="text-foreground">{profileData.location}</p>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="profile-bio">About Me</Label>
                {isEditingProfile ? (
                  <textarea
                    id="profile-bio"
                    value={editProfileData.bio}
                    onChange={(e) => setEditProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full min-h-[100px] p-3 border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-foreground leading-relaxed">{profileData.bio}</p>
                )}
              </div>

              {/* Activity Statistics */}
              <div className="grid md:grid-cols-3 gap-6 pt-6 border-t border-border">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">12</div>
                  <div className="text-sm text-muted-foreground">Events Organized</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">45</div>
                  <div className="text-sm text-muted-foreground">Tasks Completed</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">8</div>
                  <div className="text-sm text-muted-foreground">Active Collaborations</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Notifications */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-foreground mb-2">Email Notifications</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Receive notifications via email about important updates.
                  </p>
                </div>
                
                <div className="flex items-start justify-between">
                  <Label htmlFor="email-notifications" className="flex flex-col gap-1 items-start">
                    <span>Email Notifications</span>
                    <span className="text-sm text-muted-foreground font-normal">
                      Get notified about events and tasks via email
                    </span>
                  </Label>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-start justify-between">
                  <Label htmlFor="task-reminders" className="flex flex-col gap-1 items-start">
                    <span>Task Reminders</span>
                    <span className="text-sm text-muted-foreground font-normal">
                      Get reminded about upcoming task deadlines
                    </span>
                  </Label>
                  <Switch
                    id="task-reminders"
                    checked={taskReminders}
                    onCheckedChange={setTaskReminders}
                    disabled={!emailNotifications}
                  />
                </div>

                <div className="flex items-start justify-between">
                  <Label htmlFor="event-updates" className="flex flex-col gap-1 items-start">
                    <span>Event Updates</span>
                    <span className="text-sm text-muted-foreground font-normal">
                      Get notified when events are created or modified
                    </span>
                  </Label>
                  <Switch
                    id="event-updates"
                    checked={eventUpdates}
                    onCheckedChange={setEventUpdates}
                    disabled={!emailNotifications}
                  />
                </div>

                <div className="flex items-start justify-between">
                  <Label htmlFor="weekly-digest" className="flex flex-col gap-1 items-start">
                    <span>Weekly Digest</span>
                    <span className="text-sm text-muted-foreground font-normal">
                      Receive a weekly summary of your events and tasks
                    </span>
                  </Label>
                  <Switch
                    id="weekly-digest"
                    checked={weeklyDigest}
                    onCheckedChange={setWeeklyDigest}
                    disabled={!emailNotifications}
                  />
                </div>
              </div>

              <Separator />

              {/* In-App Notifications */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-foreground mb-2">In-App Notifications</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Control how you receive notifications within the application.
                  </p>
                </div>

                <div className="flex items-start justify-between">
                  <Label htmlFor="in-app-notifications" className="flex flex-col gap-1 items-start">
                    <span>In-App Notifications</span>
                    <span className="text-sm text-muted-foreground font-normal">
                      Show notifications in the application interface
                    </span>
                  </Label>
                  <Switch
                    id="in-app-notifications"
                    checked={inAppNotifications}
                    onCheckedChange={setInAppNotifications}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Appearance Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme Settings */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-foreground mb-2">Theme</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose how the application looks and feels.
                  </p>
                </div>

                <div className="flex items-start justify-between">
                  <Label htmlFor="dark-mode" className="flex flex-col gap-1 items-start">
                    <span>Dark Mode</span>
                    <span className="text-sm text-muted-foreground font-normal">
                      Use dark theme for better readability in low light
                    </span>
                  </Label>
                  <Switch
                    id="dark-mode"
                    checked={darkMode}
                    onCheckedChange={(checked) => {
                      setDarkMode(checked);
                      // Save preference
                      localStorage.setItem('darkMode', JSON.stringify(checked));
                      // Toggle dark mode class on document
                      if (checked) {
                        document.documentElement.classList.add('dark');
                      } else {
                        document.documentElement.classList.remove('dark');
                      }
                    }}
                  />
                </div>
              </div>

              <Separator />

              {/* Layout Settings */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-foreground mb-2">Layout</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Customize the layout and density of information.
                  </p>
                </div>

                <div className="flex items-start justify-between">
                  <Label htmlFor="compact-view" className="flex flex-col gap-1 items-start">
                    <span>Compact View</span>
                    <span className="text-sm text-muted-foreground font-normal">
                      Show more information in less space
                    </span>
                  </Label>
                  <Switch
                    id="compact-view"
                    checked={compactView}
                    onCheckedChange={setCompactView}
                  />
                </div>
              </div>

              <Separator />

              {/* Color Scheme */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-foreground mb-2">Color Scheme</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    The application uses a blue and gray color palette optimized for clarity and accessibility.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-primary"></div>
                    <span className="text-sm text-muted-foreground">Primary Blue (#4A90E2)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-secondary"></div>
                    <span className="text-sm text-muted-foreground">Secondary Green (#50E3C2)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Privacy */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-foreground mb-2">Profile Privacy</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Control who can see your profile information and activity.
                  </p>
                </div>

                <div className="flex items-start justify-between">
                  <Label htmlFor="profile-visibility" className="flex flex-col gap-1 items-start">
                    <span>Profile Visibility</span>
                    <span className="text-sm text-muted-foreground font-normal">
                      Allow other users to see your profile information
                    </span>
                  </Label>
                  <Switch
                    id="profile-visibility"
                    checked={profileVisibility}
                    onCheckedChange={setProfileVisibility}
                  />
                </div>

                <div className="flex items-start justify-between">
                  <Label htmlFor="activity-tracking" className="flex flex-col gap-1 items-start">
                    <span>Activity Tracking</span>
                    <span className="text-sm text-muted-foreground font-normal">
                      Allow the system to track your activity for analytics
                    </span>
                  </Label>
                  <Switch
                    id="activity-tracking"
                    checked={activityTracking}
                    onCheckedChange={setActivityTracking}
                  />
                </div>
              </div>

              <Separator />

              {/* Data Management */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-foreground mb-2">Data Management</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage your data and account settings.
                  </p>
                </div>

                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Export My Data
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Help & Support */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-foreground mb-2">Help & Support</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get help and learn more about privacy policies.
                  </p>
                </div>

                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Privacy Policy
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Terms of Service
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </main>
    </div>
  );
}