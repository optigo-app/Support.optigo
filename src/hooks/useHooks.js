import { useState, useEffect } from "react";

export const useMultiToggle = (initialState = {}) => {
	const [toggles, setToggles] = useState(initialState);

	const toggle = (key) => {
		setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
	};

	return [toggles, toggle];
};

export const useLocalStorage = (key, initialValue) => {
	const [storedValue, setStoredValue] = useState(() => {
		try {
			const item = window.localStorage.getItem(key);
			return item ? JSON.parse(item) : initialValue;
		} catch (error) {
			console.error("Error reading localStorage key", key, error);
			return initialValue;
		}
	});

	const setValue = (value) => {
		try {
			const valueToStore = value instanceof Function ? value(storedValue) : value;
			setStoredValue(valueToStore);
			window.localStorage.setItem(key, JSON.stringify(valueToStore));
		} catch (error) {
			console.error("Error setting localStorage key", key, error);
		}
	};

	useEffect(() => {
		const handleStorageChange = () => {
			try {
				const item = window.localStorage.getItem(key);
				setStoredValue(item ? JSON.parse(item) : initialValue);
			} catch (error) {
				console.error("Error syncing localStorage key", key, error);
			}
		};

		window.addEventListener("storage", handleStorageChange);
		return () => window.removeEventListener("storage", handleStorageChange);
	}, [key, initialValue]);

	return [storedValue, setValue];
};
