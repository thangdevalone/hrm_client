

import { Button } from "@/components/ui/button"
import { MoonIcon, SunIcon } from "@radix-ui/react-icons"
import { useTheme } from "./theme-provider"

export function ModeToggle() {  
  const { setTheme,theme } = useTheme()
  const handleChangeTheme=()=>{
    if (theme==="light"){
      setTheme('dark')
    }
    else{
      setTheme('light')
    }
  }
  return (
        <Button  onClick={handleChangeTheme}  variant="outline" size="icon">
          <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
  )
}
