"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User, Bell, Palette, Shield, Edit } from "lucide-react";
import { useTheme } from "next-themes"; 
import { EditProfileModal } from "@/components/settings/EditProfileModal";
import { useFetchCurrentUser, useUpdateUser } from "@/lib/client/features/users/hooks";
export default function SettingsPage() {
  // ------------------- USERS -------------------
  const { data: currentUser } = useFetchCurrentUser();
  const { mutate: updateUser } = useUpdateUser();

  // ---------- Notification Settings ----------
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);

  // ---------- Theme & Appearance ----------
  const { theme, setTheme } = useTheme(); 
  const [compactView, setCompactView] = useState(false);

  // ---------- Privacy Settings ----------
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [activityTracking, setActivityTracking] = useState(true);

  // ---------- Profile Settings ----------
  const [openEditModal, setOpenEditModal] = useState(false);

  const parseFullName = (fullName: string) => {
    const parts = fullName.trim().split(" ");
    return {
      firstName: parts[0] || "",
      middleName: parts.length === 3 ? parts[1] : "",
      lastName: parts.length > 1 ? parts[parts.length - 1] : "",
    };
  };

  const [profileData, setProfileData] = useState({
    ...parseFullName(currentUser?.username ?? ""),
    email: currentUser?.email ?? "",
  });

  const [editProfileData, setEditProfileData] = useState(profileData);

  useEffect(() => {
    if (currentUser) {
      setProfileData({
        ...parseFullName(currentUser.username),
        email: currentUser.email,
      });
      setEditProfileData({
        ...parseFullName(currentUser.username),
        email: currentUser.email,
      });
    }
  }, [currentUser]);

  const getInitials = (first: string, middle: string, last: string) =>
    [first, middle, last].map((n) => n?.[0]).join("").toUpperCase();

  const getFullName = (first: string, middle: string, last: string) =>
    [first, middle, last].filter(Boolean).join(" ");

  const handleSaveProfile = () => {
    if (!currentUser?.userId) {
      console.error("User ID not found. Cannot update profile.");
      return;
    }

    updateUser(
      {
        userId: currentUser.userId,
        patch: {
          username: getFullName(
            editProfileData.firstName,
            editProfileData.middleName,
            editProfileData.lastName
          ),
        },
      },
      {
        onSuccess: () => {
          setProfileData(editProfileData);
          setOpenEditModal(false);
        },
        onError: (error) => {
          console.error("Failed to update profile:", error);
        },
      }
    );
  };

  const handleCancelProfile = () => {
    setEditProfileData(profileData);
    setOpenEditModal(false);
  };

  return (
    <main className="flex-1 p-8 space-y-6 max-w-5xl mx-auto">
      <h1 className="text-foreground text-2xl font-bold">Settings</h1>
      <p className="text-muted-foreground mb-6">
        Manage your account preferences and application settings
      </p>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="w-4 h-4" /> Appearance
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="w-4 h-4" /> Privacy
          </TabsTrigger>
        </TabsList>

        {/* ========================= PROFILE TAB ========================= */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" /> Profile Information
              </CardTitle>

              <Button variant="outline" onClick={() => setOpenEditModal(true)}>
                <Edit className="w-4 h-4 mr-1" /> Edit Profile
              </Button>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Profile Info */}
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarFallback>
                    {getInitials(
                      profileData.firstName,
                      profileData.middleName,
                      profileData.lastName
                    )}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 grid md:grid-cols-2 gap-x-8 gap-y-4">
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">Name</Label>
                    <p className="text-foreground font-medium">
                      {getFullName(
                        profileData.firstName,
                        profileData.middleName,
                        profileData.lastName
                      )}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">
                      Email Address
                    </Label>
                    <p>{profileData.email}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* About */}
              <div>
                <Label className="text-sm text-muted-foreground">About Me</Label>
                <p className="text-foreground mt-1">{currentUser?.bio || "No bio provided."}</p>
              </div>

              <Separator />

              {/* Stats */}
              <div className="grid grid-cols-3 text-center">
                <div>
                  <p className="text-primary text-lg font-semibold">12</p>
                  <p className="text-sm text-muted-foreground">Events Organized</p>
                </div>
                <div>
                  <p className="text-primary text-lg font-semibold">45</p>
                  <p className="text-sm text-muted-foreground">Tasks Completed</p>
                </div>
                <div>
                  <p className="text-primary text-lg font-semibold">8</p>
                  <p className="text-sm text-muted-foreground">
                    Active Collaborations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Modal Component */}
          <EditProfileModal
            open={openEditModal}
            onOpenChange={setOpenEditModal}
            data={editProfileData}
            onChange={(key, value) =>
              setEditProfileData({ ...editProfileData, [key]: value })
            }
            onSave={handleSaveProfile}
            onCancel={handleCancelProfile}
          />
        </TabsContent>

        {/* ========================= NOTIFICATION TAB ========================= */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" /> Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Email Notifications</Label>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>In-App Notifications</Label>
                <Switch
                  checked={inAppNotifications}
                  onCheckedChange={setInAppNotifications}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================= APPEARANCE TAB ========================= */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" /> Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Dark Mode</Label>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(checked) =>
                    setTheme(checked ? "dark" : "light")
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Compact View</Label>
                <Switch
                  checked={compactView}
                  onCheckedChange={setCompactView}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================= PRIVACY TAB ========================= */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" /> Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Profile Visibility</Label>
                <Switch
                  checked={profileVisibility}
                  onCheckedChange={setProfileVisibility}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Activity Tracking</Label>
                <Switch
                  checked={activityTracking}
                  onCheckedChange={setActivityTracking}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
