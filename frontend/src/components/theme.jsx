import { createTheme } from "@mui/material";
import { red } from "@mui/material/colors";
import { deepOrange } from "@mui/material/colors";
import React from "react";
import { Link as RouterLink } from 'react-router-dom';



const LinkBehavior = React.forwardRef((props, ref) => {
  const { href, ...other } = props;
  // Map href (MUI) -> to (react-router)
  return <RouterLink ref={ref} to={href} {...other} />;
});

export const theme = (mode) => createTheme({
    palette: {
      mode,
      ...(mode === 'light'
        ? {
          // palette values for light mode
            primary: {
              main: "#3e50a4",
            },
            secondary: {
              main: "#f89c30",
            },
          }
        : {
            // palette values for dark mode
            primary: {
              main: "#f89c30",
            },
            secondary: {
              main: "#3e50a4",
            }
          }),
    },
    zIndex: {
      appBar: 1098,
      modal: 1201,
    },
    components: {
      MuiLink: {
        defaultProps: {
          component: LinkBehavior,
        },
      },
      MuiButtonBase: {
        defaultProps: {
          LinkComponent: LinkBehavior,
        },
      },
    },
  }
);