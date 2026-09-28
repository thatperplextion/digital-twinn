import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "../store";
import {
  HomeIcon,
  CubeIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  BoltIcon,
  BeakerIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  MagnifyingGlassIcon,
  UserCircleIcon
} from "@heroicons/react/24/outline";
import clsx from "clsx";
const navigation = [
  { name: "Dashboard", href: "/", icon: HomeIcon },
  { name: "Twin Explorer", href: "/twins", icon: CubeIcon },
  { name: "Predictions", href: "/predictions", icon: ChartBarIcon },
  { name: "Anomalies", href: "/anomalies", icon: ExclamationTriangleIcon },
  { name: "Actions", href: "/actions", icon: BoltIcon },
  { name: "Simulation", href: "/simulation", icon: BeakerIcon },
  { name: "Analytics", href: "/analytics", icon: ChartPieIcon },
  { name: "Settings", href: "/settings", icon: Cog6ToothIcon }
];
function Layout({ children }) {
  const location = useLocation();
  const { sidebarOpen, toggleSidebar, notifications } = useUIStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  return <div className="min-h-screen bg-mesh relative overflow-hidden">{
    /* Animated background orbs */
  }<div className="fixed inset-0 pointer-events-none overflow-hidden"><div className="orb orb-orange w-96 h-96 -top-48 -left-48 animate-float" /><div className="orb orb-coral w-80 h-80 top-1/2 -right-40 animate-float" style={{ animationDelay: "1s" }} /><div className="orb orb-rose w-64 h-64 -bottom-32 left-1/3 animate-float" style={{ animationDelay: "2s" }} /></div>{
    /* Sidebar */
  }<AnimatePresence mode="wait">{sidebarOpen && <motion.aside
    initial={{ x: -280, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: -280, opacity: 0 }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
    className="fixed left-0 top-0 z-40 h-screen w-64 glass-dark border-r border-white/5"
  >{
    /* Logo */
  }<div className="flex h-16 items-center gap-3 px-6 border-b border-white/5"><motion.div
    whileHover={{ scale: 1.05, rotate: 5 }}
    className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/25"
  ><CubeIcon className="h-6 w-6 text-white" /></motion.div><div><h1 className="text-lg font-bold gradient-text">Digital Twin</h1><p className="text-xs text-slate-500">Command Center</p></div></div>{
    /* Navigation */
  }<nav className="flex-1 px-3 py-4 space-y-1">{navigation.map((item, index) => {
    const isActive = location.pathname === item.href;
    return <motion.div
      key={item.name}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    ><NavLink
      to={item.href}
      className={clsx(
        "group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
        isActive ? "glass-card bg-gradient-to-r from-primary-600/20 to-accent-600/20 text-white shadow-lg shadow-primary-500/10 border-primary-500/30" : "text-slate-400 hover:text-white hover:bg-white/5"
      )}
    ><item.icon className={clsx(
      "h-5 w-5 transition-all duration-300",
      isActive ? "text-primary-400" : "group-hover:text-primary-400"
    )} /><span className={isActive ? "gradient-text font-semibold" : ""}>{item.name}</span>{item.name === "Anomalies" && <motion.span
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-danger-500 to-danger-600 text-xs text-white shadow-lg shadow-danger-500/30"
    >
                          3
                        </motion.span>}</NavLink></motion.div>;
  })}</nav>{
    /* Connection Status */
  }<div className="px-4 py-4 border-t border-white/5"><motion.div
    animate={{
      boxShadow: ["0 0 0 rgba(52, 211, 153, 0)", "0 0 20px rgba(52, 211, 153, 0.3)", "0 0 0 rgba(52, 211, 153, 0)"]
    }}
    transition={{ duration: 2, repeat: Infinity }}
    className="flex items-center gap-2 px-3 py-2.5 rounded-xl glass-light border border-success-500/30"
  ><span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success-400" /></span><span className="text-xs text-success-400 font-medium">Live Connection</span></motion.div></div></motion.aside>}</AnimatePresence>{
    /* Main Content */
  }<div className={clsx("transition-all duration-500 ease-smooth relative z-10", sidebarOpen ? "pl-64" : "pl-0")}>{
    /* Header */
  }<header className="sticky top-0 z-30 h-16 glass-dark border-b border-white/5"><div className="flex h-full items-center justify-between px-6"><div className="flex items-center gap-4"><motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={toggleSidebar}
    className="p-2.5 rounded-xl text-slate-400 hover:text-white glass-light hover:border-primary-500/30 transition-all duration-300"
  >{sidebarOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}</motion.button>{
    /* Search */
  }<div className="relative group"><MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-primary-400 transition-colors" /><input
    type="text"
    placeholder="Search twins, events, predictions..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="input-glass w-80 pl-10 pr-4 py-2.5 rounded-xl text-sm"
  /></div></div><div className="flex items-center gap-3">{
    /* Live Indicator */
  }<motion.div
    animate={{ scale: [1, 1.02, 1] }}
    transition={{ duration: 2, repeat: Infinity }}
    className="flex items-center gap-2 px-4 py-2 rounded-full glass-light border border-success-500/30"
  ><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-success-400" /></span><span className="text-xs font-bold text-success-400 tracking-wider">LIVE</span></motion.div>{
    /* Notifications */
  }<div className="relative"><motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => setShowNotifications(!showNotifications)}
    className="relative p-2.5 rounded-xl text-slate-400 hover:text-white glass-light hover:border-primary-500/30 transition-all duration-300"
  ><BellIcon className="h-5 w-5" />{notifications.length > 0 && <motion.span
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-danger-500 to-danger-600 text-xs text-white font-bold shadow-lg shadow-danger-500/30"
  >{notifications.length}</motion.span>}</motion.button><AnimatePresence>{showNotifications && <motion.div
    initial={{ opacity: 0, y: 10, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 10, scale: 0.95 }}
    transition={{ type: "spring", stiffness: 300, damping: 25 }}
    className="absolute right-0 top-full mt-2 w-80 glass-card rounded-2xl shadow-2xl overflow-hidden"
  ><div className="p-4 border-b border-white/5 bg-gradient-to-r from-primary-600/10 to-accent-600/10"><h3 className="font-semibold gradient-text">Notifications</h3></div><div className="max-h-96 overflow-y-auto">{notifications.length === 0 ? <div className="p-6 text-center text-slate-500 text-sm"><BellIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            No new notifications
                          </div> : notifications.slice(0, 10).map((notification, i) => <motion.div
    key={notification.id}
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: i * 0.05 }}
    className="p-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
  ><p className="text-sm font-medium text-white">{notification.title}</p><p className="text-xs text-slate-500 mt-1">{notification.message}</p></motion.div>)}</div></motion.div>}</AnimatePresence></div>{
    /* User Menu */
  }<motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="flex items-center gap-2 p-2 rounded-xl glass-light hover:border-primary-500/30 transition-all duration-300"
  ><div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center"><UserCircleIcon className="h-5 w-5 text-white" /></div></motion.button></div></div></header>{
    /* Page Content */
  }<main className="p-6 min-h-[calc(100vh-4rem)]"><motion.div
    key={location.pathname}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
  >{children}</motion.div></main></div></div>;
}
export {
  Layout as default
};
