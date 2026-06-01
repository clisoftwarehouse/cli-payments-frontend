import HomeIcon from '@mui/icons-material/Home';
import AppsIcon from '@mui/icons-material/Apps';
import GroupIcon from '@mui/icons-material/Group';
import OutboxIcon from '@mui/icons-material/Outbox';
import LoyaltyIcon from '@mui/icons-material/Loyalty';
import PaymentsIcon from '@mui/icons-material/Payments';
import AddLinkIcon from '@mui/icons-material/AddLink';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import StackedLineChartIcon from '@mui/icons-material/StackedLineChart';

export type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType;
  badge?: string;
  section?: string;
};

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Inicio', icon: HomeIcon },

  { to: '/applications', label: 'Aplicaciones', icon: AppsIcon, section: 'Operación' },
  { to: '/customers', label: 'Clientes', icon: PeopleAltIcon, section: 'Operación' },
  { to: '/products', label: 'Productos', icon: LoyaltyIcon, section: 'Operación' },
  { to: '/subscriptions', label: 'Suscripciones', icon: AccountTreeIcon, section: 'Operación' },
  { to: '/invoices', label: 'Facturas', icon: ReceiptLongIcon, section: 'Operación' },
  { to: '/payments', label: 'Pagos', icon: PaymentsIcon, section: 'Operación' },
  { to: '/payment-links', label: 'Links de pago', icon: AddLinkIcon, section: 'Operación' },

  { to: '/payment-accounts', label: 'Cuentas receptoras', icon: AccountBalanceWalletIcon, section: 'Configuración' },

  { to: '/outbox', label: 'Outbox', icon: OutboxIcon, section: 'Infraestructura' },
  { to: '/fx', label: 'Tasas FX', icon: CurrencyExchangeIcon, section: 'Infraestructura' },
  { to: '/banks', label: 'Bancos', icon: AccountBalanceIcon, section: 'Infraestructura' },

  { to: '/users', label: 'Equipo admin', icon: GroupIcon, section: 'Administración' },
  { to: '/reports', label: 'Reportes', icon: StackedLineChartIcon, section: 'Administración' },
];
