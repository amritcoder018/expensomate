
import {
  Box,
  TextField,
  Typography,
  IconButton,
} from "@mui/material";

import {
  Edit,
  Close,
  Check,
} from "@mui/icons-material";

import {  useState } from "react";

interface Expense {
  id: string;
  expenseName: string;
  expenseCategory: string;
  expenseAmount: number | null;
  dateOfTransaction: string;
}

type EditModeType = {
  expenseName: boolean;
  expenseCategory: boolean;
  expenseAmount: boolean;
  dateOfTransaction: boolean;
};

export default function ExpenseBlock({
  expense,
  isLastMessage,
  updateExpenses,
}: {
  expense: Expense;
  isLastMessage:boolean;
  updateExpenses: (
    id: string,
    fieldName:string,
    updatedValue:string,

  ) => void;
}) {
  const [editMode, setEditMode] =
    useState<EditModeType>({
      expenseName: false,
      expenseCategory: false,
      expenseAmount: false,
      dateOfTransaction: false,
    });

  const [editedExpense, setEditedExpense] =
    useState<Expense>(expense);

  const closeEdit = (
    field: keyof EditModeType
  ) => {
    setEditMode((prev) => ({
      ...prev,
      [field]: false,
    }));
  };

  const commonHoverStyle = {
    display: "flex",
    alignItems: "center",
    gap: 1,
    mb: 0.5,

    "& .edit-btn": {
      opacity: 0,
      transition: "0.2s",
    },

    "&:hover .edit-btn": {
      opacity: 1,
    },
  };

  const editContainerStyle = {
    display: "flex",
    alignItems: "center",
    gap: 0.5,
    p: 0.8,
    borderRadius: 2,
    backgroundColor: "#f3e8ff",
    border: "1px solid #d8b4fe",
  };

  const textFieldStyle = {
    width: 120,

    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      backgroundColor: "#fff",
      fontSize: "0.85rem",
      height: 36,

      "& fieldset": {
        borderColor: "#c084fc",
      },

      "&:hover fieldset": {
        borderColor: "#a855f7",
      },

      "&.Mui-focused fieldset": {
        borderColor: "#7B1FA2",
      },
    },

    "& .MuiInputBase-input": {
      padding: "8px 10px",
    },
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 1,
        p: 2,
        borderRadius: 2,
        backgroundColor: "#f5f5f5",
        boxShadow: 1,

        "&:hover": {
          boxShadow: 3,
        },
      }}
    >
      <Box>
        {/* Expense Name */}
        <Box sx={commonHoverStyle}>
          {editMode.expenseName ? (
            <Box sx={editContainerStyle}>
              <TextField
                size="small"
                value={editedExpense.expenseName}
                onChange={(e) =>
                  setEditedExpense((prev) => ({
                    ...prev,
                    expenseName:
                      e.target.value,
                  }))
                }
                sx={textFieldStyle}
              />

              <IconButton
                size="small"
                onClick={() =>{
                  closeEdit(
                    "expenseName"
                  );}
                }
                sx={{ color: "#d32f2f" }}
              >
                <Close fontSize="small" />
              </IconButton>

              <IconButton
                size="small"
                onClick={() =>{
                     updateExpenses(expense.id,"expenseName",editedExpense.expenseName);
                  closeEdit(
                    "expenseName"
                  );}
                }
                sx={{ color: "#2e7d32" }}
              >
                <Check fontSize="small" />
              </IconButton>
            </Box>
          ) : (
            <>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600,marginRight:1 }}
              >
                {
                  editedExpense.expenseName
                }
              </Typography>

              {isLastMessage&&<IconButton
                size="small"
                className="edit-btn"
                onClick={() =>
                  setEditMode((prev) => ({
                    ...prev,
                    expenseName: true,
                  }))
                }
                sx={{
                  color: "#7B1FA2",
                }}
              >
                <Edit fontSize="small" />
              </IconButton>}
            </>
          )}
        </Box>

        {/* Expense Category */}
        <Box sx={commonHoverStyle}>
          {editMode.expenseCategory ? (
            <Box sx={editContainerStyle}>
              <TextField
                size="small"
                value={
                  editedExpense.expenseCategory
                }
                onChange={(e) =>
                  setEditedExpense((prev) => ({
                    ...prev,
                    expenseCategory:
                      e.target.value,
                  }))
                }
                sx={textFieldStyle}
              />

              <IconButton
                size="small"
                onClick={() =>
                  closeEdit(
                    "expenseCategory"
                  )
                }
                sx={{ color: "#d32f2f" }}
              >
                <Close fontSize="small" />
              </IconButton>

              <IconButton
                size="small"
                onClick={() =>{
                     updateExpenses(expense.id,"expenseCategory",editedExpense.expenseCategory);
                  closeEdit(
                    "expenseCategory"
                  )}
                }
                sx={{ color: "#2e7d32" }}
              >
                <Check fontSize="small" />
              </IconButton>
            </Box>
          ) : (
            <>
              <Typography
                variant="body2"
                sx={{
                  color:
                    "text.secondary",
                   marginRight:1
                }}
              >
                {
                  editedExpense.expenseCategory
                }
              </Typography>

              {isLastMessage&&<IconButton
                size="small"
                className="edit-btn"
                onClick={() =>
                  setEditMode((prev) => ({
                    ...prev,
                    expenseCategory: true,
                  }))
                }
                sx={{
                  color: "#7B1FA2",
                }}
              >
                <Edit fontSize="small" />
              </IconButton>}
            </>
          )}
        </Box>
      </Box>

      <Box>
        {/* Expense Amount */}
        <Box sx={commonHoverStyle}>
          {editMode.expenseAmount ? (
            <Box sx={editContainerStyle}>
              <TextField
                size="small"
                type="number"
                value={
                  editedExpense.expenseAmount ??
                  ""
                }
                onChange={(e) => {
                  const value =
                    e.target.value;

                  if (
                    /^\d*$/.test(value)
                  ) {
                    setEditedExpense(
                      (prev) => ({
                        ...prev,
                        expenseAmount:
                          value === ""
                            ? null
                            : Number(
                                value
                              ),
                      })
                    );
                  }
                }}
                sx={{
                  ...textFieldStyle,
                  width: 90,

                  "& input[type=number]::-webkit-outer-spin-button":
                    {
                      WebkitAppearance:
                        "none",
                      margin: 0,
                    },

                  "& input[type=number]::-webkit-inner-spin-button":
                    {
                      WebkitAppearance:
                        "none",
                      margin: 0,
                    },

                  "& input[type=number]":
                    {
                      MozAppearance:
                        "textfield",
                    },
                }}
              />

              <IconButton
                size="small"
                onClick={() =>
                  closeEdit(
                    "expenseAmount"
                  )
                }
                sx={{ color: "#d32f2f" }}
              >
                <Close fontSize="small" />
              </IconButton>

              <IconButton
                size="small"
                onClick={() =>{
                     updateExpenses(expense.id,"expenseAmount",editedExpense.expenseAmount+"");
                  closeEdit(
                    "expenseAmount"
                  )}
                }
                sx={{ color: "#2e7d32" }}
              >
                <Check fontSize="small" />
              </IconButton>
            </Box>
          ) : (
            <>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600 }}
              >
                ₹
                {editedExpense.expenseAmount?.toFixed(
                  2
                ) || "0.00"}
              </Typography>

              {isLastMessage&&<IconButton
                size="small"
                className="edit-btn"
                onClick={() =>
                  setEditMode((prev) => ({
                    ...prev,
                    expenseAmount: true,
                  }))
                }
                sx={{
                  color: "#7B1FA2",
                }}
              >
                <Edit fontSize="small" />
              </IconButton>}
            </>
          )}
        </Box>

        {/* Transaction Date */}
        <Box sx={commonHoverStyle}>
          {editMode.dateOfTransaction ? (
            <Box sx={editContainerStyle}>
              <TextField
                size="small"
                type="date"
                value={
                  editedExpense.dateOfTransaction
                }
                onChange={(e) =>
                  setEditedExpense((prev) => ({
                    ...prev,
                    dateOfTransaction:
                      e.target.value,
                  }))
                }
                sx={{
                  ...textFieldStyle,
                  width: 140,
                }}
              />

              <IconButton
                size="small"
                onClick={() =>
                  closeEdit(
                    "dateOfTransaction"
                  )
                }
                sx={{ color: "#d32f2f" }}
              >
                <Close fontSize="small" />
              </IconButton>

              <IconButton
                size="small"
                onClick={() =>{
                     updateExpenses(expense.id,"dateOfTransaction",editedExpense.dateOfTransaction);
                  closeEdit(
                    "dateOfTransaction"
                  )}
                }
                sx={{ color: "#2e7d32" }}
              >
                <Check fontSize="small" />
              </IconButton>
            </Box>
          ) : (
            <>
              <Typography
                variant="caption"
                sx={{
                  color:
                    "text.secondary",
                }}
              >
                {
                  editedExpense.dateOfTransaction
                }
              </Typography>

             {isLastMessage&&<IconButton
                size="small"
                className="edit-btn"
                onClick={() =>
                  setEditMode((prev) => ({
                    ...prev,
                    dateOfTransaction: true,
                  }))
                }
                sx={{
                  color: "#7B1FA2",
                }}
              >
                <Edit fontSize="small" />
              </IconButton>}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
