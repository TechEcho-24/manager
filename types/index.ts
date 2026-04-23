export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: number;
}

export interface UserSession {
  id: string;
  email: string;
  name: string;
}
