"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User, Bell, Palette, Shield, Edit } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "react-hot-toast";
import { EditProfileModal } from "@/components/settings/EditProfileModal";
import { useUser } from "@/lib/client/features/auth/hooks";
import { useFetchUser, useUpdateUser } from "@/lib/client/features/users/hooks";
import { useUiStore } from "@/stores/ui-store";

export default function SettingsPage() {
  const { data: authUser } = useUser();
  const { data: currentUser, refetch: refetchUser } = useFetchUser(
    authUser?.id ?? ""
  );
  const updateUserMutation = useUpdateUser();

  // ==================== UI STORE ====================
  const {
    // Profile Modal
    isEditProfileModalOpen,
    openEditProfileModal,
    closeEditProfileModal,

    // Profile Data
    profileData,
    tempProfileData,
    setTempProfileData,
    saveProfileData,
    resetTempProfileData,
    initializeProfileData,

    // Settings
    notificationSettings,
    setNotificationSettings,
    appearanceSettings,
    setAppearanceSettings,
    privacySettings,
    setPrivacySettings,
  } = useUiStore();

  // ==================== THEME (from next-themes) ====================
  const { theme, setTheme } = useTheme();

  // ==================== INITIALIZE PROFILE DATA ====================
  useEffect(() => {
    if (currentUser?.username && currentUser?.email) {
      initializeProfileData(currentUser.username, currentUser.email);
    }
  }, [currentUser, initializeProfileData]);

  // ==================== HANDLERS ====================
  const handleSaveProfile = () => {
    if (!authUser?.id) return toast.error("User not found");

    const newUsername = [
      tempProfileData.firstName,
      tempProfileData.middleName,
      tempProfileData.lastName,
    ]
      .filter(Boolean)
      .join(" ");

    updateUserMutation.mutate(
      {
        userId: authUser.id,
        patch: { username: newUsername },
      },
      {
        onSuccess: () => {
          saveProfileData();
          refetchUser();
          toast.success("Profile updated successfully!");
        },
        onError: (error) => {
          console.error("Failed to update profile", error);
          toast.error(error.message || "Failed to update profile.");
        },
      }
    );
  };

  // ==================== HELPER FUNCTIONS ====================
  const getInitials = (first: string, middle: string, last: string) =>
    [first, middle, last]
      .map((n) => n?.[0])
      .join("")
      .toUpperCase();

  const getFullName = (first: string, middle: string, last: string) =>
    [first, middle, last].filter(Boolean).join(" ");

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

              <Button variant="outline" onClick={openEditProfileModal}>
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
                    <Label className="text-sm text-muted-foreground">
                      Name
                    </Label>
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

                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">
                      Phone Number
                    </Label>
                    <p>{profileData.phone || "Not set"}</p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">
                      Location
                    </Label>
                    <p>{profileData.location || "Not set"}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* About */}
              <div>
                <Label className="text-sm text-muted-foreground">
                  About Me
                </Label>
                <p className="text-foreground mt-1">
                  {profileData.bio || "No bio yet"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile Modal */}
          <EditProfileModal
            open={isEditProfileModalOpen}
            onOpenChange={closeEditProfileModal}
            data={tempProfileData}
            onChange={(key, value) =>
              setTempProfileData((prev) => ({ ...prev, [key]: value }))
            }
            onSave={handleSaveProfile}
            onCancel={resetTempProfileData}
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
                  checked={notificationSettings.email}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ email: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>In-App Notifications</Label>
                <Switch
                  checked={notificationSettings.inApp}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ inApp: checked })
                  }
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
                  checked={appearanceSettings.compactView}
                  onCheckedChange={(checked) =>
                    setAppearanceSettings({ compactView: checked })
                  }
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
                  checked={privacySettings.profileVisibility}
                  onCheckedChange={(checked) =>
                    setPrivacySettings({ profileVisibility: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Activity Tracking</Label>
                <Switch
                  checked={privacySettings.activityTracking}
                  onCheckedChange={(checked) =>
                    setPrivacySettings({ activityTracking: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}