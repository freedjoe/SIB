
import { 
  Home, 
  Wallet, 
  Target, 
  Briefcase, 
  Hammer, 
  Construction, 
  FileText, 
  CreditCard, 
  Shield, 
  Settings,
  LogOut, 
  User, 
  Bell, 
  Moon, 
  Sun,
  ChevronDown,
  ChartLine,
  HelpCircle,
  FileContract 
} from "lucide-react"

export const Icons = {
  logo: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
  home: Home,
  wallet: Wallet,
  target: Target,
  briefcase: Briefcase,
  hammer: Hammer,
  construction: Construction,
  "file-contract": FileContract,
  "credit-card": CreditCard,
  "chart-line": ChartLine,
  "file-text": FileText,
  shield: Shield,
  settings: Settings,
  logout: LogOut,
  user: User,
  bell: Bell,
  moon: Moon,
  sun: Sun,
  chevronDown: ChevronDown,
  help: HelpCircle
}
