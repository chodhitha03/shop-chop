import { Button } from '@/components/ui/button';
import { User, LogIn, LogOut, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isAdminEmail } from "@/lib/admin";

const AuthButton = () => {
  const { user, logout } = useAuth();
  const isAdmin = isAdminEmail(user?.email);

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link to="/sign-in">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <LogIn className="h-4 w-4 mr-2" />
            <span className="font-medium">Sign In</span>
          </Button>
        </Link>
        <Link to="/sign-up">
          <Button variant="default" size="sm" className="font-medium">
            <User className="h-4 w-4 mr-2" />
            <span>Sign Up</span>
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{user.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link to="/account">
          <DropdownMenuItem className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>My Account</span>
          </DropdownMenuItem>
        </Link>
        <Link to="/my-orders">
          <DropdownMenuItem className="cursor-pointer">
            <Package className="mr-2 h-4 w-4" />
            <span>My Orders</span>
          </DropdownMenuItem>
        </Link>
        {isAdmin && (
          <Link to="/admin">
            <DropdownMenuItem className="cursor-pointer">
              <Package className="mr-2 h-4 w-4" />
              <span>Admin Dashboard</span>
            </DropdownMenuItem>
          </Link>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 focus:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AuthButton;