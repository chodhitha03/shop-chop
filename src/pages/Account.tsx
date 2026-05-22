import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  User, Mail, Lock, Package, LogOut,
  Shield, Heart, Settings, Edit3, Check, X, MapPin, Plus, Trash2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { PageTransition, FadeUp, StaggerChildren, StaggerItem, motion, HoverLift } from '@/components/motion';
import { AddressForm, type AddressInput } from '@/components/AddressForm';

interface Address {
  _id: string;
  label?: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export default function Account() {
  const { user, logout, checkAuth } = useAuth();
  const navigate = useNavigate();
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(api('/api/users/addresses'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
      }
    } catch (error) {
      console.error('Fetch addresses error:', error);
    }
  };

  const handleSaveAddress = async (payload: AddressInput) => {
    setAddressLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = editingAddress
        ? api(`/api/users/addresses/${editingAddress._id}`)
        : api('/api/users/addresses');

      const res = await fetch(url, {
        method: editingAddress ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setAddresses(data);
        setShowAddressForm(false);
        setEditingAddress(null);
        toast.success(editingAddress ? 'Address updated' : 'Address added');
      } else {
        toast.error(data.message || 'Failed to save address');
      }
    } catch (error) {
      console.error('Save address error:', error);
      toast.error('Failed to save address');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!window.confirm('Delete this address?')) return;
    setAddressLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(api(`/api/users/addresses/${addressId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setAddresses(data);
        toast.success('Address removed');
      } else {
        toast.error(data.message || 'Failed to delete address');
      }
    } catch (error) {
      console.error('Delete address error:', error);
      toast.error('Failed to delete address');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    setAddressLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(api(`/api/users/addresses/${addressId}/default`), {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setAddresses(data);
        toast.success('Default address updated');
      } else {
        toast.error(data.message || 'Failed to update default address');
      }
    } catch (error) {
      console.error('Default address error:', error);
      toast.error('Failed to update default address');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(api('/api/auth/update-profile'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        toast.success('Name updated!');
        await checkAuth();
        setEditingName(false);
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to update name');
      }
    } catch {
      toast.error('Failed to update name');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) return;
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(api('/api/auth/change-password'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (res.ok) {
        toast.success('Password changed successfully!');
        setChangingPassword(false);
        setCurrentPassword('');
        setNewPassword('');
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to change password');
      }
    } catch {
      toast.error('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  const initial = user.name?.charAt(0).toUpperCase() || 'U';
  const memberSince = 'Member';

  const quickLinks = [
    { label: 'My Orders', desc: 'View order history & track deliveries', icon: Package, path: '/my-orders', color: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10' },
    { label: 'Saved Recipes', desc: 'Your favourite recipes collection', icon: Heart, path: '/breakfast', color: 'text-rose-500 bg-rose-50 dark:bg-rose-500/10' },
    { label: 'Supermarket', desc: 'Browse grocery & pantry items', icon: Settings, path: '/supermarket', color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10' },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen">
        <div className="container section-tight max-w-2xl">

          {/* Profile Header */}
          <FadeUp>
            <div className="text-center mb-8 sm:mb-10">
              <motion.div
                className="relative mx-auto mb-5"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                style={{ width: 88, height: 88 }}
              >
                <Avatar className="h-full w-full border-4 border-background shadow-lift">
                  <AvatarFallback className="text-3xl font-display bg-primary text-primary-foreground">
                    {initial}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-background">
                  <Check className="h-3.5 w-3.5" />
                </div>
              </motion.div>
              <motion.h1
                className="text-2xl sm:text-3xl font-display"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {user.name}
              </motion.h1>
              <motion.p
                className="text-muted-foreground mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {user.email}
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
              >
                <Badge variant="outline" className="mt-3 text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified {memberSince}
                </Badge>
              </motion.div>
            </div>
          </FadeUp>

          {/* Quick Links */}
          <StaggerChildren className="grid gap-3 sm:grid-cols-3 mb-8">
            {quickLinks.map((link) => (
              <StaggerItem key={link.path}>
                <HoverLift>
                  <Link to={link.path}>
                    <Card className="bg-card/90 hover:bg-card transition-colors cursor-pointer h-full">
                      <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${link.color}`}>
                          <link.icon className="h-5 w-5" />
                        </div>
                        <p className="text-sm font-semibold">{link.label}</p>
                        <p className="text-[11px] text-muted-foreground leading-tight">{link.desc}</p>
                      </CardContent>
                    </Card>
                  </Link>
                </HoverLift>
              </StaggerItem>
            ))}
          </StaggerChildren>

          {/* Account Details */}
          <FadeUp delay={0.15}>
            <Card className="bg-card/90 mb-4">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Account Details
                </CardTitle>
                <CardDescription>Manage your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Name */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Full Name</Label>
                  {editingName ? (
                    <div className="flex gap-2">
                      <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="h-10"
                        autoFocus
                      />
                      <Button size="sm" onClick={handleUpdateName} disabled={saving} className="h-10 px-3">
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => { setEditingName(false); setNewName(user.name); }} className="h-10 px-3">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/60 px-4 py-2.5">
                      <span className="font-medium">{user.name}</span>
                      <Button size="sm" variant="ghost" onClick={() => setEditingName(true)} className="h-8 px-2">
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Email Address</Label>
                  <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/60 px-4 py-2.5">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{user.email}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeUp>

          {/* Security */}
          <FadeUp delay={0.25}>
            <Card className="bg-card/90 mb-4">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  Security
                </CardTitle>
                <CardDescription>Update your password</CardDescription>
              </CardHeader>
              <CardContent>
                {changingPassword ? (
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="space-y-2">
                      <Label>Current Password</Label>
                      <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password (min 6 chars)"
                        className="h-10"
                      />
                    </div>
                    <div className="flex gap-2">
                      <motion.div whileTap={{ scale: 0.97 }} className="flex-1">
                        <Button onClick={handleChangePassword} disabled={saving} className="w-full">
                          {saving ? 'Saving...' : 'Update Password'}
                        </Button>
                      </motion.div>
                      <Button variant="ghost" onClick={() => { setChangingPassword(false); setCurrentPassword(''); setNewPassword(''); }}>
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/60 px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">Password</span>
                      <span className="text-sm text-muted-foreground">••••••••</span>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setChangingPassword(true)}>
                      Change
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeUp>

          {/* Addresses */}
          <FadeUp delay={0.3}>
            <Card className="bg-card/90 mb-4">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Saved Addresses
                </CardTitle>
                <CardDescription>Manage delivery addresses for checkout</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    {addresses.length} saved address{addresses.length !== 1 ? 'es' : ''}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingAddress(null);
                      setShowAddressForm((prev) => !prev);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {showAddressForm ? 'Close form' : 'Add address'}
                  </Button>
                </div>

                {showAddressForm && (
                  <AddressForm
                    submitLabel={editingAddress ? 'Update address' : 'Save address'}
                    loading={addressLoading}
                    initial={editingAddress || undefined}
                    onSubmit={handleSaveAddress}
                    onCancel={() => {
                      setShowAddressForm(false);
                      setEditingAddress(null);
                    }}
                  />
                )}

                <div className="space-y-3">
                  {addresses.length === 0 && (
                    <div className="rounded-xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
                      Add your first delivery address to start checkout.
                    </div>
                  )}

                  {addresses.map((address) => (
                    <div
                      key={address._id}
                      className="rounded-xl border border-border/60 bg-background/60 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground">
                              {address.label || 'Delivery address'}
                            </p>
                            {address.isDefault && (
                              <Badge variant="outline" className="text-xs">Default</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {address.name} · {address.phone}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {address.line1}
                            {address.line2 ? `, ${address.line2}` : ''}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {address.city}, {address.state} {address.postalCode}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {address.country}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingAddress(address);
                              setShowAddressForm(true);
                            }}
                          >
                            <Edit3 className="h-3.5 w-3.5 mr-1" />
                            Edit
                          </Button>
                          {!address.isDefault && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSetDefault(address._id)}
                              disabled={addressLoading}
                            >
                              Set default
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteAddress(address._id)}
                            disabled={addressLoading}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </FadeUp>

          {/* Logout */}
          <FadeUp delay={0.35}>
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                className="w-full h-12 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 border-red-200 dark:border-red-500/20"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </motion.div>
          </FadeUp>

        </div>
      </div>
    </PageTransition>
  );
}
