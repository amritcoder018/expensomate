import React, { useState } from "react";
import {
  Box,
  IconButton,
  Typography,
  Paper,
  Fade,
  Tooltip,
} from "@mui/material";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

interface Expense {
  id: number;
  title: string;
  amount: number;
  date: string;
  type: "credit" | "debit";
}

const expenses: Expense[] = [
  {
    id: 1,
    title: "Groceries",
    amount: 1200,
    date: "28 May 2026",
    type: "debit",
  },
  {
    id: 2,
    title: "Salary",
    amount: 25000,
    date: "27 May 2026",
    type: "credit",
  },
  {
    id: 3,
    title: "Gym Membership",
    amount: 1800,
    date: "26 May 2026",
    type: "debit",
  },
];

const DRAWER_WIDTH = 340;

const RecentExpensesDrawer: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <Box
      sx={{
        position: "fixed",
        top: "50%",
        right: 0,
        transform: "translateY(-50%)",
        zIndex: 1300,
      }}
    >
      {/* Sliding Wrapper */}
      <Box
        sx={{
          position: "relative",
          width: DRAWER_WIDTH,
          height: 450,
          transform: open
            ? "translateX(0)"
            : `translateX(${DRAWER_WIDTH}px)`,
          transition: "transform 0.4s ease",
        }}
      >
        {/* Drawer */}
        <Paper
          elevation={12}
          sx={{
            width: DRAWER_WIDTH,
            height: "100%",
            bgcolor: "#1b1028",
            borderTopLeftRadius: 28,
            borderBottomLeftRadius: 28,
            border: "1px solid rgba(168,85,247,0.25)",
            overflow: "hidden",
            backdropFilter: "blur(14px)",
            boxShadow: "0px 0px 30px rgba(126,34,206,0.35)",
          }}
        >
          <Box
            sx={{
              p: 2.5,
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "#f3e8ff",
                fontWeight: 700,
                mb: 2,
              }}
            >
              Recently Added Expenses
            </Typography>

            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                pr: 1,

                "&::-webkit-scrollbar": {
                  width: 6,
                },

                "&::-webkit-scrollbar-thumb": {
                  background: "#7e22ce",
                  borderRadius: 10,
                },
              }}
            >
              {expenses.map((expense) => (
                <Box
                  key={expense.id}
                  onMouseEnter={() => setHoveredId(expense.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  sx={{
                    position: "relative",
                    p: 2,
                    mb: 1.5,
                    borderRadius: 4,
                    background:
                      "linear-gradient(135deg, rgba(126,34,206,0.30), rgba(91,33,182,0.12))",
                    border: "1px solid rgba(216,180,254,0.12)",
                    transition: "all 0.25s ease",

                    "&:hover": {
                      transform: "translateX(-5px)",
                      boxShadow: "0px 0px 16px rgba(168,85,247,0.25)",
                    },
                  }}
                >
                  <Typography
                    sx={{
                      color: "#faf5ff",
                      fontWeight: 600,
                    }}
                  >
                    {expense.title}
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      fontWeight: 700,
                      color:
                        expense.type === "credit"
                          ? "#60a5fa"
                          : "#f87171",
                    }}
                  >
                    {expense.type === "credit" ? "+" : "-"}₹
                    {expense.amount}
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      fontSize: "0.78rem",
                      color: "#c4b5fd",
                    }}
                  >
                    {expense.date}
                  </Typography>

                  {/* Hover Action Buttons */}
                  <Fade in={hoveredId === expense.id}>
                    <Box
                      sx={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        display: "flex",
                        gap: 1,
                      }}
                    >
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          sx={{
                            bgcolor: "rgba(168,85,247,0.16)",
                            color: "#e9d5ff",

                            "&:hover": {
                              bgcolor: "#7e22ce",
                            },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          sx={{
                            bgcolor: "rgba(239,68,68,0.14)",
                            color: "#f87171",

                            "&:hover": {
                              bgcolor: "#dc2626",
                              color: "#fff",
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Fade>
                </Box>
              ))}
            </Box>
          </Box>
        </Paper>

        {/* Floating Round Toggle Button */}
        <IconButton
          onClick={() => setOpen(!open)}
          sx={{
            position: "absolute",
            top: "50%",
            left: -50,
            transform: "translateY(-50%)",
            width: 58,
            height: 58,
            borderRadius: "50%",
            bgcolor: "#9333ea",
            color: "white",
            border: "3px solid #2e1065",
            boxShadow: "0px 0px 18px rgba(168,85,247,0.45)",
            transition: "all 0.3s ease",

            "&:hover": {
              bgcolor: "#7e22ce",
              transform: "translateY(-50%) scale(1.08)",
            },
          }}
        >
          {open ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>
    </Box>
  );
};

export default RecentExpensesDrawer;