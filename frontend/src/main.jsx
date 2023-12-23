import React, { useState } from 'react'
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom'
import { router } from './components/router'
import { CssBaseline, ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from 'react-query';
import { createContext } from "react"
import { ReactQueryDevtools } from 'react-query/devtools'
import useLocalStorage from './components/useLocalStorage'
import { theme } from './components/theme'

export const ThemeSelect = createContext()
export const LoggedInContext = createContext()

function App() {

  const [themeOption, setThemeOption] = useLocalStorage("Setting:ColorTheme", "dark")
  const [loggedIn, setLogin] = useState(false)
  const queryClient = new QueryClient()
  return(
    <ThemeProvider theme={theme(themeOption)}>
      <CssBaseline />
      <QueryClientProvider contextSharing={true} client={queryClient}>
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        <ThemeSelect.Provider value={{themeOption, setThemeOption}}>
          <LoggedInContext.Provider value={{loggedIn, setLogin}}>
            <RouterProvider router={router} />
          </LoggedInContext.Provider>
        </ThemeSelect.Provider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
const root = createRoot(document.getElementById("root"))
root.render(<App />);


