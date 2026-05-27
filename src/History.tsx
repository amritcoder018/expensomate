import React, { useMemo, useState } from "react";

import {
  Box,
  Button,
  Card,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import Grid from "@mui/material/Grid";

import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

interface Expense {
  id: number;
  title: string;
  amount: number;
  date: string;
  type: "CREDIT" | "DEBIT";
}

const transactions: Expense[] = [
  {
    id: 1,
    title: "Amazon Shopping",
    amount: 2499,
    date: "26 May 2026",
    type: "DEBIT",
  },
  {
    id: 2,
    title: "Salary Credited",
    amount: 45000,
    date: "25 May 2026",
    type: "CREDIT",
  },
  {
    id: 3,
    title: "Electricity Bill",
    amount: 1800,
    date: "24 May 2026",
    type: "DEBIT",
  },
  {
    id: 4,
    title: "Freelance Payment",
    amount: 12000,
    date: "23 May 2026",
    type: "CREDIT",
  },
  {
    id: 5,
    title: "Restaurant",
    amount: 850,
    date: "22 May 2026",
    type: "DEBIT",
  },
  {
    id: 6,
    title: "Stock Profit",
    amount: 5200,
    date: "21 May 2026",
    type: "CREDIT",
  },
  {
    id: 7,
    title: "Gym Membership",
    amount: 1500,
    date: "20 May 2026",
    type: "DEBIT",
  },
];

const ITEMS_PER_PAGE = 5;

const History: React.FC = () => {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(
    transactions.length / ITEMS_PER_PAGE
  );

  const paginatedTransactions = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;

    return transactions.slice(start, end);
  }, [page]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(to bottom right, #faf5ff, #f3e8ff)",
        py: 4,
      }}
    >
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{mb: 4}}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: "#5B21B6",
              mb: 1,
            }}
          >
            Transaction History
          </Typography>

          <Typography
            sx={{
              color: "#7E22CE",
            }}
          >
            View all your recent transactions
          </Typography>
        </Box>

        {/* Transaction List */}
        <Stack spacing={2}>
          {paginatedTransactions.map((expense) => {
            const isCredit =
              expense.type === "CREDIT";

            return (
              <Card
                key={expense.id}
                elevation={2}
                sx={{
                  borderRadius: "18px",
                  px: 3,
                  py: 2.2,
                  backgroundColor: "#ffffff",
                  border:
                    "1px solid rgba(168,85,247,0.12)",
                  transition: "0.2s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow:
                      "0 10px 24px rgba(124,58,237,0.12)",
                  },
                }}
              >
                <Grid
                  container
                  sx={{ flexDirection: { xs: "column", sm: "row" },alignItems:"center",justifyContent:"space-between",spacing:2 }}
                >
                  {/* Left Section */}
                  <Grid
                    size={{
                      xs: 12,
                      sm: 8,
                    }}
                  >
                    <Stack
                    sx={{flexDirection: {xs:"column",sm:"row"},alignItems:"center",spacing:2}}>
                      {/* Icon */}
                      <Box
                        sx={{
                          width: 52,
                          height: 52,
                          borderRadius: "14px",
                          backgroundColor: isCredit
                            ? "rgba(59,130,246,0.12)"
                            : "rgba(239,68,68,0.12)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {isCredit ? (
                          <ArrowDownwardIcon
                            sx={{
                              color: "#2563EB",
                            }}
                          />
                        ) : (
                          <ArrowUpwardIcon
                            sx={{
                              color: "#DC2626",
                            }}
                          />
                        )}
                      </Box>

                      {/* Text */}
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            color: "#4C1D95",
                            fontSize: "1rem",
                          }}
                        >
                          {expense.title}
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{
                            color: "#8B5CF6",
                            mt: 0.5,
                          }}
                        >
                          {expense.date}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>

                  {/* Right Section */}
                  <Grid
                    size={{
                      xs: 12,
                      sm: 4,
                    }}
                  >
                    <Box
                      sx={{
                        textAlign: {
                          xs: "left",
                          sm: "right",
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: "1.15rem",
                          color: isCredit
                            ? "#2563EB"
                            : "#DC2626",
                        }}
                      >
                        {isCredit ? "+" : "-"} ₹
                        {expense.amount}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          color: isCredit
                            ? "#2563EB"
                            : "#DC2626",
                          fontWeight: 600,
                          mt: 0.5,
                        }}
                      >
                        {expense.type}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Card>
            );
          })}
        </Stack>

        {/* Pagination */}
        <Divider
          sx={{
            my: 4,
            borderColor: "#E9D5FF",
          }}
        />

        <Stack
        sx={{direction: {xs:"column",sm:"row"},alignItems:"center",justifyContent:"center",spacing:2,flexWrap:"wrap"}}>
          <Button
            variant="contained"
            disabled={page === 1}
            onClick={() =>
              setPage((prev) => prev - 1)
            }
            sx={{
              background:
                "linear-gradient(135deg, #7E22CE, #A855F7)",
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 700,
              px: 3,
            }}
          >
            Previous
          </Button>

          <Typography
            sx={{
              fontWeight: 700,
              color: "#5B21B6",
            }}
          >
            Page {page} of {totalPages}
          </Typography>

          <Button
            variant="contained"
            disabled={page === totalPages}
            onClick={() =>
              setPage((prev) => prev + 1)
            }
            sx={{
              background:
                "linear-gradient(135deg, #7E22CE, #A855F7)",
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 700,
              px: 3,
            }}
          >
            Next
          </Button>
        </Stack>
      </Container>
    </Box>
  );
};

export default History;