


import { MoonIcon, SunIcon } from "@radix-ui/react-icons"
import { useTheme } from "./theme-provider"

export function ModeToggleCustome() {  
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
        <button onClick={handleChangeTheme} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-transparent shadow-sm   h-9 w-9 dark:border-black border-white border text-white dark:text-black">
          <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </button>
  )
}
