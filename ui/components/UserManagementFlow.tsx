import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { 
  Calendar,
  Mail,
  Eye,
  EyeOff,
  Upload,
  Home,
  CheckSquare,
  Settings,
  Palette,
  Bell,
  Search
} from 'lucide-react';

interface UserManagementFlowProps {
  onBack?: () => void;
}

export function UserManagementFlow({ onBack }: UserManagementFlowProps) {
  // Registration Screen State
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regShowPassword, setRegShowPassword] = useState(false);
  const [regShowConfirmPassword, setRegShowConfirmPassword] = useState(false);

  // Login Screen State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginShowPassword, setLoginShowPassword] = useState(false);

  // Profile Screen State
  const [profileEditMode, setProfileEditMode] = useState(false);
  const [profileFullName, setProfileFullName] = useState('Alex Johnson');
  const [profileEmail] = useState('alex.johnson@university.edu');

  const handleRegSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle registration logic
    console.log('Registration submitted');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic
    console.log('Login submitted');
  };

  const handleProfileSave = () => {
    setProfileEditMode(false);
    // Handle profile save logic
    console.log('Profile saved');
  };

  const handleProfileCancel = () => {
    setProfileEditMode(false);
    setProfileFullName('Alex Johnson'); // Reset to original value
  };

  return (
    <div className="min-h-screen bg-muted/20 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">User Management Flow</h1>
          <p className="text-muted-foreground">Three interconnected screens showcasing the complete user experience</p>
          {onBack && (
            <Button variant="outline" onClick={onBack} className="mt-4">
              Back to App
            </Button>
          )}
        </div>

        {/* Three Screens Side by Side */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 1. Registration Screen */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground mb-2">1. Registration Screen</h2>
              <p className="text-sm text-muted-foreground">New user account creation</p>
            </div>
            
            <div className="bg-[#F9F9F9] min-h-[600px] p-8 rounded-lg border">
              <div className="max-w-md mx-auto space-y-6">
                {/* Logo */}
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-6">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-semibold text-foreground">EventPlanner</span>
                  </div>
                  <h1 className="text-2xl font-bold text-foreground">Create Your Account</h1>
                </div>

                {/* Registration Form */}
                <form onSubmit={handleRegSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-fullname">Full Name</Label>
                    <Input
                      id="reg-fullname"
                      type="text"
                      placeholder="Enter your full name"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      className="bg-white border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="Enter your email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="pl-10 bg-white border-border"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="reg-password"
                        type={regShowPassword ? 'text' : 'password'}
                        placeholder="Create a password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="pr-10 bg-white border-border"
                      />
                      <button
                        type="button"
                        onClick={() => setRegShowPassword(!regShowPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {regShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="reg-confirm-password"
                        type={regShowConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        className="pr-10 bg-white border-border"
                      />
                      <button
                        type="button"
                        onClick={() => setRegShowConfirmPassword(!regShowConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {regShowConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white">
                    Sign Up
                  </Button>

                  {/* Google Sign Up Button */}
                  <Button type="button" variant="outline" className="w-full bg-white border-gray-300">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign up with Google
                  </Button>
                </form>

                {/* Footer Link */}
                <div className="text-center text-sm">
                  <span className="text-muted-foreground">Already have an account? </span>
                  <button className="text-primary font-semibold hover:underline">
                    Log In
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Login Screen */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground mb-2">2. Login Screen</h2>
              <p className="text-sm text-muted-foreground">Existing user authentication</p>
            </div>
            
            <div className="bg-[#F9F9F9] min-h-[600px] p-8 rounded-lg border">
              <div className="max-w-md mx-auto space-y-6">
                {/* Logo */}
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-6">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-semibold text-foreground">EventPlanner</span>
                  </div>
                  <h1 className="text-2xl font-bold text-foreground">Welcome Back!</h1>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email Address</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="bg-white border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={loginShowPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pr-10 bg-white border-border"
                      />
                      <button
                        type="button"
                        onClick={() => setLoginShowPassword(!loginShowPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {loginShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="text-right">
                      <button 
                        type="button" 
                        className="text-sm text-primary hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white">
                    Log In
                  </Button>
                </form>

                {/* Footer Link */}
                <div className="text-center text-sm">
                  <span className="text-muted-foreground">Don't have an account? </span>
                  <button className="text-primary font-semibold hover:underline">
                    Sign Up
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3. User Profile Screen */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground mb-2">3. User Profile Screen</h2>
              <p className="text-sm text-muted-foreground">Profile management within app</p>
            </div>
            
            <div className="bg-white min-h-[600px] rounded-lg border shadow-sm">
              {/* Top Navigation Bar */}
              <header className="bg-white border-b border-border px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-semibold text-lg text-foreground">EventPlanner</span>
                    </div>
                    
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search..."
                        className="pl-10 bg-muted/50 border-0 text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" className="relative">
                      <Bell className="w-5 h-5" />
                    </Button>
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary text-white text-sm">AJ</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </header>

              <div className="flex">
                {/* Sidebar */}
                <aside className="w-48 bg-white border-r border-border h-[calc(600px-73px)]">
                  <nav className="p-4 space-y-2">
                    <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground text-sm">
                      <Home className="w-4 h-4 mr-3" />
                      Dashboard
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground text-sm">
                      <CheckSquare className="w-4 h-4 mr-3" />
                      Tasks
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground text-sm">
                      <Calendar className="w-4 h-4 mr-3" />
                      Calendar
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-primary bg-primary/10 text-sm">
                      <Settings className="w-4 h-4 mr-3" />
                      Settings
                    </Button>
                  </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6 space-y-6">
                  <h1 className="text-2xl font-bold text-foreground">My Profile</h1>

                  {/* Profile Section */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg">Profile Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Avatar Section */}
                      <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                          <Avatar className="w-20 h-20">
                            <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                              AJ
                            </AvatarFallback>
                          </Avatar>
                          <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary/90 transition-colors">
                            <Upload className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* User Details */}
                      {!profileEditMode ? (
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm text-muted-foreground">Full Name</Label>
                            <p className="text-foreground font-medium">{profileFullName}</p>
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground">Email</Label>
                            <p className="text-foreground">{profileEmail}</p>
                          </div>
                          <Button 
                            variant="outline" 
                            onClick={() => setProfileEditMode(true)}
                            className="border-primary text-primary hover:bg-primary hover:text-white"
                          >
                            Edit Profile
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="profile-fullname">Full Name</Label>
                            <Input
                              id="profile-fullname"
                              value={profileFullName}
                              onChange={(e) => setProfileFullName(e.target.value)}
                              className="bg-white border-border"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                              value={profileEmail}
                              disabled
                              className="bg-muted border-border text-muted-foreground cursor-not-allowed"
                            />
                          </div>
                          <div className="flex space-x-3">
                            <Button 
                              onClick={handleProfileSave}
                              className="bg-primary hover:bg-primary/90 text-white"
                            >
                              Save Changes
                            </Button>
                            <Button 
                              variant="ghost" 
                              onClick={handleProfileCancel}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Security Section */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg">Security</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                        Change Password
                      </Button>
                    </CardContent>
                  </Card>
                </main>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}