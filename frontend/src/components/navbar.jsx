import {
  Stack,
  AppBar,
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  Link,
  MenuItem,
  Paper,
  Popper,
  Toolbar,
  Typography,
  Avatar,
  Tabs,
  Tab,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions
} from "@mui/material"
import {
  usePopupState,
  bindPopper,
  bindHover
} from 'material-ui-popup-state/hooks'
import { useContext, useEffect, useState } from "react";
import { LoggedInContext, ThemeSelect } from "../main";
import LoginIcon from '@mui/icons-material/Login';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import SellLogo from '../assets/sellorama_logo.png'
import "./navbar.css"
import { useLocation, useNavigate } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import { jwtDecode } from "jwt-decode";
import StorefrontIcon from '@mui/icons-material/Storefront';
import SellIcon from '@mui/icons-material/Sell';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import PersonIcon from '@mui/icons-material/Person';
import { useTheme } from "@emotion/react";
import axios from "axios";
import AdminPanelSettingsTwoToneIcon from '@mui/icons-material/AdminPanelSettingsTwoTone';

export default function NavBar() {

  const navigate = useNavigate()

  const location = useLocation()

  const [tab, setTab] = useState("")

  const [openDialog, setDialog] = useState(false)

  const themeSelect = useContext(ThemeSelect)

  const isLoggedIn = useContext(LoggedInContext)

  const token = localStorage.getItem("JWT_TOKEN")

  const token_data = token ? jwtDecode(token) : null

  const [isAdmin, setAdmin] = useState(false)

  useEffect(() => {
    setTab(location.pathname.split("/")[1])
  }, [location])

  useEffect(() => {
    isLoggedIn.setLogin(token_data?.exp && token_data.exp > Math.floor((new Date()).getTime() / 1000))
  }, [token_data])

  useEffect(() => {
    if (isLoggedIn.loggedIn) {
      const token = localStorage.getItem("JWT_TOKEN")
      if(token) {
        const token_data = jwtDecode(token)
        axios.get("/api/user/" + token_data.Id).then(res => setAdmin(res.data.isAdmin))
      }
    } else {
      setAdmin(false)
    }
  }, [isLoggedIn.loggedIn])


  return (
    <AppBar position="fixed" color='inherit'>
      <Toolbar>
        <Grid container justifyContent="space-between" alignItems={"center"}>
          <IconButton disableRipple size="large" href="/">
            <img className="logo" style={{ width: 60 }} src={SellLogo} />
          </IconButton>
          <Stack spacing={3} direction={"row"}>
            <IconButton color="primary" onClick={() => themeSelect.setThemeOption((prevTheme) => prevTheme === "dark" ? "light" : "dark")} size="large">
              {themeSelect.themeOption === "light" ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
            {
              isLoggedIn.loggedIn ?
                <>
                  <IconButton color="error" size="large" onClick={() => setDialog(true)}><LogoutIcon /></IconButton>
                </>
                :
                <>
                  <IconButton onClick={() => navigate("/signin")} size="large"><LoginIcon /></IconButton>
                </>
            }
          </Stack>
        </Grid>
      </Toolbar>
      <Divider />
      <Toolbar variant='dense'>
        <Box sx={{ mx: 'auto' }}>
          <Tabs
            value={tab == "listings" ? "" : tab}
            onChange={(e, t) => setTab(t)}
            aria-label="icon label tabs example"
          >
            <Tab icon={<StorefrontIcon />} value={""} label="BROWSE" href="/" />
            <Tab icon={<SellIcon />} type="secondary" value={"sell"} label="SELL" href="/sell" />
            {isLoggedIn.loggedIn &&
              <Tab icon={<ChatBubbleIcon />} value={"chat"} label="CHAT" href="/chat" />
            } {isLoggedIn.loggedIn &&
              <Tab icon={<PersonIcon/>} color="#3e50a4" label="PROFILE" value={"profile"} href={`/profile/${token_data.Id}`} />
            } {isLoggedIn.loggedIn && isAdmin && 
              <Tab icon={<AdminPanelSettingsTwoToneIcon/>} label="admin" value={"admin"} href="/admin"/>
            }
          </Tabs>
        </Box>
      </Toolbar>
      <Dialog open={openDialog} onClose={() => setDialog(false)}>
        <DialogTitle>
          Sign Out
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6">
            Are you sure you want to sign out?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Stack direction="row" spacing={1}>
            <Button color="info" onClick={() => setDialog(false)}>
              Cancel
            </Button>
            <Button color="error" variant="outlined" onClick={() => { localStorage.removeItem("JWT_TOKEN"); isLoggedIn.setLogin(false); setDialog(false) }} >
              Sign out
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
}

