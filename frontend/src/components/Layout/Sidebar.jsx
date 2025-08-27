import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  Tags, 
  Settings,
  DollarSign
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: LayoutDashboard,
      current: location.pathname === '/dashboard'
    },
    { 
      name: 'Transactions', 
      href: '/transactions', 
      icon: Receipt,
      current: location.pathname === '/transactions'
    },
    { 
      name: 'Categories', 
      href: '/categories', 
      icon: Tags,
      current: location.pathname === '/categories'
    },
    { 
      name: 'Settings', 
      href: '/settings', 
      icon: Settings,
      current: location.pathname === '/settings'
    },
  ];

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="bg-primary-600 rounded-lg p-2">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <span className="ml-3 text-xl font-semibold text-gray-900">
            ExpenseTracker
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3">
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <Icon
                  className={`mr-3 h-5 w-5 ${
                    item.current
                      ? 'text-primary-600'
                      : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {item.name}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
