import { Settings, Sun, Moon, Monitor, X } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { cn } from "@/lib/utils"

export function SettingsMenu() {
  const { theme, setTheme } = useTheme()

  const themes = [
    { value: "system", label: "System", icon: Monitor, description: "Use system theme" },
    { value: "light", label: "Light", icon: Sun, description: "Use light theme" },
    { value: "dark", label: "Dark", icon: Moon, description: "Use dark theme" },
  ]

  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Settings</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="relative">
          <DrawerTitle>Settings</DrawerTitle>
          <DrawerDescription>
            Customize your experience
          </DrawerDescription>
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DrawerClose>
        </DrawerHeader>
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-3">Appearance</h3>
              <div className="space-y-2">
                {themes.map(({ value, label, icon: Icon, description }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={cn(
                      "flex items-start gap-3 w-full px-4 py-3.5 text-sm rounded-lg transition-all border-2",
                      theme === value
                        ? "bg-primary/10 border-primary shadow-sm"
                        : "bg-card border-border hover:bg-accent hover:border-accent-foreground/20"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5 mt-0.5 shrink-0",
                      theme === value ? "text-primary" : "text-muted-foreground"
                    )} />
                    <div className="flex-1 text-left">
                      <div className={cn(
                        "font-semibold",
                        theme === value && "text-primary"
                      )}>{label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
                    </div>
                    {theme === value && (
                      <span className="text-primary font-bold text-lg">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
