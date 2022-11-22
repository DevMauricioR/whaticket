import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import openSocket from "../../services/socket-io";

import { toast } from "react-toastify";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { useTranslation } from "react-i18next";

const useAuth = () => {
	const { i18n } = useTranslation();
	const navigate  = useNavigate();
	const [isAuth, setIsAuth] = useState(false);
	const [loading, setLoading] = useState(true);
	const [user, setUser] = useState({});

	api.interceptors.request.use(
		config => {
			const token = localStorage.getItem("token");
			if (token) {
				config.headers["Authorization"] = `Bearer ${JSON.parse(token)}`;
				setIsAuth(true);
			}
			return config;
		},
		error => {
			Promise.reject(error);
		}
	);

	api.interceptors.response.use(
		response => {
			return response;
		},
		async error => {
			const originalRequest = error.config;
			if (error?.response?.status === 403 && !originalRequest._retry) {
				originalRequest._retry = true;

				const { data } = await api.post("/auth/refresh_token");
				if (data) {
					localStorage.setItem("token", JSON.stringify(data.token));
					api.defaults.headers.Authorization = `Bearer ${data.token}`;
				}
				return api(originalRequest);
			}
			if (error?.response?.status === 401) {
				localStorage.removeItem("token");
				api.defaults.headers.Authorization = undefined;
				setIsAuth(false);
			}
			return Promise.reject(error);
		}
	);

	useEffect(() => {
		const token = localStorage.getItem("token");
		(async () => {
			if (token) {
				try {
					const { data } = await api.post("/auth/refresh_token");
					api.defaults.headers.Authorization = `Bearer ${data.token}`;
					setIsAuth(true);
					setUser(data.user);
					i18n.changeLanguage(data.user.lang);
				} catch (err) {
					toastError(err);
				}
			}
			setLoading(false);
		})();
// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		const socket = openSocket();

		socket.on(`user${user.companyId}`, data => {
			if (data.action === "update" && data.user.id === user.id) {
				setUser(data.user);
			}
		});

		return () => {
			socket.disconnect();
		};
	}, [user]);

	const handleLogin = async userData => {
		setLoading(true);

		try {
			const { data } = await api.post("/auth/login", userData);
			localStorage.setItem("token", JSON.stringify(data.token));
			api.defaults.headers.Authorization = `Bearer ${data.token}`;
			setUser(data.user);
			i18n.changeLanguage(data.user.lang);
			setIsAuth(true);
			toast.success(i18n.t("auth.toasts.success"));
			navigate.push("/tickets");
			setLoading(false);
			return true;
		} catch (err) {
			toastError(err);
			setLoading(false);
			return false;
		}
	};

	const handleLogout = async () => {
		setLoading(true);

		try {
			await api.delete("/auth/logout");
			setIsAuth(false);
			setUser({});
			localStorage.removeItem("token");
			api.defaults.headers.Authorization = undefined;
			setLoading(false);
			navigate.push("/login");
		} catch (err) {
			toastError(err);
			setLoading(false);
		}
	};

	return { isAuth, user, loading, handleLogin, handleLogout };
};

export default useAuth;
