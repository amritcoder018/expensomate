import React from "react";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Toolbar,
  Typography,
} from "@mui/material";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const Header: React.FC = () => {
  const navItems = [
    "Home",
    "Analytics",
    "History",
    "AI Mode",
  ];

  return (
    <AppBar
      position="static"
      elevation={1}
      sx={{
        backgroundColor: "#ffffff",
        color: "#4C1D95",
        borderBottom: "1px solid #E9D5FF",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          minHeight: "72px",
          px: {
            xs: 2,
            md: 4,
          },
        }}
      >
        {/* Left Section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.2,
          }}
        >
          {/* Logo */}
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(126,34,206,0.25)",
            }}
          >
             <img
    src="./explogo.jpg"
    alt="Logo"
    style={{
      width: "100%",
      height: "100%",
      objectFit: "cover",
    }}
  />
          </Box>

          {/* Title */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              letterSpacing: "0.3px",
              color: "#581C87",
            }}
          >
            Expense AI
          </Typography>
        </Box>

        {/* Right Section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* Nav Items */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: {
                xs: 1,
                md: 2,
              },
            }}
          >
            {navItems.map((item) => (
              <Button
                key={item}
                sx={{
                  color: "#7E22CE",
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "0.95rem",
                  borderRadius: "10px",
                  px: 2,
                  py: 1,
                  transition: "0.25s ease",
                  "&:hover": {
                    backgroundColor: "#F3E8FF",
                    color: "#581C87",
                  },
                }}
              >
                {item}
              </Button>
            ))}
          </Box>

          {/* Profile */}
          <Box
            sx={{
              ml: {
                xs: 2,
                md: 5,
              },
            }}
          >
            <Avatar
              sx={{
                width: 42,
                height: 42,
                background:
                  "linear-gradient(135deg, #7E22CE, #C084FC)",
                cursor: "pointer",
                transition: "0.2s ease",
                "&:hover": {
                  transform: "scale(1.06)",
                },
              }}
            >
              <AccountCircleIcon />
            </Avatar>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;