// Login.js
import React, { useState } from "react";
import { Box, Button, TextField, Typography, Stack, Card, Divider } from "@mui/material";
import { useAuth } from "../context/UseAuth";
import { useNavigate } from "react-router-dom";

export default function Login() {
	const [form, setForm] = useState({
		username: "",
		password: "",
		role: "employee",
	});
	const [errors, setErrors] = useState({});
	const { setUser } = useAuth();
	const navigate = useNavigate();

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const validate = () => {
		const newErrors = {};
		if (!form.username) newErrors.username = "Username is required.";
		if (!form.password) newErrors.password = "Password is required.";
		if (!form.role) newErrors.role = "role is required.";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!validate()) return;

		// Simulated login success (replace with API later)
		// const loggedInUser = {
		//   name: form.username,
		//   email: `${form.username.toLowerCase()}@example.com`,
		//   role: form?.role, // or determine based on login
		// };

		// setUser(loggedInUser);
		navigate("/");
	};

	return (
		<Box
			sx={{
				minHeight: "100vh",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				px: 2,
				background: "linear-gradient(to right, #f8f9fa, #e9ecef)",
			}}
		>
			<Card elevation={3} sx={{ p: 4, width: "100%", maxWidth: 400, borderRadius: 2 }}>
				<Stack spacing={2} component="form" onSubmit={handleSubmit}>
					<Typography variant="h5" mb={3} fontWeight={600} textAlign="center">
						Login
					</Typography>

					<TextField label="Username" name="username" fullWidth value={form.username} onChange={handleChange} error={!!errors.username} helperText={errors.username} />

					<TextField label="Password" type="password" name="password" fullWidth value={form.password} onChange={handleChange} error={!!errors.password} helperText={errors.password} />
					<TextField label="role" type="text" name="role" fullWidth value={form.role} onChange={handleChange} error={!!errors.role} helperText={errors.role} />

					<Button variant="contained" fullWidth type="submit" size="large">
						Log In
					</Button>

					<Divider />
				</Stack>
			</Card>
		</Box>
	);
}
