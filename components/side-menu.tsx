"use client"

import { useState } from "react"
import { X, Settings, User, History, Info, HelpCircle, LogOut, Bookmark } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface SideMenuProps {
  isOpen: boolean
  onClose: () => void
  realTimeData?: any
  dataLoading?: boolean
}

export default function SideMenu({ isOpen, onClose, realTimeData, dataLoading }: SideMenuProps) {
  const [activeTab, setActiveTab] = useState<"account" | "settings" | "help" | "favorites" | "history" | "about">(
    "account",
  )

  const menuItems = [
    { id: "account", label: "Account", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "history", label: "History", icon: History },
    { id: "favorites", label: "Saved Props", icon: Bookmark },
    { id: "help", label: "Help", icon: HelpCircle },
    { id: "about", label: "About", icon: Info },
  ]

  // Determine data status
  const hasRealData =
    realTimeData &&
    ((realTimeData.games && realTimeData.games.length > 0) ||
      (realTimeData.props && realTimeData.props.length > 0) ||
      (realTimeData.news && realTimeData.news.length > 0))

  const isDataActive = !dataLoading && hasRealData

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={onClose}
          />

          {/* Side Menu */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-[280px] bg-gray-900 z-50 border-l border-gray-800 overflow-auto"
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h2 className="text-xl font-bold">Menu</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <div className="flex flex-col space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-colors",
                      activeTab === item.id
                        ? "bg-gray-800 text-white"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white",
                    )}
                    onClick={() => {
                      setActiveTab(item.id as "account" | "settings" | "help" | "favorites" | "history" | "about")
                      if (item.id === "favorites") {
                        onClose()
                        // This will be handled by the parent component
                        window.dispatchEvent(new CustomEvent("showFavorites"))
                      }
                    }}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="mt-8 pt-4 border-t border-gray-800">
                <button className="flex items-center gap-3 p-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors w-full">
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            {/* Content based on active tab */}
            <div className="p-4 mt-2">
              {activeTab === "account" && (
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Account</h3>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-sm text-gray-300">Signed in as:</p>
                    <p className="font-medium">user@example.com</p>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-sm text-gray-300">Subscription:</p>
                    <p className="font-medium">Pro Plan</p>
                    <p className="text-xs text-gray-400 mt-1">Renews on Nov 15, 2023</p>
                  </div>
                </div>
              )}

              {activeTab === "settings" && (
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Settings</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Dark Mode</span>
                      <div className="w-12 h-6 bg-[#b8562f] rounded-full relative">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Notifications</span>
                      <div className="w-12 h-6 bg-gray-700 rounded-full relative">
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Sound Effects</span>
                      <div className="w-12 h-6 bg-[#b8562f] rounded-full relative">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "help" && (
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Help</h3>
                  <div className="space-y-3">
                    <button className="text-left w-full p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                      <p className="font-medium">FAQs</p>
                      <p className="text-xs text-gray-400 mt-1">Common questions and answers</p>
                    </button>
                    <button className="text-left w-full p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                      <p className="font-medium">Contact Support</p>
                      <p className="text-xs text-gray-400 mt-1">Get help from our team</p>
                    </button>
                    <button className="text-left w-full p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                      <p className="font-medium">Tutorial</p>
                      <p className="text-xs text-gray-400 mt-1">Learn how to use SLIPTACTIX</p>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "about" && (
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">About</h3>
                  <div className="space-y-3">
                    <div className="bg-gray-800 p-3 rounded-lg">
                      <p className="font-medium">SLIPTACTIX</p>
                      <p className="text-xs text-gray-400 mt-1">Version 1.2.0</p>
                    </div>

                    {/* Live Data Status */}
                    <div className="bg-gray-800 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${isDataActive ? "bg-green-500" : "bg-red-500"}`} />
                        <span className="font-medium">{isDataActive ? "Live Data Active" : "Live Data Inactive"}</span>
                      </div>
                      <div className="text-xs text-gray-400 space-y-1">
                        <div>• Real-time NBA games from ESPN</div>
                        <div>• Live props from PrizePicks</div>
                        <div>• Current injury reports</div>
                        <div>• Breaking news updates</div>
                        {dataLoading && <div className="text-yellow-400">• Syncing data...</div>}
                        {!isDataActive && !dataLoading && <div className="text-red-400">• No real data available</div>}
                      </div>
                    </div>

                    <button className="text-left w-full p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                      <p className="font-medium">Privacy Policy</p>
                      <p className="text-xs text-gray-400 mt-1">How we protect your data</p>
                    </button>
                    <button className="text-left w-full p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                      <p className="font-medium">Terms of Service</p>
                      <p className="text-xs text-gray-400 mt-1">Usage terms and conditions</p>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
